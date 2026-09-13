import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
function env(k){ const m = readFileSync('.env','utf8').split(/\r?\n/).find(l=>l.startsWith(k+'=')); return m ? m.slice(k.length+1).trim() : process.env[k]; }
const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
const paperId = 3;
const { data: qs } = await sb.from('questions').select('id').eq('paper_id', paperId);
const qids = qs.map(q=>q.id);
const { data: keys } = await sb.from('question_keys').select('question_id,correct_answer,solution').in('question_id', qids);
let short = 0, numbered = 0, badEnd = 0, lines = [];
for (const k of keys) {
  const s = k.solution || '';
  const ls = s.split('\n').filter(l=>l.trim());
  lines.push(ls.length);
  if (ls.length < 2) short++;
  if (/(^|\n)\s*(Step\s*\d+\s*[:.)\]-]|\d+[.)]\s|[•]\s)/i.test(s)) numbered++;
  const last = (ls[ls.length-1] || '');
  const ok = /\([A-D]\)\s*$/.test(last) || /\(-?\d+(\.\d+)?\)\s*$/.test(last) || last.endsWith('(Bonus)');
  if (!ok) { badEnd++; console.log('BADEND', k.question_id, last.slice(-80)); }
}
lines.sort((a,b)=>a-b);
console.log(`total ${keys.length} | short<2: ${short} | numbered: ${numbered} | badEnd: ${badEnd} | lines min/med/max: ${lines[0]}/${lines[Math.floor(lines.length/2)]}/${lines[lines.length-1]}`);
