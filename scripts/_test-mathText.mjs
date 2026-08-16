// Test harness for src/lib/mathText.ts — sweeps every JEE question text +
// option from the DB, renders every math segment with KaTeX (throwOnError)
// and reports failures / conversions. Run with: node scripts/_test-mathText.mjs
import { tokenizeMath } from '../src/lib/mathText.ts';
import { createClient } from '@supabase/supabase-js';
import katex from 'katex';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const env = readFileSync(join(process.cwd(), '.env'), 'utf8').split('\n');
const get = (k) => env.find((l) => l.trim().startsWith(k + '='))?.split('=').slice(1).join('=').trim();
const sb = createClient(get('VITE_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

const { data } = await sb.from('questions').select('id, paper_id, number, text').in('paper_id', [1, 2, 3, 4, 5, 6, 7, 8, 9]).order('paper_id').order('number');
const { data: opts } = await sb.from('question_options').select('question_id, text').in('paper_id', [1, 2, 3, 4, 5, 6, 7, 8, 9]);

const samples = [
  ...(data ?? []).map((q) => `[P${q.paper_id} Q${q.number}] ${q.text}`),
  ...(opts ?? []).filter((o) => o.text).map((o) => `[opt of q${o.question_id}] ${o.text}`),
];

let mathSegs = 0;
let errors = 0;
let matrices = 0;
let fracs = 0;
const errSamples = [];
const fracSamples = new Set();

const check = (seg) => {
  try {
    katex.renderToString(seg.value, { throwOnError: true, strict: false, trust: true, output: 'html' });
    return null;
  } catch (e) {
    return e;
  }
};

for (const raw of samples) {
  const segs = tokenizeMath(raw);
  for (const seg of segs) {
    if (seg.kind !== 'math') continue;
    mathSegs++;
    if (seg.value.includes('smallmatrix')) matrices++;
    if (seg.value.includes('\\frac')) {
      fracs++;
      fracSamples.add(raw.slice(0, 70));
    }
    const e = check(seg);
    if (e) {
      errors++;
      if (errSamples.length < 25) errSamples.push({ raw: raw.slice(0, 140), seg: seg.value.slice(0, 130), msg: e.message.split('\n')[0] });
    }
  }
}

console.log(`samples: ${samples.length} | math segments: ${mathSegs} | KaTeX errors: ${errors}`);
console.log(`matrices rendered: ${matrices} | fractions converted: ${fracs}`);
if (errSamples.length) {
  console.log('\n--- ERROR SAMPLES ---');
  for (const s of errSamples) console.log(`RAW: ${s.raw}\nSEG: ${s.seg}\nERR: ${s.msg}\n`);
} else {
  console.log('\nNo KaTeX errors.');
}
console.log('\n--- FRACTION EXAMPLES ---');
console.log([...fracSamples].slice(0, 30).join('\n'));
