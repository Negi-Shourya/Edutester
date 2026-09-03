// Validates scripts/solutions-<paper>.json before seeding.
// Checks (solution column only is ever written by the seeder):
//  1. every entry non-empty, no HTML/script tags, balanced braces
//  2. last line names the correct option letter, matching the DB key
// Usage: node scripts/check-solutions.mjs neet-2018
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
  console.error('Usage: node scripts/check-solutions.mjs <paper-key>');
  process.exit(1);
}

const solutions = JSON.parse(readFileSync(new URL(`./solutions-${paper}.json`, import.meta.url), 'utf8'));
const sb = createClient(envFromFile('SUPABASE_URL'), envFromFile('SUPABASE_SERVICE_ROLE_KEY'));
const paperId = (await sb.from('papers').select('id').eq('key', paper).single()).data.id;
const { data: qs } = await sb.from('questions').select('id,number').eq('paper_id', paperId);
const { data: keys } = await sb.from('question_keys').select('question_id,correct_answer').in('question_id', qs.map((q) => q.id));
const keyByQid = new Map(keys.map((k) => [String(k.question_id), k.correct_answer]));
const numByQid = new Map(qs.map((q) => [String(q.id), q.number]));

let errors = 0;
for (const [qid, sol] of Object.entries(solutions)) {
  const tag = `Q${numByQid.get(qid) ?? '?'} (id ${qid})`;
  if (!sol || typeof sol !== 'string' || sol.trim().length < 10) {
    console.log(`FAIL ${tag}: empty/too short`);
    errors++;
    continue;
  }
  if (/<script|<\/?[a-z][^>]*>/i.test(sol)) {
    console.log(`FAIL ${tag}: contains HTML`);
    errors++;
  }
  let depth = 0;
  for (const ch of sol) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    console.log(`FAIL ${tag}: unbalanced braces`);
    errors++;
  }
  const lines = sol.trim().split('\n').filter((l) => l.trim());
  const last = lines[lines.length - 1];
  const key = keyByQid.get(qid);
  // Single-letter keys end "(X)"; multi-award keys like "A,B" end "(A, B)".
  if (key && key.includes(',')) {
    const letters = key.split(',').map((s) => s.trim().toUpperCase());
    const ok = letters.every((L) => last.includes(`(${L})`) || last.includes(`${L},`) || last.includes(`, ${L}`));
    if (!ok) {
      console.log(`FAIL ${tag}: last line must name ${letters.join(', ')}: ${last.slice(0, 80)}`);
      errors++;
    }
    continue;
  }
  const m = last.match(/\(([A-D])\)\s*$/);
  if (!m) {
    console.log(`FAIL ${tag}: last line must end with (A)/(B)/(C)/(D): ${last.slice(0, 80)}`);
    errors++;
  } else if (key && m[1] !== key.trim().toUpperCase()) {
    console.log(`FAIL ${tag}: answer ${m[1]} != key ${key}`);
    errors++;
  }
}
console.log(errors === 0 ? `OK: ${Object.keys(solutions).length} solutions valid` : `${errors} ERRORS`);
process.exit(errors === 0 ? 0 : 1);
