import { useEffect, useState } from 'react';
import type { AttemptResult } from '../lib/scoring';
import { loadAttempt } from '../lib/attemptStorage';

// Returns the server-computed score of the user's submitted attempt for a
// paper, if one exists locally. Scores come from the score-attempt edge
// function (stored on the saved attempt at submission time), so the result
// always matches the result screen's marking.
export function useAttemptScore(paperKey: string): AttemptResult | null {
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    const attempt = loadAttempt(paperKey);
    setResult(attempt?.isTestSubmitted ? (attempt.resultPayload?.result ?? null) : null);
  }, [paperKey]);

  return result;
}
