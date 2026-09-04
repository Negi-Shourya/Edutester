import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
function env(k) {
  const m = readFileSync('.env', 'utf8').split(/\r?\n/).find((l) => l.startsWith(k + '='));
  return m ? m.slice(k.length + 1).trim() : process.env[k];
}
const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
const args = process.argv.slice(2);
let paper = 'neet-2022';
let numbersArg = null;
if (args[0] && (args[0].startsWith('neet-') || args[0].startsWith('reneet-'))) {
  paper = args[0];
  numbersArg = args[1];
} else if (args[0]) {
  numbersArg = args[0];
}
const disputesFile = `scripts/key-disputes-${paper}.json`;
const d = JSON.parse(readFileSync(disputesFile, 'utf8'));
const only = numbersArg ? numbersArg.split(',').map(Number) : null;
const fixes = d.filter((x) => x.status === 'key-corrected' && x.correctedTo && (!only || only.includes(x.number)));
console.log(`[${paper}] pending key fixes:`, fixes.length);
for (const f of fixes) {
  const { data: cur } = await sb.from('question_keys').select('correct_answer').eq('question_id', f.id).single();
  if (cur.correct_answer === f.correctedTo) {
    console.log('Q' + f.number + ': already ' + f.correctedTo);
    continue;
  }
  const { error } = await sb.from('question_keys').update({ correct_answer: f.correctedTo }).eq('question_id', f.id);
  if (error) {
    console.log('Q' + f.number + ' FAILED: ' + error.message);
    process.exit(1);
  }
  console.log('Q' + f.number + ': ' + cur.correct_answer + ' -> ' + f.correctedTo);
}
