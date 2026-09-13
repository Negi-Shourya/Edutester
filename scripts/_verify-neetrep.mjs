import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const BS = String.fromCharCode(92);
function env(k){ const m = readFileSync('.env','utf8').split(/\r?\n/).find(l=>l.startsWith(k+'=')); return m ? m.slice(k.length+1).trim() : process.env[k]; }
const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
const checks = [
  [22092, 'h' + BS + 'nu = h'], [17944, BS + 'nabla} V'], [15190, 'h' + BS + 'nu - '],
  [15215, BS + 'nu_{0} = '], [15268, 'h' + BS + 'nu = '], [14193, 'E = h' + BS + 'nu.'],
  [14247, BS + 'ne 0, K_p'], [14031, BS + 'nu >'], [14064, '4' + BS + 'ne 3'],
  [18127, 'h' + BS + 'nu - '], [18152, 'E_A' + BS + 'ne 0'],
];
for (const [qid, want] of checks) {
  const { data: k } = await sb.from('question_keys').select('solution').eq('question_id', qid).single();
  console.log(qid, (k.solution || '').includes(want) ? 'RESTORED OK' : 'STILL BROKEN');
}
