import { supabase } from './supabase';
import type { Question } from '../types';
import { NEET_CUSTOM_CHAPTERS } from '../data/neetCustomChapters';
import { JEE_CUSTOM_CHAPTERS } from '../data/jeeCustomChapters';

// Custom tests (NEET + JEE): the student picks chapters + counts, the engine
// samples randomly and shuffles WITHIN each subject (intrasubject, never
// intersubject) — the paper keeps real subject blocks like an actual paper,
// but inside a block no one can tell which chapter a question came from.
//
// PRIVACY RULE (same as questionChapterMap): the chapter map must only be
// loaded by the builder (pre-test). The test runner (?custom= mode) fetches
// questions by id with their real subject section — chapters are never
// exposed during the test.

export const CUSTOM_KEY_PREFIX = 'custom-neet-';
export const CUSTOM_JEE_PREFIX = 'custom-jee-';
export const MAX_CUSTOM_QUESTIONS = 180;
export const MIN_CUSTOM_QUESTIONS = 5;

export interface CustomTestDefinition {
  /** `custom-neet-…` / `custom-jee-…` — the infix keeps dashboard exam tracking working. */
  id: string;
  title: string;
  questionIds: number[];
  durationMinutes: number;
  picks: Record<string, number>;
  createdAt: number;
}

export type ChapterMap = Record<string, string>;

let neetMapPromise: Promise<ChapterMap> | null = null;
let jeeMapPromise: Promise<ChapterMap> | null = null;

