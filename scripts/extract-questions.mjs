// One-time migration tool: extracts questions from src/data/papers/*.ts and
// figures from src/components/QuestionDiagram.tsx, then emits seed-data.sql
// (deterministic ids, batched multi-row inserts) loadable with psql -f.
//
//   node scripts/extract-questions.mjs > /tmp/seed-data.sql
//
// Id scheme (stable across runs):
//   papers       1..9 (order below)
//   sections     paper.id * 10 + position        (11, 12, 13, ...)
//   subsections  section.id * 10 + subPosition
//   questions    paper.id * 1000 + data id       (1..75 per paper)
//   options      question.id * 10 + position
//   diagrams     question.id                     (1:1 with questions)

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const papers = [
  { key: '02-apr-morning', title: 'JEE (Main) 2026 (02 Apr Morning)', fullTitle: 'JEE (Main) 2026 - 02 April Morning Shift', date: '2026-04-02', session: 'morning' },
  { key: '02-apr-evening', title: 'JEE (Main) 2026 (02 Apr Evening)', fullTitle: 'JEE (Main) 2026 - 02 April Evening Shift', date: '2026-04-02', session: 'evening' },
  { key: '04-apr-morning', title: 'JEE (Main) 2026 (04 Apr Morning)', fullTitle: 'JEE (Main) 2026 - 04 April Morning Shift', date: '2026-04-04', session: 'morning' },
  { key: '04-apr-evening', title: 'JEE (Main) 2026 (04 Apr Evening)', fullTitle: 'JEE (Main) 2026 - 04 April Evening Shift', date: '2026-04-04', session: 'evening' },
  { key: '05-apr-morning', title: 'JEE (Main) 2026 (05 Apr Morning)', fullTitle: 'JEE (Main) 2026 - 05 April Morning Shift', date: '2026-04-05', session: 'morning' },
  { key: '05-apr-evening', title: 'JEE (Main) 2026 (05 Apr Evening)', fullTitle: 'JEE (Main) 2026 - 05 April Evening Shift', date: '2026-04-05', session: 'evening' },
  { key: '06-apr-morning', title: 'JEE (Main) 2026 (06 Apr Morning)', fullTitle: 'JEE (Main) 2026 - 06 April Morning Shift', date: '2026-04-06', session: 'morning' },
  { key: '06-apr-evening', title: 'JEE (Main) 2026 (06 Apr Evening)', fullTitle: 'JEE (Main) 2026 - 06 April Evening Shift', date: '2026-04-06', session: 'evening' },
  { key: '08-apr-evening', title: 'JEE (Main) 2026 (08 Apr Evening)', fullTitle: 'JEE (Main) 2026 - 08 April Evening Shift', date: '2026-04-08', session: 'evening' },
];

const questionFiles = [
  'src/data/papers/apr02Morning.ts',
  'src/data/papers/apr02Evening.ts',
  'src/data/papers/apr04Morning.ts',
  'src/data/papers/apr04Evening.ts',
  'src/data/papers/apr05Morning.ts',
  'src/data/papers/apr05Evening.ts',
  'src/data/papers/apr06Morning.ts',
  'src/data/papers/apr06Evening.ts',
  'src/data/papers/apr08Evening.ts',
];

const paperModuleNames = [
  'apr02MorningQuestions',
  'apr02EveningQuestions',
  'apr04MorningQuestions',
  'apr04EveningQuestions',
  'apr05MorningQuestions',
  'apr05EveningQuestions',
  'apr06MorningQuestions',
  'apr06EveningQuestions',
  'apr08EveningQuestions',
];

const sql = (s) => `'${String(s).replace(/'/g, "''")}'`;

function escapeLiteral(s) {
  return `E'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n')}'`;
}

// rows[table] = list of value tuples
const rows = {
  papers: [],
  sections: [],
  subsections: [],
  questions: [],
  question_options: [],
  question_diagrams: [],
};

const push = (table, tuple) => rows[table].push(`(${tuple.join(', ')})`);

// ---------------------------------------------------------------------------
// Papers
// ---------------------------------------------------------------------------
papers.forEach((p, i) => {
  const id = i + 1;
  push('papers', [id, sql(p.key), escapeLiteral(p.title), escapeLiteral(p.fullTitle), sql(p.date), sql(p.session), 2026, 180, 75]);
});

// ---------------------------------------------------------------------------
// Questions (sections/subsections derived from data order)
// ---------------------------------------------------------------------------
let totalQuestions = 0;
let totalOptions = 0;

