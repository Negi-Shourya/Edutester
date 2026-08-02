import { supabase } from './supabase';
import { computeAttemptResult, type AttemptResult } from './scoring';
import { loadAttempt, saveAttempt } from './attemptStorage';
import { getPaperQuestions } from '../data/questions';

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

export interface NewAttemptInput {
  paperKey: string;
  testType: 'paper' | 'chapter';
  title: string;
  result: AttemptResult;
  timeSpent: number;
}

// Inserts a submitted attempt into the DB (RLS restricts to the owner).
// Returns true on success. Failures are non-fatal — the attempt stays in
// localStorage and can be backfilled later.
export async function saveAttemptResult(input: NewAttemptInput): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn('Attempt not saved: no authenticated user.');
    return false;
  }

  const { data, error } = await supabase.from('attempts').insert({
    user_id: user.id,
    paper_key: input.paperKey,
    test_type: input.testType,
    title: input.title,
    total_score: input.result.totalScore,
    max_score: input.result.maxScore,
    correct: input.result.totalCorrect,
    incorrect: input.result.totalIncorrect,
    unattempted: input.result.totalUnattempted,
    accuracy: input.result.accuracy,
    time_spent: input.timeSpent,
    section_breakdown: input.result.sectionBreakdown.map((s) => ({
      section: s.section,
      score: s.score,
      max_score: s.maxScore,
      correct: s.correct,
      incorrect: s.incorrect,
      unattempted: s.unattempted,
      accuracy: s.accuracy,
    })),
    question_outcomes: input.result.questionOutcomes,
  });
  if (error) {
    console.warn('Failed to save attempt to DB:', error.message);
    return false;
  }
  return !!data;
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
// Dashboard mount.
export async function backfillLocalAttempts(): Promise<void> {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('edutester_attempt_')) keys.push(key);
  }

  for (const storageKey of keys) {
    const paperKey = storageKey.replace('edutester_attempt_', '');
    const attempt = loadAttempt(paperKey);
    if (!attempt || !attempt.isTestSubmitted || attempt.syncedToDb) continue;

    try {
      const data = await getPaperQuestions(paperKey);
      const result = computeAttemptResult(data.questions, attempt.questionStates);
      const ok = await saveAttemptResult({
        paperKey,
        testType: 'paper',
        title: data.paper.fullTitle,
        result,
        timeSpent: Math.max(0, 180 * 60 - attempt.timeLeft),
      });
      if (ok) {
        attempt.syncedToDb = true;
        saveAttempt(paperKey, {
          currentQuestionId: attempt.currentQuestionId,
          activeSection: attempt.activeSection,
          language: attempt.language,
          timeLeft: attempt.timeLeft,
          questionStates: attempt.questionStates,
          isTestSubmitted: true,
          syncedToDb: true,
        });
      }
    } catch {
      // Question data unavailable — skip; will retry on next visit.
    }
  }
}
