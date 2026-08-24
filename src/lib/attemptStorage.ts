import type { QuestionState } from '../types';
import type { SubmitAttemptPayload } from './attemptsDb';

export interface SavedAttempt {
  // The account this attempt belongs to. localStorage is shared by every
  // account that signs in on the browser, so ownership has to be recorded in
  // the record itself — see the note on PREFIX below.
  userId: string;
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

// localStorage is scoped to the origin, not to the signed-in account, so the
// key has to carry the user id: keys used to be just `<PREFIX><paperKey>`, and
// every account on the browser therefore shared one attempt per paper. That
// showed the first account's marks to the second, offered its half-finished
// paper as "resume", and — worst — let the backfill re-submit its answers under
// the second account's token.
//
// The id is also stored inside the record and re-checked on read, so a record
// can never be served to the wrong account even if a key were built wrongly.
// Records written before this change have no userId and cannot be attributed to
// anyone; purgeUnownedAttempts() drops them.
const PREFIX = 'edutester_attempt_';

function userPrefix(userId: string): string {
  return `${PREFIX}${userId}_`;
}

function attemptKey(userId: string, paperKey: string): string {
  return `${userPrefix(userId)}${paperKey}`;
}

export function loadAttempt(userId: string, paperKey: string): SavedAttempt | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(attemptKey(userId, paperKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAttempt;
    if (!parsed || parsed.paperKey !== paperKey || parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAttempt(
  userId: string,
  paperKey: string,
  attempt: Omit<SavedAttempt, 'userId' | 'paperKey' | 'savedAt'>
): void {
  // Never write without a known owner: an unowned record is exactly what this
  // module exists to prevent.
  if (!userId) return;
  try {
    const data: SavedAttempt = { ...attempt, userId, paperKey, savedAt: Date.now() };
    localStorage.setItem(attemptKey(userId, paperKey), JSON.stringify(data));
  } catch {
    // Storage unavailable/full — resume feature degrades silently.
  }
}

export function clearAttempt(userId: string, paperKey: string): void {
  if (!userId) return;
  try {
    localStorage.removeItem(attemptKey(userId, paperKey));
  } catch {
    // ignore
  }
}

// Every paper this user has a saved attempt for. Only their own keys are
// visible, so callers cannot reach another account's data.
export function listSavedPaperKeys(userId: string): string[] {
  if (!userId) return [];
  const prefix = userPrefix(userId);
  const paperKeys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) paperKeys.push(key.slice(prefix.length));
    }
  } catch {
    return [];
  }
  return paperKeys;
}

// Returns the most recently saved in-progress (not yet submitted) attempt for
// this user, if any. Used by the user home page to offer a "Resume Test" action.
export function findInProgressAttempt(userId: string): SavedAttempt | null {
  let latest: SavedAttempt | null = null;
  for (const paperKey of listSavedPaperKeys(userId)) {
    const attempt = loadAttempt(userId, paperKey);
    if (!attempt || attempt.isTestSubmitted) continue;
    if (!latest || attempt.savedAt > latest.savedAt) latest = attempt;
  }
  return latest;
}

// Deletes attempt records left by the pre-namespacing scheme, which recorded no
// owner. They cannot be attributed to an account, so they can neither be shown
// nor synced; leaving them would keep the cross-account leak alive for anyone
// who already has them. Submitted attempts are already in the database (that is
// what the dashboard reads), so nothing recoverable is lost — an unfinished
// attempt loses only its resume point.
//
// Safe to call repeatedly. Returns how many records were removed.
export function purgeUnownedAttempts(): number {
  let removed = 0;
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      let hasOwner = false;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? 'null') as SavedAttempt | null;
        hasOwner = typeof parsed?.userId === 'string' && parsed.userId.length > 0;
      } catch {
        // Unparseable: no owner can be established, so it goes too.
      }
      if (!hasOwner) stale.push(key);
    }
    // Collected first — removing while iterating by index skips entries.
    for (const key of stale) {
      localStorage.removeItem(key);
      removed++;
    }
  } catch {
    // Storage unavailable; nothing to clean up.
  }
  return removed;
}
