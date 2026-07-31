import { supabase } from '../lib/supabase';
import type { Question, QuestionOption } from '../types';

export interface PaperSummary {
  key: string;
  title: string;
  fullTitle: string;
  examDate: string;
  session: 'morning' | 'evening';
}

interface QuestionRow {
  id: number;
  number: number;
  type: 'mcq' | 'numerical';
  text: string;
  correct_answer: string | null;
  solution: string | null;
  marks: number | null;
  negative_marks: number | null;
  position: number;
  sections: { name: string } | null;
  subsections: { name: 'Section A' | 'Section B' } | null;
  question_options: { position: number; label: string; text: string }[] | null;
  figure_url: string[] | null;
}

interface PaperRow {
  key: string;
  title: string;
  full_title: string;
  exam_date: string;
  session: 'morning' | 'evening';
  questions: QuestionRow[];
}

const questionSelect = `
  id, number, type, text, correct_answer, solution, marks, negative_marks, position,
  sections ( name ),
  subsections ( name ),
  question_options ( position, label, text ),
  figure_url
`;

function mapQuestion(row: QuestionRow): Question {
  const options: QuestionOption[] = [...(row.question_options || [])]
    .sort((a, b) => a.position - b.position)
    .map((opt) => ({ label: opt.label, text: opt.text }));

  return {
    id: row.id,
    number: row.number,
    section: row.sections?.name ?? 'Mathematics',
    subSection: row.subsections?.name ?? 'Section A',
    type: row.type,
    text: row.text,
    options,
    correctAnswer: row.correct_answer ?? undefined,
    solution: row.solution ?? undefined,
    marks: row.marks ?? 4,
    negativeMarks: row.negative_marks ?? -1,
    figureUrl: row.figure_url ?? undefined,
  };
}

export interface PaperQuestions {
  paper: PaperSummary;
  questions: Question[];
}

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
    .select(`id, key, title, full_title, exam_date, session, questions(${questionSelect})`)
    .eq('key', paperKey)
    .single();

  if (error || !data) {
    if (paperKey !== '02-apr-morning') {
      return getPaperQuestions('02-apr-morning');
    }
    throw new Error(`Failed to load paper "${paperKey}" from the database: ${error?.message ?? 'not found'}`);
  }

  const row = data as unknown as PaperRow;

  return {
    paper: {
      key: row.key,
      title: row.title,
      fullTitle: row.full_title,
      examDate: row.exam_date,
      session: row.session,
    },    questions: [...row.questions]
      .sort((a, b) => a.position - b.position)
      .map(mapQuestion),
  };
}

const papersCache = new Map<string, Promise<PaperSummary[]>>();

export function getPapers(): Promise<PaperSummary[]> {
  const cached = papersCache.get('all');
  if (cached) return cached;

  const request = (async (): Promise<PaperSummary[]> => {
    const { data, error } = await supabase
      .from('papers')
      .select('id, key, title, full_title, exam_date, session')
      .order('exam_date', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw new Error(`Failed to load papers: ${error.message}`);
    return (data ?? []).map((p) => ({
      key: p.key,
      title: p.title,
      fullTitle: p.full_title,
      examDate: p.exam_date,
      session: p.session as 'morning' | 'evening',
    }));
  })();

  papersCache.set('all', request);
  return request;
}
