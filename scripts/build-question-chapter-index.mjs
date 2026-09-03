// Builds public/chapters/question-chapter-index.json: question id → the
// chapter test(s) that question was carved into.
//
// Chapter tests are extracted from full papers, so a paper question and a
// chapter question with the same DB id are the same question. That overlap
// is the join key that lets full-paper attempts produce chapter-wise
// analysis without any manual tagging.
//
// A question can sit in 2+ chapters (e.g. shared JEE/NEET content). The
// index keeps every candidate; the runtime resolver prefers the candidate
// whose exam track matches the attempt being analyzed.
//
// RE-RUN THIS whenever chapter JSONs change:
//   npm run build:chapter-index
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const chaptersDir = join(root, 'public', 'chapters');
const outFile = join(chaptersDir, 'question-chapter-index.json');

const index = {};
const chaptersSeen = new Set();
const subjectsSeen = new Set();

for (const file of readdirSync(chaptersDir)) {
  if (!file.endsWith('.json') || file === 'question-chapter-index.json') continue;
  const ch = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  if (!Array.isArray(ch.questions)) continue;
  const chapterId = ch.key ?? file.replace(/\.json$/, '');
  chaptersSeen.add(chapterId);
  if (ch.subject) subjectsSeen.add(ch.subject);
  const entry = {
    chapterId,
    title: ch.title ?? ch.chapter ?? chapterId,
    subject: ch.subject ?? 'General',
    exam: ch.exam_type === 'neet' ? 'neet' : 'jee',
  };
  for (const q of ch.questions) {
    if (q?.id == null) continue;
    const key = String(q.id);
    const list = index[key] ?? (index[key] = []);
    if (!list.some((e) => e.chapterId === entry.chapterId)) list.push(entry);
  }
}

let multi = 0;
for (const list of Object.values(index)) if (list.length > 1) multi++;

writeFileSync(outFile, JSON.stringify(index));
console.log(`chapters: ${chaptersSeen.size}, indexed questions: ${Object.keys(index).length}, multi-chapter: ${multi}`);
console.log(`subjects: ${[...subjectsSeen].join(', ')}`);
console.log(`wrote ${outFile} (${(Buffer.byteLength(JSON.stringify(index)) / 1024).toFixed(1)} KB)`);
