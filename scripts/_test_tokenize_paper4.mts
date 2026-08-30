import fs from 'fs';
import { tokenizeMath } from '../src/lib/mathText';
import katex from 'katex';

const raw = fs.readFileSync('jee-out/23-jan-evening-2025/questions.json', 'utf-8');
const data = JSON.parse(raw);
const questions = Array.isArray(data) ? data : data.questions;

let errCount = 0;
let totalFields = 0;

function check(text: string, ctx: string) {
  if (!text) return;
  totalFields++;
  if (text.includes('$')) {
    console.error(`ERROR: Found literal '$' in ${ctx}: "${text}"`);
    errCount++;
  }
  if (text.includes('/frac')) {
    console.error(`ERROR: Found forward slash '/frac' in ${ctx}: "${text}"`);
    errCount++;
  }

  const tokens = tokenizeMath(text);
  for (const token of tokens) {
    if (token.kind === 'math') {
      try {
        katex.renderToString(token.value, { throwOnError: true, displayMode: false });
      } catch (err: any) {
        console.error(`KaTeX error in ${ctx} token "${token.value}": ${err.message}`);
        errCount++;
      }
    }
  }
}

for (const q of questions) {
  check(q.text, `Q${q.number} text`);
  if (q.options) {
    for (const opt of q.options) {
      check(opt.text, `Q${q.number} Opt ${opt.label}`);
    }
  }
  check(q.solution, `Q${q.number} solution`);
}

console.log(`\nVerified ${totalFields} fields through Edutester tokenizer & KaTeX -> ${errCount} errors.`);
if (errCount > 0) process.exit(1);
