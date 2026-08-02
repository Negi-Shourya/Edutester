import type { QuestionState } from '../types';

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
