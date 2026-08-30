import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { tokenizeMath } from '../src/lib/mathText';

const paperPath = path.resolve('jee-out/22-jan-evening-2025/questions.json');
const raw = fs.readFileSync(paperPath, 'utf-8');
const data = JSON.parse(raw);

let errCount = 0;
let checkedCount = 0;

function checkField(text: string, context: string) {
  if (!text) return;
  checkedCount++;

  // 1. Check for raw unescaped '$'
  if (text.includes('$')) {
    console.error(`DOLLAR SIGN FOUND in ${context}: "${text}"`);
    errCount++;
  }

  // 2. Check tokenizeMath output through KaTeX
  const tokens = tokenizeMath(text);
  for (const t of tokens) {
    if (t.type === 'math') {
      try {
        katex.renderToString(t.value, {
          throwOnError: true,
          displayMode: t.display || false,
        });
      } catch (e: any) {
        console.error(`KaTeX ERROR in ${context} [math: "${t.value}"]: ${e.message}`);
        errCount++;
      }
    }
  }
}

for (const q of data.questions) {
  checkField(q.text, `Q${q.number} text`);
  if (q.options) {
    for (const opt of q.options) {
      checkField(opt.text, `Q${q.number} option ${opt.label}`);
    }
  }
  if (q.solution) {
    checkField(q.solution, `Q${q.number} solution`);
  }
}

console.log(`\nVerified ${checkedCount} fields through Edutester tokenizer & KaTeX -> ${errCount} errors.`);
if (errCount > 0) {
  process.exit(1);
}
