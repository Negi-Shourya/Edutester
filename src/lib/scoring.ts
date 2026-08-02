import type { Question, QuestionState } from '../types';

export interface SectionResult {
  section: string;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
}

export type QuestionOutcome = 'correct' | 'incorrect' | 'unattempted';

export interface AttemptResult {
  totalScore: number;
  maxScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  accuracy: number;
  sectionBreakdown: SectionResult[];
  questionOutcomes: Record<string, QuestionOutcome>;
}

// Mirrors the NTA marking shown on the result screen: +marks for a correct
// answer, negative marks for a wrong answer, 0 for unattempted.
export function computeAttemptResult(
  questions: Question[],
  questionStates: QuestionState[]
): AttemptResult {
  const sections = new Map<string, SectionResult>();
  const questionOutcomes: Record<string, QuestionOutcome> = {};
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalScore = 0;
  const maxScore = questions.reduce((sum, q) => sum + (q.marks ?? 4), 0);

  for (const q of questions) {
    const qState = questionStates.find((qs) => qs.id === q.id);
    const isMCQ = q.type === 'mcq' || !q.type;
    const userAns = isMCQ
      ? (qState?.selectedOption ?? '')
      : (qState?.numericAnswer?.trim() ?? '');

    let outcome: QuestionOutcome;
    let score = 0;
    if (userAns === '') {
      totalUnattempted++;
      outcome = 'unattempted';
    } else if (userAns.toLowerCase() === q.correctAnswer?.toLowerCase()) {
      totalCorrect++;
      score = q.marks ?? 4;
      totalScore += score;
      outcome = 'correct';
    } else {
      totalIncorrect++;
      score = q.negativeMarks ?? -1;
      totalScore += score;
      outcome = 'incorrect';
    }
    questionOutcomes[String(q.id)] = outcome;

    const section = q.section || 'General';
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
    sec.maxScore += q.marks ?? 4;
    if (outcome === 'correct') sec.correct++;
    if (outcome === 'incorrect') sec.incorrect++;
    if (outcome === 'unattempted') sec.unattempted++;
    sections.set(section, sec);
  }

  const attemptedCount = totalCorrect + totalIncorrect;
  const sectionBreakdown = [...sections.values()].map((sec) => ({
    ...sec,
    accuracy:
      sec.correct + sec.incorrect > 0
        ? Math.round((sec.correct / (sec.correct + sec.incorrect)) * 100)
        : 0,
  }));
  return {
    totalScore,
    maxScore,
    totalCorrect,
    totalIncorrect,
    totalUnattempted,
    accuracy: attemptedCount > 0 ? Math.round((totalCorrect / attemptedCount) * 100) : 0,
    sectionBreakdown,
    questionOutcomes,
  };
}
