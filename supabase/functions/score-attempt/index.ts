import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

// Server-authoritative test scoring + access gate.
//
// Receives a submitted attempt (paper key + per-question answers), verifies
// the user may take this paper (free trial paper, or an active
// subscription), scores it against the private `question_keys` table
// (correct_answer/solution are NOT exposed through the Data API), records
// the attempt row and returns the result + solutions for that paper only.
//
// Clients never see the answer key before a submission is scored.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Mirrors the client's old dedupe window: a submit that re-runs (StrictMode
// double effect, refresh, backfill) within this window is treated as the
// same attempt, not a retake, so no duplicate row is created.
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

// Rate limit: one account may not invoke the scoring endpoint more than
// SCORE_CALL_LIMIT times per rolling hour (each call returns that paper's
// answer keys). Legit flows are 1 call per submission with an occasional
// retry, so 10/hour is generous while capping key-download spam.
const SCORE_CALL_LIMIT = 10;
const SCORE_CALL_WINDOW_MS = 60 * 60 * 1000;

// Anon client: used ONLY to verify the caller's JWT.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Service-role client: reads answer keys + papers and writes attempts.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-warmup',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Bearer <supabase JWT> -> the authenticated user or null.
async function getUser(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

interface AnswerInput {
  id: number;
  answer: string | null;
}

interface ScoredQuestion {
  id: number;
  number: number;
  section: string;
  outcome: 'correct' | 'incorrect' | 'unattempted';
  score: number;
  marks: number;
}

// The paper row + only the question metadata scoring needs.
interface ScoringPaper {
  key: string;
  title: string | null;
  full_title: string | null;
  is_trial: boolean;
  questions: {
    id: number;
    number: number;
    type: string | null;
    marks: number | null;
    negative_marks: number | null;
    sections: { name: string } | null;
  }[];
}

interface AnswerKey {
  correctAnswer: string;
  solution: string | null;
}

// Papers and their answer keys are immutable once seeded, and one warm isolate
// serves many submissions, so both are held for the isolate's lifetime. This
// takes the common path from 4 database round trips to 2 — and the two it drops
// are the expensive ones (a nested papers→questions→sections join and a
// 180-row key fetch) at exactly the moment a whole hall submits at once.
//
// Only immutable data is cached. The rate-limit count, the subscription check
// and the dedupe lookup stay live on every call: caching those would let an
// expired subscription keep working until the isolate recycled.
//
// Growth is bounded by the paper catalogue, not by traffic — a few dozen keys
// holding ~30 KB each — so there is nothing to evict.
//
// OPERATIONAL NOTE: because this survives between requests, correcting an
// answer key in the database is no longer picked up immediately. Warm isolates
// keep serving the old key until they recycle. After any change to `papers`,
// `questions` or `question_keys`, redeploy this function
// (`supabase functions deploy score-attempt`) to drop every cache.
const paperCache = new Map<string, ScoringPaper>();
const answerKeyCache = new Map<string, Map<number, AnswerKey>>();

// Chapter tests are static JSON bundles (public/chapters/*.json), not paper
// rows, so there is no papers row to look up. Trial chapters are disabled:
// every chapter test requires an active subscription. Kept as an (empty) set
// so the gate below keeps working if trial chapters are ever re-enabled.
const TRIAL_CHAPTERS = new Set<string>([]);

// Upper bound on questions per chapter submission. Chapter tests top out
// around 25 questions; the cap only stops key-harvest abuse (each call
// returns that many answer keys).
const MAX_CHAPTER_QUESTIONS = 60;

async function loadScoringPaper(paperKey: string): Promise<ScoringPaper | null> {
  const cached = paperCache.get(paperKey);
  if (cached) return cached;

  // No answer columns here. question_options are intentionally not fetched
  // either — scoring only needs type/marks plus the keys.
  const { data, error } = await supabaseAdmin
    .from('papers')
    .select(
      `key, title, full_title, is_trial, questions (
        id, number, type, marks, negative_marks,
        sections ( name )
      )`
    )
    .eq('key', paperKey)
    .single();

  if (error || !data) return null;

  const paper = data as unknown as ScoringPaper;
  paperCache.set(paperKey, paper);
  return paper;
}

// Returns null when the lookup failed, which the caller must NOT read as "this
// paper has no keys" — that would score every answer wrong and then cache the
// wrong result for the isolate's lifetime.
async function loadAnswerKeys(
  paperKey: string,
  questionIds: number[]
): Promise<Map<number, AnswerKey> | null> {
  const cached = answerKeyCache.get(paperKey);
  if (cached) return cached;

  const { data, error } = await supabaseAdmin
    .from('question_keys')
    .select('question_id, correct_answer, solution')
    .in('question_id', questionIds);

  if (error || !data || data.length === 0) {
    console.error('answer key load failed', { paperKey, error, rows: data?.length ?? 0 });
    return null;
  }

  const keys = new Map<number, AnswerKey>(
    data.map((k: { question_id: number; correct_answer: string; solution: string | null }) => [
      k.question_id,
      { correctAnswer: k.correct_answer, solution: k.solution },
    ])
  );
  answerKeyCache.set(paperKey, keys);
  return keys;
}

// Scoring mirrors the client's former computeAttemptResult exactly:
// +marks for a correct answer, negative marks for a wrong answer, 0 for
// unattempted; MCQ answers compared case-insensitively, numerical answers
// trimmed. Multi-answer keys are comma-separated labels ("B,C"). An EMPTY
// key means the question was awarded to all candidates by the official key
// (bonus / answer withheld): anyone who attempted it gets full marks. A
// question with no key row at all is treated the same way.
//
// The key is passed in rather than hung off the question, because question
// objects come from a module-scope cache and are shared between requests.
function scoreQuestion(
  q: { type: string | null; marks: number | null; negative_marks: number | null },
  answer: string | null,
  key: AnswerKey | undefined
): { outcome: ScoredQuestion['outcome']; score: number } {
  const isMCQ = q.type === 'mcq' || !q.type;
  const userAns = isMCQ ? (answer ?? '') : (answer ?? '').trim();
  const marks = Number(q.marks ?? 4);
  const negativeMarks = Number(q.negative_marks ?? -1);

  if (userAns === '') return { outcome: 'unattempted', score: 0 };
  const correct = key?.correctAnswer ?? '';
  if (correct === '') return { outcome: 'correct', score: marks };
  const accepted = correct.split(',').map((c: string) => c.trim().toLowerCase());
  if (accepted.includes(userAns.toLowerCase())) {
    return { outcome: 'correct', score: marks };
  }
  return { outcome: 'incorrect', score: negativeMarks };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Keep-warm ping, sent by the client only when a submission is imminent
  // (submit dialog open, or the clock nearly out). Returns immediately without
  // auth, rate limiting or any DB work, so the real submission that follows
  // doesn't pay the cold-start penalty.
  if (req.headers.get('x-warmup') === '1') return json({ ok: true }, 204);

  const user = await getUser(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const { paperKey, testType = 'paper', title, timeSpent, answers } = body as {
    paperKey?: string;
    testType?: string;
    title?: string;
    timeSpent?: number;
    answers?: AnswerInput[];
  };
  if (!paperKey || typeof paperKey !== 'string') {
    return json({ error: 'Missing paper key' }, 400);
  }
  if (!Array.isArray(answers)) {
    return json({ error: 'Missing answers' }, 400);
  }

  // Server-side access gate: the trial paper is free for any signed-in user;
  // every other paper requires an active subscription. The trial flag lives
  // on the paper row (papers.is_trial) so it works for JEE and NEET alike.

  // Rate limit: every call is logged in scoring_calls (service-role only, no
  // public access) and capped per user per rolling hour. Pruning the log used
  // to happen here too; a nightly pg_cron job owns it now, so the request path
  // no longer scans the table on every submission.
  const rateSince = new Date(Date.now() - SCORE_CALL_WINDOW_MS).toISOString();
  const { count } = await supabaseAdmin
    .from('scoring_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', rateSince);
  if ((count ?? 0) >= SCORE_CALL_LIMIT) {
    return json({ error: 'Submission limit reached. Please try again later.', code: 'RATE_LIMITED' }, 429);
  }

  // The log insert and the paper load are independent, so they overlap.
  // Chapter tests have no papers row (static JSON bundles), so the paper
  // load is skipped for them — their questions resolve from submitted ids
  // further below.
  const isChapter = testType === 'chapter';
  const [logResult, paper] = await Promise.all([
    supabaseAdmin.from('scoring_calls').insert({ user_id: user.id }),
    isChapter ? Promise.resolve(null) : loadScoringPaper(paperKey),
  ]);

  if (logResult.error) {
    console.error('scoring log insert failed', logResult.error);
    return json({ error: 'Failed to record submission' }, 502);
  }

  // Resolved paper (full papers) or chapter bundle (chapter tests).
  let scoringPaper: ScoringPaper | null = paper;
  let isTrial = paper?.is_trial ?? false;

  if (isChapter) {
    if (!/^[a-z0-9-]+$/i.test(paperKey)) {
      return json({ error: 'Invalid chapter key' }, 400);
    }
    const chapterIds = [...new Set(answers.map((a) => Number(a.id)).filter((id) => Number.isFinite(id) && id > 0))];
    if (chapterIds.length === 0 || chapterIds.length > MAX_CHAPTER_QUESTIONS) {
      return json({ error: 'Invalid chapter submission' }, 400);
    }
    const { data: chapterQuestions, error: chapterError } = await supabaseAdmin
      .from('questions')
      .select('id, number, type, marks, negative_marks, sections ( name )')
      .in('id', chapterIds);
    if (chapterError || !chapterQuestions || chapterQuestions.length === 0) {
      return json({ error: 'Paper not found' }, 404);
    }
    scoringPaper = {
      key: paperKey,
      title: title ?? paperKey,
      full_title: title ?? paperKey,
      is_trial: TRIAL_CHAPTERS.has(paperKey),
      questions: (chapterQuestions as unknown as ScoringPaper['questions']).slice().sort((a, b) => a.number - b.number),
    };
    isTrial = scoringPaper.is_trial;
  }

  if (!scoringPaper) {
    return json({ error: 'Paper not found' }, 404);
  }

  if (!isTrial) {
    const now = new Date().toISOString();
    const { data: subs, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('ends_at', now)
      .limit(1);
    if (subError) {
      console.error('subscription check failed', subError);
      return json({ error: 'Failed to verify subscription' }, 502);
    }
    if (!subs || subs.length === 0) {
      return json({ error: 'An active subscription is required for this paper', code: 'NO_SUBSCRIPTION' }, 403);
    }
  }

  const questions = scoringPaper.questions ?? [];
  const questionIds = questions.map((q) => q.id);

  // A failed key load must not fall through to an empty map: scoreQuestion
  // reads a blank correct_answer as "awarded to all candidates", so an empty
  // map would silently give every student full marks and write that to
  // attempts. Fail the request instead. Chapter bundles are cached under a
  // distinct prefix so a chapter id can never collide with a paper key.
  const keys = await loadAnswerKeys(isChapter ? `chapter:${paperKey}` : paperKey, questionIds);
  if (!keys) {
    return json({ error: 'Failed to load answer keys' }, 502);
  }

  const answerById = new Map<number, string | null>(answers.map((a) => [a.id, a.answer ?? null]));

  const sections = new Map<string, any>();
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalScore = 0;
  const maxScore = questions.reduce((sum, q) => sum + Number(q.marks ?? 4), 0);
  const questionOutcomes: Record<string, 'correct' | 'incorrect' | 'unattempted'> = {};

  for (const q of questions) {
    const { outcome, score } = scoreQuestion(q, answerById.get(q.id) ?? null, keys.get(q.id));

    if (outcome === 'correct') totalCorrect++;
    else if (outcome === 'incorrect') totalIncorrect++;
    else totalUnattempted++;
    totalScore += score;
    questionOutcomes[String(q.id)] = outcome;

    const section = q.sections?.name ?? 'General';
    const sec = sections.get(section) ?? {
      section,
      score: 0,
      maxScore: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      accuracy: 0,
    };
    sec.score += score;
    sec.maxScore += Number(q.marks ?? 4);
    if (outcome === 'correct') sec.correct++;
    else if (outcome === 'incorrect') sec.incorrect++;
    else sec.unattempted++;
    sections.set(section, sec);
  }

  const attemptedCount = totalCorrect + totalIncorrect;
  const result = {
    totalScore,
    maxScore,
    totalCorrect,
    totalIncorrect,
    totalUnattempted,
    accuracy: attemptedCount > 0 ? Math.round((totalCorrect / attemptedCount) * 100) : 0,
    sectionBreakdown: [...sections.values()].map((sec) => ({
      ...sec,
      accuracy:
        sec.correct + sec.incorrect > 0
          ? Math.round((sec.correct / (sec.correct + sec.incorrect)) * 100)
          : 0,
    })),
    questionOutcomes,
  };

  const keysPayload: Record<string, { correctAnswer: string; solution: string | null }> = {};
  for (const [id, k] of keys) keysPayload[String(id)] = k;

  // Idempotency: identical aggregates + outcomes recorded in the last few
  // minutes are the same attempt, so we don't insert a duplicate row.
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const canonicalOutcomes = JSON.stringify(
    Object.fromEntries(Object.entries(questionOutcomes).sort(([a], [b]) => a.localeCompare(b)))
  );
  const { data: recent } = await supabaseAdmin
    .from('attempts')
    .select('id, total_score, correct, incorrect, unattempted, question_outcomes')
    .eq('user_id', user.id)
    .eq('paper_key', paperKey)
    .eq('test_type', testType)
    .gte('created_at', since);

  const alreadyRecorded = (recent ?? []).some(
    (r: any) =>
      r.total_score === result.totalScore &&
      r.correct === result.totalCorrect &&
      r.incorrect === result.totalIncorrect &&
      r.unattempted === result.totalUnattempted &&
      JSON.stringify(
        Object.fromEntries(Object.entries(r.question_outcomes ?? {}).sort(([a], [b]) => a.localeCompare(b)))
      ) === canonicalOutcomes
  );

  let attemptId = recent?.[0]?.id ?? null;
  if (!alreadyRecorded) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('attempts')
      .insert({
        user_id: user.id,
        paper_key: paperKey,
        test_type: testType,
        title: title ?? scoringPaper.title ?? paperKey,
        total_score: result.totalScore,
        max_score: result.maxScore,
        correct: result.totalCorrect,
        incorrect: result.totalIncorrect,
        unattempted: result.totalUnattempted,
        accuracy: result.accuracy,
        time_spent: Number.isFinite(timeSpent) ? Math.max(0, Math.round(timeSpent ?? 0)) : 0,
        section_breakdown: result.sectionBreakdown,
        question_outcomes: result.questionOutcomes,
      })
      .select('id')
      .single();
    if (insertError) {
      console.error('attempt insert failed', insertError);
      return json({ error: 'Failed to record attempt' }, 502);
    }
    attemptId = inserted.id;
  }

  return json({ attemptId, result, keys: keysPayload });
});
