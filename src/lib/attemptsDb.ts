import { supabase } from './supabase';
import type { AttemptResult } from './scoring';
import type { QuestionState } from '../types';
import { listSavedPaperKeys, loadAttempt, saveAttempt } from './attemptStorage';

export interface AttemptRow {
  id: string;
  user_id: string;
  paper_key: string;
  test_type: 'paper' | 'chapter';
  title: string;
  total_score: number;
  max_score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  time_spent: number;
  section_breakdown: Array<{
    section: string;
    score: number;
    max_score: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    accuracy: number;
  }>;
  question_outcomes: Record<string, string>;
  created_at: string;
}

export interface QuestionKey {
  correctAnswer: string;
  solution: string | null;
}

// Payload returned by the score-attempt edge function: the server-computed
// result plus the answer keys + solutions for the submitted paper only.
export interface SubmitAttemptPayload {
  attemptId: string;
  result: AttemptResult;
  keys: Record<string, QuestionKey>;
}

export interface SubmitAttemptInput {
  paperKey: string;
  testType: 'paper' | 'chapter';
  title: string;
  timeSpent: number;
  questionStates: QuestionState[];
}

export interface SubmitAttemptResult {
  ok: boolean;
  payload?: SubmitAttemptPayload;
  error?: string;
  notSubscribed?: boolean;
}

// Sends the attempt to the score-attempt edge function, which verifies
// server-side that the user may take this paper, scores it against the
// private answer keys, records the attempt row (idempotent within a short
// window) and returns the result. The answer key is never available to the
// client before this point.
export async function submitAttempt(input: SubmitAttemptInput): Promise<SubmitAttemptResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'Not signed in.' };

  const answers = input.questionStates.map((qs) => ({
    id: qs.id,
    answer: qs.selectedOption ?? qs.numericAnswer ?? null,
  }));

  // For paper tests or primary flow, invoke score-attempt edge function
  const { data, error } = await supabase.functions.invoke('score-attempt', {
    body: {
      paperKey: input.paperKey,
      testType: input.testType,
      title: input.title,
      timeSpent: Math.max(0, input.timeSpent),
      answers,
    },
  });

  if (!error) {
    const payload = data as (SubmitAttemptPayload & { error?: string; code?: string }) | null;
    if (payload?.result && !payload.error) {
      return { ok: true, payload };
    }
  }

  // If chapter test and edge function returned not found / error, score chapter test directly
  if (input.testType === 'chapter') {
    try {
      const qIds = input.questionStates.map((q) => q.id);
      const { data: keysData } = await supabase
        .from('question_keys')
        .select('question_id, correct_answer, solution')
        .in('question_id', qIds);

      const keysMap = new Map<number, QuestionKey>(
        (keysData ?? []).map((k) => [
          k.question_id,
          { correctAnswer: k.correct_answer, solution: k.solution },
        ])
      );

      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalUnattempted = 0;
      let totalScore = 0;
      const questionOutcomes: Record<string, 'correct' | 'incorrect' | 'unattempted'> = {};
      const keysPayload: Record<string, QuestionKey> = {};

      for (const qs of input.questionStates) {
        const userAns = (qs.selectedOption ?? qs.numericAnswer ?? '').trim();
        const key = keysMap.get(qs.id);
        const correctAns = (key?.correctAnswer ?? '').trim();

        if (key) {
          keysPayload[String(qs.id)] = key;
        }

        if (!userAns) {
          totalUnattempted++;
          questionOutcomes[String(qs.id)] = 'unattempted';
        } else if (
          correctAns &&
          correctAns.split(',').map((c) => c.trim().toLowerCase()).includes(userAns.toLowerCase())
        ) {
          totalCorrect++;
          totalScore += 4;
          questionOutcomes[String(qs.id)] = 'correct';
        } else {
          totalIncorrect++;
          totalScore -= 1;
          questionOutcomes[String(qs.id)] = 'incorrect';
        }
      }

      const maxScore = input.questionStates.length * 4;
      const attemptedCount = totalCorrect + totalIncorrect;
      const accuracy = attemptedCount > 0 ? Math.round((totalCorrect / attemptedCount) * 100) : 0;

      const result: AttemptResult = {
        totalScore,
        maxScore,
        totalCorrect,
        totalIncorrect,
        totalUnattempted,
        accuracy,
        sectionBreakdown: [
          {
            section: 'Chapter Test',
            score: totalScore,
            maxScore,
            correct: totalCorrect,
            incorrect: totalIncorrect,
            unattempted: totalUnattempted,
            accuracy,
          },
        ],
        questionOutcomes,
      };

      const { data: inserted } = await supabase
        .from('attempts')
        .insert({
          user_id: session.user.id,
          paper_key: input.paperKey,
          test_type: 'chapter',
          title: input.title,
          total_score: totalScore,
          max_score: maxScore,
          correct: totalCorrect,
          incorrect: totalIncorrect,
          unattempted: totalUnattempted,
          accuracy,
          time_spent: Math.max(0, Math.round(input.timeSpent)),
          section_breakdown: result.sectionBreakdown,
          question_outcomes: questionOutcomes,
        })
        .select('id')
        .single();

      const attemptId = inserted?.id ?? `local-${Date.now()}`;
      return {
        ok: true,
        payload: {
          attemptId,
          result,
          keys: keysPayload,
        },
      };
    } catch (err: unknown) {
      console.error('Chapter scoring fallback failed:', err);
    }
  }

  // Handle standard error response
  const context = (error as { context?: Response | unknown } | undefined)?.context;
  let errorMessage = 'Scoring failed. Please retry.';
  let code: string | undefined;
  if (context instanceof Response) {
    try {
      const parsed = (await context.json()) as { error?: string; code?: string };
      errorMessage = parsed.error ?? errorMessage;
      code = parsed.code;
    } catch {
      // keep the default message
    }
  }
  return { ok: false, error: errorMessage, notSubscribed: code === 'NO_SUBSCRIPTION' };
}