function fetchMap(file: string): Promise<ChapterMap> {
  return (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}custom/${file}`);
      if (!res.ok) return {};
      const data = (await res.json()) as ChapterMap;
      return data && typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  })();
}

export function loadNeetChapterMap(): Promise<ChapterMap> {
  if (!neetMapPromise) neetMapPromise = fetchMap('neet-chapter-map.json');
  return neetMapPromise;
}

export function loadJeeChapterMap(): Promise<ChapterMap> {
  if (!jeeMapPromise) jeeMapPromise = fetchMap('jee-chapter-map.json');
  return jeeMapPromise;
}

/** Invert the question→chapter map into chapter→question-ids (sorted for stability). */
export function poolByChapter(map: ChapterMap): Record<string, number[]> {
  const pool: Record<string, number[]> = {};
  for (const [qid, chapterId] of Object.entries(map)) {
    const id = Number(qid);
    if (!Number.isFinite(id) || !chapterId) continue;
    (pool[chapterId] ??= []).push(id);
  }
  for (const ids of Object.values(pool)) ids.sort((a, b) => a - b);
  return pool;
}

// Fisher–Yates using crypto randomness. Sampling is without replacement
// within one build; across builds anything may repeat.
function shuffled<T>(arr: T[]): T[] {  const a = [...arr];
  const rand = new Uint32Array(a.length);
  crypto.getRandomValues(rand);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const subjectOfNeetChapter = new Map(NEET_CUSTOM_CHAPTERS.map((c) => [c.id, c.subject]));
const subjectOfJeeChapter = new Map(JEE_CUSTOM_CHAPTERS.map((c) => [c.id, c.subject]));
const NEET_SUBJECT_ORDER = ['Physics', 'Chemistry', 'Biology'];
const JEE_SUBJECT_ORDER = ['Physics', 'Chemistry', 'Mathematics'];

function sampleBySubject(
  pool: Record<string, number[]>,
  picks: Record<string, number>,
  subjectOf: Map<string, string>,
  subjectOrder: string[]
): number[] {  // Intrasubject mix: chapters interleave freely inside their own subject,
  // but subjects stay as separate blocks in exam order.
  const bySubject: Record<string, number[]> = {};
  for (const s of subjectOrder) bySubject[s] = [];
  for (const [chapterId, count] of Object.entries(picks)) {
    const n = Math.floor(count);
    if (n <= 0) continue;
    const subject = subjectOf.get(chapterId);
    if (!subject || !bySubject[subject]) continue;
    const ids = pool[chapterId] ?? [];
    // Clamp to what the audited pool actually has (builder also clamps).
    bySubject[subject].push(...shuffled(ids).slice(0, Math.min(n, ids.length)));
  }
  return subjectOrder.flatMap((s) => shuffled(bySubject[s]));
}

export function sampleQuestions(
  pool: Record<string, number[]>,
  picks: Record<string, number>
): number[] {
  return sampleBySubject(pool, picks, subjectOfNeetChapter, NEET_SUBJECT_ORDER);
}

export function sampleJeeQuestions(
  pool: Record<string, number[]>,
  picks: Record<string, number>
): number[] {
  return sampleBySubject(pool, picks, subjectOfJeeChapter, JEE_SUBJECT_ORDER);
}

function buildTest(
  idPrefix: string,
  titlePrefix: string,
  picks: Record<string, number>,
  pool: Record<string, number[]>,
  durationMinutes: number,
  sampler: (pool: Record<string, number[]>, picks: Record<string, number>) => number[]
): CustomTestDefinition | null {
  const clean: Record<string, number> = {};
  for (const [chapterId, count] of Object.entries(picks)) {
    const n = Math.floor(count);
    if (n > 0 && (pool[chapterId]?.length ?? 0) > 0) clean[chapterId] = n;
  }
  const questionIds = sampler(pool, clean);
  if (questionIds.length < MIN_CUSTOM_QUESTIONS) return null;
  const rand = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % 46656).toString(36);
  const id = `${idPrefix}${Date.now().toString(36)}-${rand}`;
  const total = questionIds.length;
  return {
    id,
    title: `${titlePrefix} (${total} Qs)`,
    questionIds,
    durationMinutes: Math.max(5, Math.min(240, Math.round(durationMinutes) || total)),
    picks: clean,
    createdAt: Date.now(),
  };
}

export function buildCustomTest(
  picks: Record<string, number>,
  pool: Record<string, number[]>,
  durationMinutes: number
): CustomTestDefinition | null {
  return buildTest(CUSTOM_KEY_PREFIX, 'Custom NEET Test', picks, pool, durationMinutes, sampleQuestions);
}

export function buildJeeCustomTest(
  picks: Record<string, number>,
  pool: Record<string, number[]>,
  durationMinutes: number
): CustomTestDefinition | null {
  return buildTest(CUSTOM_JEE_PREFIX, 'Custom JEE Test', picks, pool, durationMinutes, sampleJeeQuestions);
}

const defKey = (userId: string, id: string) => `edutester_custom_${userId}_${id}`;

export function saveCustomTest(userId: string, def: CustomTestDefinition): void {
  if (!userId) return;
  try {
    localStorage.setItem(defKey(userId, def.id), JSON.stringify(def));
  } catch {
    // Storage full/unavailable — the test just can't be resumed later.
  }
}

export function loadCustomTest(userId: string, id: string): CustomTestDefinition | null {
  if (!userId || (!id.startsWith(CUSTOM_KEY_PREFIX) && !id.startsWith(CUSTOM_JEE_PREFIX))) return null;
  try {
    const raw = localStorage.getItem(defKey(userId, id));
    if (!raw) return null;
    const def = JSON.parse(raw) as CustomTestDefinition;
    if (!def || def.id !== id || !Array.isArray(def.questionIds)) return null;
    return def;
  } catch {
    return null;
  }
}

export function isCustomKey(key: string): boolean {
  return key.startsWith(CUSTOM_KEY_PREFIX) || key.startsWith(CUSTOM_JEE_PREFIX);
}

export function isJeeCustomKey(key: string): boolean {
  return key.startsWith(CUSTOM_JEE_PREFIX);
}

interface CustomQuestionRow {
  id: number;
  type: 'mcq' | 'numerical';
  text: string;
  marks: number | null;
  negative_marks: number | null;
  sections: { name: string } | { name: string }[] | null;
  question_options: { position: number; label: string; text: string; figure_url: string | null }[] | null;
  figure_url: string[] | null;
}

function sectionName(s: CustomQuestionRow['sections']): string {
  if (!s) return 'General';
  if (Array.isArray(s)) return s[0]?.name ?? 'General';
  return s.name ?? 'General';
}

// Fetch the sampled questions by id, in the stored (intrasubject-shuffled)
// order. Sections are the real subjects — Physics / Chemistry / Biology (or
// Mathematics for JEE) blocks like a real paper — while the chapter stays
// hidden.
export async function getCustomQuestions(ids: number[]): Promise<Question[]> {
  if (ids.length === 0) throw new Error('This custom test has no questions.');
  const { data, error } = await supabase
    .from('questions')
    .select('id, type, text, marks, negative_marks, sections ( name ), question_options ( position, label, text, figure_url ), figure_url')
    .in('id', ids);
  if (error) throw new Error(`Failed to load custom test: ${error.message}`);
  const rows = (data ?? []) as unknown as CustomQuestionRow[];
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows
    .filter((r) => order.has(r.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((row, i) => ({
      id: row.id,
      number: i + 1,
      section: sectionName(row.sections),
      subSection: 'Section A' as const,
      type: row.type,
      text: row.text,
      options: [...(row.question_options || [])]
        .sort((a, b) => a.position - b.position)
        .map((o) => ({ label: o.label, text: o.text, figureUrl: o.figure_url ?? undefined })),
      marks: row.marks ?? 4,
      negativeMarks: row.negative_marks ?? -1,
      figureUrl: row.figure_url ?? undefined,
    }));
}

/** Check if the user is eligible for a free custom test (1 free attempt allowed). */
export async function getCustomTestQuota(userId: string): Promise<{
  hasFreeAttempt: boolean;
  customAttemptsCount: number;
}> {
  if (!userId) return { hasFreeAttempt: false, customAttemptsCount: 0 };
  const { count, error } = await supabase
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('test_type', 'custom');
  if (error) {
    console.warn('Failed to fetch custom attempts count:', error.message);
  }
  const countNum = count ?? 0;
  return {
    hasFreeAttempt: countNum === 0,
    customAttemptsCount: countNum,
  };
}
