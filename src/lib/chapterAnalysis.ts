import type { AttemptRow } from './attemptsDb';
import { chapterTests } from '../data/chapters';
import { examOfPaperKey, type ExamType } from './exam';
import type { ChapterIndex } from './questionChapterMap';
import { resolveChapter } from './questionChapterMap';

// Chapter-level performance, derived from chapter-test attempts. A full
// paper's questions carry no chapter tags — only a section name — so the
// chapter a full-paper question belongs to is unknowable from stored data.
// Chapter tests (paper_key = chapter id, e.g. "jee-phy-1") ARE the chapter
// signal: each one maps to a chapter via src/data/chapters.ts.

export interface ChapterPerformance {
  chapterId: string;
  title: string;
  subject: string;
  exam: string;
  attempts: number;
  avgAccuracy: number;
  avgScorePct: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  lastAccuracy: number;
  lastScorePct: number;
  // Total questions this aggregate is built from. Chapter tests contribute
  // 15-25 each; paper-derived chapters may rest on just a few questions.
  questions: number;
  isWeak: boolean;
}

const chapterById = new Map(chapterTests.map((c) => [c.id, c]));

export function chapterInfo(chapterId: string): { title: string; subject: string } | null {
  const c = chapterById.get(chapterId);
  if (!c) return null;
  return { title: c.title ?? chapterId, subject: c.subject ?? 'General' };
}

export function isChapterAttempt(row: AttemptRow): boolean {
  return (
    row.test_type === 'chapter' ||
    row.paper_key.startsWith('jee-') ||
    row.paper_key.startsWith('neet-') ||
    row.paper_key.startsWith('ch-')
  );
}

// Aggregate every chapter-test attempt into per-chapter performance.
export function analyzeChapters(attempts: AttemptRow[]): ChapterPerformance[] {
  const byChapter = new Map<string, AttemptRow[]>();
  for (const row of attempts) {
    if (!isChapterAttempt(row)) continue;
    const list = byChapter.get(row.paper_key) ?? [];
    list.push(row);
    byChapter.set(row.paper_key, list);
  }

  const result: ChapterPerformance[] = [];
  for (const [chapterId, rows] of byChapter) {
    const sorted = [...rows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const n = sorted.length;
    const avgAccuracy = Math.round(sorted.reduce((s, r) => s + r.accuracy, 0) / n);
    const avgScorePct = Math.round(
      sorted.reduce((s, r) => s + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0), 0) / n
    );
    const last = sorted[n - 1];
    const lastAccuracy = last.accuracy;
    const lastScorePct =
      last.max_score > 0 ? Math.round((last.total_score / last.max_score) * 100) : 0;
    const meta = chapterById.get(chapterId);
    const totalCorrect = sorted.reduce((s, r) => s + r.correct, 0);
    const totalIncorrect = sorted.reduce((s, r) => s + r.incorrect, 0);
    const totalUnattempted = sorted.reduce((s, r) => s + r.unattempted, 0);
    result.push({
      chapterId,
      title: meta?.title ?? last.title,
      subject: meta?.subject ?? 'General',
      exam: meta?.exam ?? examOfPaperKey(chapterId),
      attempts: n,
      avgAccuracy,
      avgScorePct,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      lastAccuracy,
      lastScorePct,
      questions: totalCorrect + totalIncorrect + totalUnattempted,
      isWeak: avgAccuracy < 60 || avgScorePct < 40,
    });
  }
  return result.sort((a, b) => a.avgAccuracy - b.avgAccuracy);
}

// Chapters of one subject, weakest first. Pass the dashboard's exam track so
// JEE chapters don't leak into the NEET view and vice versa.
export function chaptersForSubject(
  chapters: ChapterPerformance[],
  subject: string,
  exam: string
): ChapterPerformance[] {
  return chapters
    .filter((c) => c.subject === subject && c.exam === exam)
    .sort((a, b) => a.avgAccuracy - b.avgAccuracy);
}

