import type { QuestionState } from '../types';
import type { SubmitAttemptPayload } from './attemptsDb';

export interface SavedAttempt {
  paperKey: string;
  currentQuestionId: number | null;
  activeSection: string;
  language: string;
  timeLeft: number;
  questionStates: QuestionState[];
  isTestSubmitted: boolean;
  savedAt: number;
  // True once this submitted attempt has been pushed to the DB. Prevents
  // duplicate rows when the result screen is re-rendered after a refresh.
  syncedToDb?: boolean;
  // The server-computed result (score + solutions) returned by the
  // score-attempt edge function. Persisted so a refresh after submission
  // re-renders the result screen without another network call.
  resultPayload?: SubmitAttemptPayload | null;
}

const PREFIX = 'edutester_attempt_';

function attemptKey(paperKey: string): string {
  return `${PREFIX}${paperKey}`;
}

export function loadAttempt(paperKey: string): SavedAttempt | null {
  try {
    const raw = localStorage.getItem(attemptKey(paperKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAttempt;
    if (!parsed || parsed.paperKey !== paperKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAttempt(
  paperKey: string,
  attempt: Omit<SavedAttempt, 'paperKey' | 'savedAt'>
): void {
  try {
    const data: SavedAttempt = { ...attempt, paperKey, savedAt: Date.now() };
    localStorage.setItem(attemptKey(paperKey), JSON.stringify(data));
  } catch {
    // Storage unavailable/full — resume feature degrades silently.
  }
}

export function clearAttempt(paperKey: string): void {
  try {
    localStorage.removeItem(attemptKey(paperKey));
  } catch {
    // ignore
  }
}

// Returns the most recently saved in-progress (not yet submitted) attempt, if
// any. Used by the user home page to offer a "Resume Test" action.
export function findInProgressAttempt(): SavedAttempt | null {
  let latest: SavedAttempt | null = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    const paperKey = key.slice(PREFIX.length);
    const attempt = loadAttempt(paperKey);
    if (!attempt || attempt.isTestSubmitted) continue;
    if (!latest || attempt.savedAt > latest.savedAt) latest = attempt;
  }
  return latest;
}