for (const paperId of papers.keys()) {
  const pid = paperId + 1;
  const module = await import(`../${questionFiles[paperId]}`);
  const questions = module[paperModuleNames[paperId]];

  const sectionOrder = [];
  for (const q of questions) {
    if (!sectionOrder.includes(q.section)) sectionOrder.push(q.section);
  }

  // subsections: position per section, in first-appearance order
  const subsectionPositions = new Map(); // `${section}:${subSection}` -> {sectionId, subPos}
  const sectionIds = new Map(); // section name -> id

  sectionOrder.forEach((name, pos) => {
    const sectionId = pid * 10 + (pos + 1);
    sectionIds.set(name, sectionId);
    push('sections', [sectionId, pid, sql(name), pos + 1]);
  });

  const subSectionOf = (q) =>
    q.subSection || (q.type === 'numerical' ? 'Section B' : 'Section A');

  for (const q of questions) {
    const sub = subSectionOf(q);
    const key = `${q.section}:${sub}`;
    if (!subsectionPositions.has(key)) {
      const sectionId = sectionIds.get(q.section);
      const subPos = (subsectionPositions.get(`${q.section}:count`) || 0) + 1;
      subsectionPositions.set(`${q.section}:count`, subPos);
      subsectionPositions.set(key, { sectionId, subPos });
      push('subsections', [sectionId * 10 + subPos, sectionId, sql(sub), subPos]);
    }
  }

  for (const q of questions) {
    const qid = pid * 1000 + q.id;
    const { sectionId, subPos } = subsectionPositions.get(`${q.section}:${subSectionOf(q)}`);
    const type = q.type || 'mcq';
    const correctAnswer = q.correctAnswer ? sql(q.correctAnswer) : 'null';
    const solution = q.solution ? escapeLiteral(q.solution) : 'null';

    push('questions', [qid, pid, sectionId, sectionId * 10 + subPos, q.number, sql(type), escapeLiteral(q.text), correctAnswer, solution, 4, -1, q.id]);

    (q.options || []).forEach((opt, oi) => {
      push('question_options', [qid * 10 + oi + 1, qid, oi + 1, sql(opt.label), escapeLiteral(opt.text)]);
      totalOptions++;
    });
    totalQuestions++;
  }
}

// ---------------------------------------------------------------------------
// Diagrams: extract JSX from QuestionDiagram.tsx and convert to HTML string.
// ---------------------------------------------------------------------------
const diagramSrc = readFileSync(resolve('src/components/QuestionDiagram.tsx'), 'utf8');

const ATTR_MAP = {
  className: 'class',
  textAnchor: 'text-anchor',
  strokeWidth: 'stroke-width',
  strokeDasharray: 'stroke-dasharray',
  markerEnd: 'marker-end',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  markerWidth: 'marker-width',
  markerHeight: 'marker-height',
  fillOpacity: 'fill-opacity',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
};

function jsxToHtml(jsx) {
  return jsx
    // strip JSX comments {/**/}
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // map known camelCase attributes
    .replace(/\b(className|textAnchor|strokeWidth|strokeDasharray|markerEnd|fontSize|fontWeight|markerWidth|markerHeight|fillOpacity|strokeLinecap|strokeLinejoin)\s*=/g, (m) => {
      const name = m.trim().replace(/\s*=$/, '');
      return `${ATTR_MAP[name]}=`;
    })
    .trim();
}

const caseRe = /case\s+'([\w-]+):(\d+)':\s*return\s*\(([\s\S]*?)\n\s*\);(\n|$)/g;

let diagramCount = 0;
let match;
while ((match = caseRe.exec(diagramSrc)) !== null) {
  const [, paperKey, qidStr] = match;
  const questionLocalId = Number(qidStr);
  const paperIndex = papers.findIndex((p) => p.key === paperKey);
  if (paperIndex === -1) throw new Error(`Unknown paper key in diagram: ${paperKey}`);
  const questionId = (paperIndex + 1) * 1000 + questionLocalId;
  const figureHtml = jsxToHtml(match[3]);
  if (!figureHtml.includes('<svg')) throw new Error(`No <svg> found for ${paperKey}:${questionLocalId}`);
  push('question_diagrams', [questionId, questionId, sql(paperKey), escapeLiteral(figureHtml)]);
  diagramCount++;
}

// ---------------------------------------------------------------------------
// Emit batched inserts (200 rows per statement)
// ---------------------------------------------------------------------------
const columns = {
  papers: ['id', 'key', 'title', 'full_title', 'exam_date', 'session', 'year', 'duration_minutes', 'question_count'],
  sections: ['id', 'paper_id', 'name', 'position'],
  subsections: ['id', 'section_id', 'name', 'position'],
  questions: ['id', 'paper_id', 'section_id', 'subsection_id', 'number', 'type', 'text', 'correct_answer', 'solution', 'marks', 'negative_marks', 'position'],
  question_options: ['id', 'question_id', 'position', 'label', 'text'],
  question_diagrams: ['id', 'question_id', 'paper_key', 'figure_html'],
};

const BATCH = 200;

console.log('-- Generated by scripts/extract-questions.mjs');
console.log(`-- ${papers.length} papers, ${totalQuestions} questions, ${totalOptions} options, ${diagramCount} diagrams`);
console.log('begin;');
for (const [table, tuples] of Object.entries(rows)) {
  if (tuples.length === 0) continue;
  for (let i = 0; i < tuples.length; i += BATCH) {
    console.log(
      `insert into public.${table} (${columns[table].join(', ')}) overriding system value values\n${tuples.slice(i, i + BATCH).join(',\n')};`
    );
  }
}
console.log('commit;');
