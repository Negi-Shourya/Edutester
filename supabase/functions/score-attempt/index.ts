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
// The scoring_calls log is pruned beyond this age on every call.
const SCORE_LOG_RETENTION_MS = 24 * 60 * 60 * 1000;

// Anon client: used ONLY to verify the caller's JWT.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Service-role client: reads answer keys + papers and writes attempts.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Scoring mirrors the client's former computeAttemptResult exactly:
// +marks for a correct answer, negative marks for a wrong answer, 0 for
// unattempted; MCQ answers compared case-insensitively, numerical answers
// trimmed. Multi-answer keys are comma-separated labels ("B,C"). An EMPTY
// key means the question was awarded to all candidates by the official key
// (bonus / answer withheld): anyone who attempted it gets full marks.
function scoreQuestion(q: any, answer: string | null): { outcome: ScoredQuestion['outcome']; score: number } {
  const isMCQ = q.type === 'mcq' || !q.type;
  const userAns = isMCQ ? (answer ?? '') : (answer ?? '').trim();
  const marks = Number(q.marks ?? 4);
  const negativeMarks = Number(q.negative_marks ?? -1);

  if (userAns === '') return { outcome: 'unattempted', score: 0 };
  const correct = q._key?.correctAnswer ?? '';
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

  // Rate limit: every call is logged in scoring_calls (service-role only,
  // no public access) and capped per user per rolling hour.
  const rateSince = new Date(Date.now() - SCORE_CALL_WINDOW_MS).toISOString();
  const { count } = await supabaseAdmin
    .from('scoring_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', rateSince);
  if ((count ?? 0) >= SCORE_CALL_LIMIT) {
    return json({ error: 'Submission limit reached. Please try again later.', code: 'RATE_LIMITED' }, 429);
  }

  // Best-effort housekeeping keeps the log small; failures are ignored.
  await supabaseAdmin
    .from('scoring_calls')
    .delete()
    .lt('created_at', new Date(Date.now() - SCORE_LOG_RETENTION_MS).toISOString());

  const { error: logError } = await supabaseAdmin.from('scoring_calls').insert({ user_id: user.id });
  if (logError) {
    console.error('scoring log insert failed', logError);
    return json({ error: 'Failed to record submission' }, 502);
  }

  // Load the paper + its questions (no answer columns) and the private keys.
  const { data: paper, error: paperError } = await supabaseAdmin
    .from('papers')
    .select(
      `key, title, full_title, is_trial, questions (
        id, number, type, marks, negative_marks,
        sections ( name ),
        question_options ( position, label, text )
      )`
    )
    .eq('key', paperKey)
    .single();

  if (paperError || !paper) {
    return json({ error: 'Paper not found' }, 404);
  }

  if (!paper.is_trial) {
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

  const questions = paper.questions ?? [];
  const questionIds = questions.map((q: { id: number }) => q.id);

  const { data: keyRows } = await supabaseAdmin
    .from('question_keys')
    .select('question_id, correct_answer, solution')
    .in('question_id', questionIds);

  const keys = new Map(
    (keyRows ?? []).map((k: { question_id: number; correct_answer: string; solution: string | null }) => [
      k.question_id,
      { correctAnswer: k.correct_answer, solution: k.solution },
    ])
  );

  const answerById = new Map<number, string | null>(answers.map((a) => [a.id, a.answer ?? null]));

  const sections = new Map<string, any>();
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalScore = 0;
  const maxScore = questions.reduce((sum: number, q: any) => sum + Number(q.marks ?? 4), 0);
  const questionOutcomes: Record<string, 'correct' | 'incorrect' | 'unattempted'> = {};

  for (const raw of questions) {
    const q = raw as any;
    q._key = keys.get(q.id) ?? { correctAnswer: '', solution: null };
    const { outcome, score } = scoreQuestion(q, answerById.get(q.id) ?? null);

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
        title: title ?? paper.title ?? paperKey,
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