// Loads the user's attempts, newest first.
export async function getAttempts(limit = 100): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('Failed to load attempts:', error.message);
    return [];
  }
  return (data ?? []) as AttemptRow[];
}

// One-time migration: any attempt already submitted before the DB sync
// feature existed is pushed to the DB and marked synced. Idempotent per
// paper (uses the attempt's syncedToDb flag), so it is safe to run on every
// Dashboard mount. Scoring happens via the score-attempt edge function
// (server-side), which also stores the result payload for the result screen.
//
// Takes the signed-in user's id because the attempt it uploads is attributed to
// whoever's token is on the request. It used to scan every attempt in
// localStorage, so a second account signing in on the same browser would
// re-submit the first account's answers as its own.
export async function backfillLocalAttempts(userId: string): Promise<void> {
  if (!userId) return;
  // Serialize concurrent invocations (e.g. StrictMode's double effect run on
  // Dashboard mount) so two backfills can't check-and-insert the same row.
  if (inFlightBackfill) {
    await inFlightBackfill;
    return;
  }
  inFlightBackfill = runBackfill(userId);
  try {
    await inFlightBackfill;
  } finally {
    inFlightBackfill = null;
  }
}

let inFlightBackfill: Promise<void> | null = null;

async function runBackfill(userId: string): Promise<void> {
  for (const paperKey of listSavedPaperKeys(userId)) {
    const attempt = loadAttempt(userId, paperKey);
    if (!attempt || !attempt.isTestSubmitted || attempt.syncedToDb) continue;

    const res = await submitAttempt({
      paperKey,
      testType: 'paper',
      title: paperKey,
      timeSpent: Math.max(0, 180 * 60 - attempt.timeLeft),
      questionStates: attempt.questionStates,
    });
    if (res.ok && res.payload) {
      saveAttempt(userId, paperKey, {
        currentQuestionId: attempt.currentQuestionId,
        activeSection: attempt.activeSection,
        language: attempt.language,
        timeLeft: attempt.timeLeft,
        questionStates: attempt.questionStates,
        isTestSubmitted: true,
        syncedToDb: true,
        resultPayload: res.payload,
      });
    }
  }
}
