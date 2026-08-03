// Result payload types, shared between the server (score-attempt edge
// function) and the result screen. Scoring itself now happens server-side
// against the private question_keys table — the client never holds the
// answer key before a submission is scored.

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
