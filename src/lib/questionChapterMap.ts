import type { ExamType } from './exam';

// Runtime resolver: question id → chapter. Backed by
// public/chapters/question-chapter-index.json (built by
// scripts/build-question-chapter-index.mjs — re-run it when chapters change).
//
// PRIVACY RULE: this module must only ever be imported by post-submit
// analysis code (result screen, dashboard). It must never be imported by
// the test-taking UI — the user must not see which chapter a question
// comes from while attempting the test.

export interface ChapterCandidate {
  chapterId: string;
  title: string;
  subject: string;
  exam: ExamType;
}

export type ChapterIndex = Record<string, ChapterCandidate[]>;

let cached: Promise<ChapterIndex> | null = null;

// Lazily fetched on first analysis use and cached in memory. Served from
// the CDN with long caching, so repeat visits cost nothing.
export function loadChapterIndex(): Promise<ChapterIndex> {
  if (!cached) {
    cached = (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}chapters/question-chapter-index.json`);
        if (!res.ok) return {};
        const data = (await res.json()) as ChapterIndex;
        return data && typeof data === 'object' ? data : {};
      } catch {
        return {};
      }
    })();
  }
  return cached;
}

// A question can belong to 2+ chapters (shared JEE/NEET content). Prefer
// the candidate on the same exam track as the attempt; otherwise the first.
export function resolveChapter(
  index: ChapterIndex,
  questionId: string | number,
  exam: ExamType
): ChapterCandidate | null {
  const candidates = index[String(questionId)];
  if (!candidates || candidates.length === 0) return null;
  return candidates.find((c) => c.exam === exam) ?? candidates[0];
}
