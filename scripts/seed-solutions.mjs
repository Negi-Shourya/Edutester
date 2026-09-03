// Seeds solutions into question_keys.solution — AND NOTHING ELSE.
// The questions table and correct_answer keys are never touched.
// Usage: node scripts/seed-solutions.mjs neet-2018
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const lines = readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/);
    const line = lines.find((l) => l.startsWith(key + '='));
    return line ? line.slice(key.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const paper = process.argv[2];
if (!paper) {
  console.error('Usage: node scripts/seed-solutions.mjs <paper-key>');
  process.exit(1);
}

const solutions = JSON.parse(readFileSync(new URL(`./solutions-${paper}.json`, import.meta.url), 'utf8'));
const sb = createClient(envFromFile('SUPABASE_URL'), envFromFile('SUPABASE_SERVICE_ROLE_KEY'));

const entries = Object.entries(solutions);
let updated = 0;
for (let i = 0; i < entries.length; i += 100) {
  const chunk = entries.slice(i, i + 100);
  for (const [qid, solution] of chunk) {
    const { error } = await sb.from('question_keys').update({ solution }).eq('question_id', Number(qid));
    if (error) {
      console.error(`FAILED qid ${qid}: ${error.message}`);
      process.exit(1);
    }
    updated++;
  }
  console.log(`...${updated}/${entries.length}`);
}

// Verify: count non-null solutions for this paper.
const paperId = (await sb.from('papers').select('id').eq('key', paper).single()).data.id;
const { data: qs } = await sb.from('questions').select('id').eq('paper_id', paperId);
const { data: keys } = await sb.from('question_keys').select('solution').in('question_id', qs.map((q) => q.id));
console.log(`DONE: ${keys.filter((k) => k.solution).length}/${qs.length} questions have solutions`);
