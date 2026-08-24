export type ExamType = 'jee' | 'neet';

const EXAM_KEY = 'edutester-exam';

// The user's chosen exam track (JEE or NEET). Persisted locally; defaults to
// JEE, and signup can set it as a starting track.
export function getExam(): ExamType {
  try {
    return localStorage.getItem(EXAM_KEY) === 'neet' ? 'neet' : 'jee';
  } catch {
    return 'jee';
  }
}

export function setExam(exam: ExamType): void {
  try {
    localStorage.setItem(EXAM_KEY, exam);
  } catch {
    // storage unavailable (private mode etc.) — preference just won't persist
  }
}

// Which track a paper belongs to. NEET keys are prefixed `neet-` (neet-2020 …
// neet-2025); JEE keys are date-based (02-apr-morning). Attempt rows store only
// the paper key, with no exam_type column, so splitting a student's history by
// track has to go through the key.
export function examOfPaperKey(paperKey: string): ExamType {
  return paperKey.startsWith('neet') ? 'neet' : 'jee';
}
