import { supabase } from '../lib/supabase';
import type { Question, QuestionOption } from '../types';
import type { ExamType } from '../lib/exam';

export interface PaperSummary {
  key: string;
  title: string;
  fullTitle: string;
  examDate: string;
  session: 'morning' | 'evening' | null;
  examType: ExamType;
  isTrial: boolean;
  durationMinutes: number;
}

interface QuestionRow {
  id: number;
  number: number;
  type: 'mcq' | 'numerical';
  text: string;
  marks: number | null;
  negative_marks: number | null;
  position: number;
  sections: { name: string } | null;
  subsections: { name: 'Section A' | 'Section B' } | null;
  question_options: { position: number; label: string; text: string; figure_url: string | null }[] | null;
  figure_url: string[] | null;
}

interface PaperRow {
  key: string;
  title: string;
  full_title: string;
  exam_date: string;
  session: 'morning' | 'evening' | null;
  exam_type: ExamType;
  is_trial: boolean;
  duration_minutes: number;
  questions: QuestionRow[];
}

// Answer keys and solutions live in the private `question_keys` table and
// are only returned by the score-attempt edge function after a submission.
const questionSelect = `
  id, number, type, text, marks, negative_marks, position,
  sections ( name ),
  subsections ( name ),
  question_options ( position, label, text, figure_url ),
  figure_url
`;

function mapQuestion(row: QuestionRow): Question {
  const options: QuestionOption[] = [...(row.question_options || [])]
    .sort((a, b) => a.position - b.position)
    .map((opt) => ({ label: opt.label, text: opt.text, figureUrl: opt.figure_url ?? undefined }));

  return {
    id: row.id,
    number: row.number,
    section: row.sections?.name ?? 'Mathematics',
    subSection: row.subsections?.name ?? 'Section A',
    type: row.type,
    text: row.text,
    options,
    marks: row.marks ?? 4,
    negativeMarks: row.negative_marks ?? -1,
    figureUrl: row.figure_url ?? undefined,
  };
}

export interface PaperQuestions {
  paper: PaperSummary;
  questions: Question[];
}

// NTA section order per exam. Questions are stored by insertion position
// (which is not guaranteed to match this order), so we sort here.
const SECTION_ORDER: Record<ExamType, string[]> = {
  jee: ['Physics', 'Chemistry', 'Mathematics'],
  neet: ['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology'],
};

const sectionIndex = (section: string, examType: ExamType) => {
  const order = SECTION_ORDER[examType];
  const idx = order.indexOf(section);
  return idx === -1 ? order.length : idx;
};

const paperCache = new Map<string, Promise<PaperQuestions>>();

// Loaded when a paper cannot be found at all, so a bad link lands on a working
// test rather than an error screen.
const TRIAL_PAPER_KEY = '02-apr-morning';

export function getPaperQuestions(paperKey: string): Promise<PaperQuestions> {
  const cached = paperCache.get(paperKey);
  if (cached) return cached;

  const request = loadPaperQuestions(paperKey);
  paperCache.set(paperKey, request);
  return request;
}

function mapPaper(row: PaperRow): PaperQuestions {
  const examType = row.exam_type === 'neet' ? 'neet' : 'jee';

  return {
    paper: {
      key: row.key,
      title: row.title,
      fullTitle: row.full_title,
      examDate: row.exam_date,
      session: row.session,
      examType,
      isTrial: !!row.is_trial,
      durationMinutes: row.duration_minutes ?? 180,
    },
    questions: [...row.questions]
      .map(mapQuestion)
      .sort((a, b) => {
        const secDiff = sectionIndex(a.section, examType) - sectionIndex(b.section, examType);
        if (secDiff !== 0) return secDiff;
        return a.number - b.number;
      }),
  };
}

