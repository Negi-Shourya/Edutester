import type { ExamType } from './exam';

// Runtime resolver: question id → chapter. Backed by
// public/chapters/question-chapter-index.json (built by
// scripts/build-question-chapter-index.mjs — re-run it when chapters change)
// plus public/chapters/question-chapter-auto.json (classifier leftovers —
// npm run classify-questions). Curated entries win on conflict.
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
  // False for classifier-mapped chapters with no dedicated chapter test —
  // analysis still works, but practice links must fall back to browsing.
  hasTest: boolean;
}

export type ChapterIndex = Record<string, ChapterCandidate[]>;

interface RawEntry {
  chapterId: string;
  title: string;
  subject: string;
  exam: ExamType;
  hasTest?: boolean;
}

let cached: Promise<ChapterIndex> | null = null;

// Lazily fetched on first analysis use and cached in memory. Served from
// the CDN with long caching, so repeat visits cost nothing.
export function loadChapterIndex(): Promise<ChapterIndex> {
  if (!cached) {
    cached = (async () => {
      const [curated, auto] = await Promise.all([
        fetchIndex('question-chapter-index.json'),
        fetchIndex('question-chapter-auto.json'),
      ]);
      const merged: ChapterIndex = {};
      for (const [qid, list] of Object.entries(auto)) {
        merged[qid] = list.map((c) => ({ ...c, hasTest: c.hasTest ?? false }));
      }
      for (const [qid, list] of Object.entries(curated)) {
        merged[qid] = list.map((c) => ({ ...c, hasTest: true }));
      }
      return merged;
    })();
  }
  return cached;
}

async function fetchIndex(file: string): Promise<Record<string, RawEntry[]>> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}chapters/${file}`);
    if (!res.ok) return {};
    const data = (await res.json()) as Record<string, RawEntry[]>;
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
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
