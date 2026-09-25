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

const solutions = JSON.parse(readFileSync(new URL('./solutions-101.json', import.meta.url), 'utf8'));
const sb = createClient(envFromFile('SUPABASE_URL'), envFromFile('SUPABASE_SERVICE_ROLE_KEY'));

const entries = Object.entries(solutions);
let updated = 0;
for (const [qid, solution] of entries) {
  const { error } = await sb.from('question_keys').update({ solution }).eq('question_id', Number(qid));
  if (error) {
    console.error(`FAILED qid ${qid}: ${error.message}`);
    process.exit(1);
  }
  updated++;
  if (updated % 20 === 0 || updated === entries.length) {
    console.log(`Updated ${updated}/${entries.length}`);
  }
}

console.log('DONE: All 101 solutions seeded to database.');
