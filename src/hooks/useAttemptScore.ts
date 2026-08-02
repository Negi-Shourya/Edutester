import { useEffect, useState } from 'react';
import { computeAttemptResult, type AttemptResult } from '../lib/scoring';
import { loadAttempt } from '../lib/attemptStorage';
import { getPaperQuestions } from '../data/questions';

// Returns the score of the user's submitted attempt for a paper, if one
// exists locally. Recomputes from the saved answer states using live
// question data, so it always matches the result screen's marking.
export function useAttemptScore(paperKey: string): AttemptResult | null {
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);

    const attempt = loadAttempt(paperKey);
    if (!attempt || !attempt.isTestSubmitted) return;

    getPaperQuestions(paperKey)
      .then((data) => {
        if (!cancelled) {
          setResult(computeAttemptResult(data.questions, attempt.questionStates));
        }
      })
      .catch(() => {
        // Question data unavailable — score cannot be computed.
      });

    return () => {
      cancelled = true;
    };
  }, [paperKey]);

  return result;
}
