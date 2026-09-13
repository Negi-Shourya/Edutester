import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
function env(k){ const m = readFileSync('.env','utf8').split(/\r?\n/).find(l=>l.startsWith(k+'=')); return m ? m.slice(k.length+1).trim() : process.env[k]; }
const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
const { data: qs } = await sb.from('questions').select('id,section_id').eq('paper_id', 96);
const { data: secs } = await sb.from('sections').select('id,name').eq('paper_id', 96);
const secName = Object.fromEntries(secs.map(s=>[s.id, s.name]));
const { data: keys } = await sb.from('question_keys').select('question_id,correct_answer,solution').in('question_id', qs.map(q=>q.id));
const qm = Object.fromEntries(qs.map(q=>[q.id, secName[q.section_id].slice(0,4)]));
let numbered = 0, badEnd = 0; const lens = { Phys: [], Chem: [], Math: [] };
for (const k of keys) {
  const s = k.solution || '';
  const ls = s.split('\n').filter(l=>l.trim());
  lens[qm[k.question_id]].push(ls.length);
  if (/(^|\n)\s*(Step\s*\d+\s*[:.)\]-]|\d+[.)]\s|[•]\s)/i.test(s)) numbered++;
  const last = (ls[ls.length-1] || '');
  if (!(/\([A-D]\)\s*$/.test(last) || /\(-?\d+(\.\d+)?\)\s*$/.test(last) || last.endsWith('(Bonus)'))) { badEnd++; console.log('BADEND', k.question_id, last.slice(-60)); }
}
for (const [g, arr] of Object.entries(lens)) {
  arr.sort((a,b)=>a-b);
  console.log(g + ': n=' + arr.length + ' min/med/max=' + arr[0] + '/' + arr[Math.floor(arr.length/2)] + '/' + arr[arr.length-1]);
}
console.log('total ' + keys.length + ' | numbered: ' + numbered + ' | badEnd: ' + badEnd);
