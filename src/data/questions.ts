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

export function getPaperQuestions(paperKey: string): Promise<PaperQuestions> {
  const cached = paperCache.get(paperKey);
  if (cached) return cached;

  const request = loadPaperQuestions(paperKey);
  paperCache.set(paperKey, request);
  return request;
}

async function loadPaperQuestions(paperKey: string): Promise<PaperQuestions> {
  const { data, error } = await supabase
    .from('papers')
    .select(
      `id, key, title, full_title, exam_date, session, exam_type, is_trial, duration_minutes, questions(${questionSelect})`
    )
    .eq('key', paperKey)
    .single();

  if (error || !data) {
    if (paperKey !== '02-apr-morning') {
      return getPaperQuestions('02-apr-morning');
    }
    throw new Error(`Failed to load paper "${paperKey}" from the database: ${error?.message ?? 'not found'}`);
  }

  const row = data as unknown as PaperRow;
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
