import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { tokenizeMath } from '../src/lib/mathText.js';

const raw = fs.readFileSync('jee-out/22-jan-morning-2025/questions.json', 'utf8');
const data = JSON.parse(raw);

let errCount = 0;
let totalFields = 0;

function testField(str, context) {
  if (!str) return;
  totalFields++;
  try {
    const segments = tokenizeMath(str);
    for (const seg of segments) {
      if (seg.kind === 'math') {
        try {
          katex.renderToString(seg.value, { throwOnError: true });
        } catch (e) {
          console.error(`KaTeX ERROR in ${context} [math: "${seg.value}"]: ${e.message}`);
          errCount++;
        }
      }
    }
  } catch (e) {
    console.error(`Tokenize ERROR in ${context}: ${e.message}`);
    errCount++;
  }
}

for (const q of data.questions) {
  testField(q.text, `Q${q.number} text`);
  if (q.options) {
    for (const opt of q.options) {
      testField(opt.text, `Q${q.number} opt ${opt.label}`);
    }
  }
  testField(q.solution, `Q${q.number} solution`);
}

console.log(`\nVerified ${totalFields} fields through Edutester tokenizer & KaTeX -> ${errCount} errors.`);
