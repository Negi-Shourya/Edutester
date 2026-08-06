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