// Paper content is immutable once seeded, so it is also published as a static
// file under public/papers/ by scripts/build-paper-json.mjs. Reading that costs
// the CDN one cached file and the database nothing. The nested
// papers → questions → question_options join it replaces measured ~530 ms of
// Supabase server time per test start — the most expensive thing the site does,
// and it arrives in a burst when a batch of students begin together.
//
// Returns null for anything unexpected so the database query still runs: a
// missing, stale or truncated file costs latency, never a broken exam. Because
// the file is served with the host's own cache headers, a regenerated paper can
// take a few minutes to reach browsers that already have a copy.
async function fetchStaticPaper(paperKey: string): Promise<PaperRow | null> {
  // Paper keys come from the URL, and this one is interpolated into a path.
  // Anything that is not a plain key is not something the build script could
  // have written, so don't ask for it.
  if (!/^[a-z0-9-]+$/i.test(paperKey)) return null;

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}papers/${paperKey}.json`);
    if (!res.ok) return null;

    const row = (await res.json()) as PaperRow;
    // A half-written or wrong-shaped file must not become an empty exam.
    if (!row?.key || !Array.isArray(row.questions) || row.questions.length === 0) return null;
    return row;
  } catch {
    // Offline, blocked, or not valid JSON — fall through to the database.
    return null;
  }
}

async function loadPaperQuestions(paperKey: string): Promise<PaperQuestions> {
  const published = await fetchStaticPaper(paperKey);
  if (published) return mapPaper(published);

  const { data, error } = await supabase
    .from('papers')
    .select(
      `id, key, title, full_title, exam_date, session, exam_type, is_trial, duration_minutes, questions(${questionSelect})`
    )
    .eq('key', paperKey)
    .single();

  if (error || !data) {
    if (paperKey !== TRIAL_PAPER_KEY) {
      return getPaperQuestions(TRIAL_PAPER_KEY);
    }
    throw new Error(`Failed to load paper "${paperKey}" from the database: ${error?.message ?? 'not found'}`);
  }

  return mapPaper(data as unknown as PaperRow);
}

async function fetchStaticChapter(chapterKey: string): Promise<PaperRow | null> {
  if (!/^[a-z0-9-]+$/i.test(chapterKey)) return null;

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}chapters/${chapterKey}.json`);
    if (!res.ok) return null;

    const row = (await res.json()) as PaperRow;
    if (!row?.key || !Array.isArray(row.questions) || row.questions.length === 0) return null;
    return row;
  } catch {
    return null;
  }
}

const chapterCache = new Map<string, Promise<PaperQuestions>>();

export function getChapterQuestions(chapterKey: string): Promise<PaperQuestions> {
  const cached = chapterCache.get(chapterKey);
  if (cached) return cached;

  const request = loadChapterQuestions(chapterKey);
  chapterCache.set(chapterKey, request);
  return request;
}

async function loadChapterQuestions(chapterKey: string): Promise<PaperQuestions> {
  const published = await fetchStaticChapter(chapterKey);
  if (published) return mapPaper(published);

  // Fallback to trial paper if chapter test file is missing
  return getPaperQuestions(TRIAL_PAPER_KEY);
}

const papersCache = new Map<string, Promise<PaperSummary[]>>();

export function getPapers(): Promise<PaperSummary[]> {
  const cached = papersCache.get('all');
  if (cached) return cached;

  const request = (async (): Promise<PaperSummary[]> => {
    const { data, error } = await supabase
      .from('papers')
      .select('id, key, title, full_title, exam_date, session, exam_type, is_trial, duration_minutes')
      .order('exam_date', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw new Error(`Failed to load papers: ${error.message}`);
    return (data ?? []).map((p) => ({
      key: p.key,
      title: p.title,
      fullTitle: p.full_title,
      examDate: p.exam_date,
      session: p.session as 'morning' | 'evening' | null,
      examType: p.exam_type === 'neet' ? 'neet' : 'jee',
      isTrial: !!p.is_trial,
      durationMinutes: p.duration_minutes ?? 180,
    }));
  })();

  papersCache.set('all', request);
  return request;
}
