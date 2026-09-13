import { readFileSync } from 'node:fs';
import { tokenizeMath } from '../src/lib/mathText.ts';
import katex from 'katex';
const sols = JSON.parse(readFileSync('./scripts/solutions-02-apr-morning.json','utf8'));
let mathSegs = 0, errors = 0;
for (const [qid, sol] of Object.entries(sols)) {
  for (const seg of tokenizeMath(sol)) {
    if (seg.kind !== 'math') continue;
    mathSegs++;
    try { katex.renderToString(seg.value, { throwOnError: true, strict: false, trust: true }); }
    catch (e) { errors++; console.log('ERR ' + qid + ': ' + seg.value.slice(0, 100)); }
  }
  if (sol.includes('$')) console.log('WARN $ ' + qid);
}
console.log('solutions: ' + Object.keys(sols).length + ' | segs: ' + mathSegs + ' | errors: ' + errors);
process.exit(errors ? 1 : 0);
