import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';

const raw = fs.readFileSync('jee-out/22-jan-morning-2025/questions.json', 'utf8');
const data = JSON.parse(raw);

let errCount = 0;
let totalFields = 0;

function checkMath(str, context) {
  if (!str) return;
  totalFields++;
  // Look for inline math $...$ or raw formulas
  const mathRegex = /\$([^\$]+)\$/g;
  let match;
  while ((match = mathRegex.exec(str)) !== null) {
    const math = match[1];
    try {
      katex.renderToString(math, { throwOnError: true });
    } catch (e) {
      console.error(`KaTeX ERROR in ${context}: "${math}" -> ${e.message}`);
      errCount++;
    }
  }
}

for (const q of data.questions) {
  checkMath(q.text, `Q${q.number} text`);
  if (q.options) {
    for (const opt of q.options) {
      checkMath(opt.text, `Q${q.number} opt ${opt.label}`);
    }
  }
  checkMath(q.solution, `Q${q.number} solution`);
}

console.log(`\nKaTeX Check: Checked ${totalFields} fields in Paper 1 -> ${errCount} errors.`);
