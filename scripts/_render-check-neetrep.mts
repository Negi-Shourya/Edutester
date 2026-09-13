import { readFileSync } from 'node:fs';
import { tokenizeMath } from '../src/lib/mathText.ts';
import katex from 'katex';
for (const paper of ['neet-2018', 'neet-2020', 'neet-2022', 'neet-2024', 'neet-2025', 'reneet-2026']) {
  const sols = JSON.parse(readFileSync('./scripts/solutions-' + paper + '.json', 'utf8'));
  let mathSegs = 0, errors = 0;
  for (const [qid, sol] of Object.entries(sols)) {
    for (const seg of tokenizeMath(sol)) {
      if (seg.kind !== 'math') continue;
      mathSegs++;
      try { katex.renderToString(seg.value, { throwOnError: true, strict: false, trust: true }); }
      catch (e) { errors++; console.log('ERR ' + paper + ' ' + qid + ': ' + seg.value.slice(0, 100)); }
    }
  }
  console.log(paper + ': ' + Object.keys(sols).length + ' sols | ' + mathSegs + ' segs | errors: ' + errors);
  if (errors) process.exitCode = 1;
}
