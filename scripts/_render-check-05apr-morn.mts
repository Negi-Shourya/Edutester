import { readFileSync } from 'node:fs';
import { tokenizeMath } from '../src/lib/mathText.ts';
import katex from 'katex';
const sols = JSON.parse(readFileSync('./scripts/solutions-05-apr-morning.json','utf8'));
let mathSegs = 0, errors = 0;
const errSamples = [];
for (const [qid, sol] of Object.entries(sols)) {
  const segs = tokenizeMath(sol);
  for (const seg of segs) {
    if (seg.kind !== 'math') continue;
    mathSegs++;
    try {
      katex.renderToString(seg.value, { throwOnError: true, strict: false, trust: true });
    } catch (e) {
      errors++;
      if (errSamples.length < 15) errSamples.push({qid, seg: seg.value.slice(0,120), msg: String(e.message).split('\n')[0]});
    }
  }
  if (sol.includes('$')) console.log(`FORMAT WARN ${qid}: leftover $`);
}
console.log(`solutions: ${Object.keys(sols).length} | math segments: ${mathSegs} | KaTeX errors: ${errors}`);
for (const s of errSamples) console.log(`ERR qid ${s.qid}: ${s.seg} || ${s.msg}`);
process.exit(errors === 0 ? 0 : 1);