export function weakestChapters(chapters: ChapterPerformance[], limit = 3): ChapterPerformance[] {
  return chapters.filter((c) => c.isWeak).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Paper-derived chapters: attribute each full-paper question outcome to its
// chapter via the question→chapter index, then aggregate per chapter.
// ---------------------------------------------------------------------------

interface PaperBucket {
  title: string;
  subject: string;
  exam: ExamType;
  correct: number;
  incorrect: number;
  unattempted: number;
  tests: number;
}

function bucketizePaperOutcomes(
  outcomes: Record<string, string>,
  exam: ExamType,
  index: ChapterIndex
): Map<string, PaperBucket> {
  const buckets = new Map<string, PaperBucket>();
  for (const [qid, outcome] of Object.entries(outcomes)) {
    const hit = resolveChapter(index, qid, exam);
    if (!hit) continue;
    const b = buckets.get(hit.chapterId) ?? {
      title: hit.title,
      subject: hit.subject,
      exam: hit.exam,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      tests: 0,
    };
    if (outcome === 'correct') b.correct++;
    else if (outcome === 'incorrect') b.incorrect++;
    else b.unattempted++;
    buckets.set(hit.chapterId, b);
  }
  return buckets;
}

function accuracyOf(correct: number, incorrect: number): number {
  const attempted = correct + incorrect;
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

// Chapter-wise split of ONE full-paper attempt (for the result screen).
// Chapters resting on fewer than 3 questions are still listed, but never
// flagged weak — a single question is noise, not a verdict.
export function paperTestChapters(
  outcomes: Record<string, string>,
  exam: ExamType,
  index: ChapterIndex
): ChapterPerformance[] {
  const out: ChapterPerformance[] = [];
  for (const [chapterId, b] of bucketizePaperOutcomes(outcomes, exam, index)) {
    const questions = b.correct + b.incorrect + b.unattempted;
    const avgAccuracy = accuracyOf(b.correct, b.incorrect);
    const approxScorePct =
      questions > 0
        ? Math.max(0, Math.round(((4 * b.correct - b.incorrect) / (4 * questions)) * 100))
        : 0;
    out.push({
      chapterId,
      title: b.title,
      subject: b.subject,
      exam: b.exam,
      attempts: 1,
      avgAccuracy,
      avgScorePct: approxScorePct,
      totalCorrect: b.correct,
      totalIncorrect: b.incorrect,
      totalUnattempted: b.unattempted,
      lastAccuracy: avgAccuracy,
      lastScorePct: approxScorePct,
      questions,
      isWeak: questions >= 3 && avgAccuracy < 60,
    });
  }
  return out.sort((a, b) => a.avgAccuracy - b.avgAccuracy);
}

// Merge paper-derived stats into the chapter-test aggregates (for the
// dashboard). Every question counts once, whatever it came from; the weak
// flag needs at least 3 questions behind it.
export function mergePaperChapters(
  base: ChapterPerformance[],
  attempts: AttemptRow[],
  index: ChapterIndex
): ChapterPerformance[] {
  const merged = new Map<string, ChapterPerformance>(base.map((c) => [c.chapterId, { ...c }]));
  const perTest = new Map<string, Set<string>>();

  for (const row of attempts) {
    if (isChapterAttempt(row)) continue;
    const exam = examOfPaperKey(row.paper_key);
    for (const [chapterId, b] of bucketizePaperOutcomes(row.question_outcomes ?? {}, exam, index)) {
      const cur = merged.get(chapterId);
      if (cur) {
        cur.totalCorrect += b.correct;
        cur.totalIncorrect += b.incorrect;
        cur.totalUnattempted += b.unattempted;
        cur.questions += b.correct + b.incorrect + b.unattempted;
      } else {
        merged.set(chapterId, {
          chapterId,
          title: b.title,
          subject: b.subject,
          exam: b.exam,
          attempts: 0,
          avgAccuracy: 0,
          avgScorePct: 0,
          totalCorrect: b.correct,
          totalIncorrect: b.incorrect,
          totalUnattempted: b.unattempted,
          lastAccuracy: 0,
          lastScorePct: 0,
          questions: b.correct + b.incorrect + b.unattempted,
          isWeak: false,
        });
      }
      let set = perTest.get(chapterId);
      if (!set) {
        set = new Set();
        perTest.set(chapterId, set);
      }
      set.add(row.id);
    }
  }

  const out: ChapterPerformance[] = [];
  for (const cur of merged.values()) {
    const extraTests = perTest.get(cur.chapterId)?.size ?? 0;
    if (extraTests === 0) {
      // Chapter-test data only — keep the per-attempt averages as computed
      // by analyzeChapters.
      out.push(cur);
      continue;
    }
    // Pooled recompute across chapter tests + paper questions. Paper
    // questions are 4 marks / -1 like chapter tests, so the score share is
    // approximated the same way (clamped at 0).
    const avgAccuracy = accuracyOf(cur.totalCorrect, cur.totalIncorrect);
    const approxScorePct =
      cur.questions > 0
        ? Math.max(
            0,
            Math.round(((4 * cur.totalCorrect - cur.totalIncorrect) / (4 * cur.questions)) * 100)
          )
        : 0;
    out.push({
      ...cur,
      attempts: cur.attempts + extraTests,
      avgAccuracy,
      avgScorePct: approxScorePct,
      isWeak: cur.questions >= 3 && avgAccuracy < 60,
    });
  }
  return out.sort((a, b) => a.avgAccuracy - b.avgAccuracy);
}
