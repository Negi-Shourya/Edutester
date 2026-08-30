import fs from 'fs';
import katex from 'katex';

interface Question {
  question_number: number;
  subject: string;
  question_type: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  solution_text: string;
}

interface PaperData {
  key: string;
  questions: Question[];
}

const data: PaperData = JSON.parse(
  fs.readFileSync('jee-out/28-jan-evening-2025/questions.json', 'utf-8')
);

let mathCount = 0;
let errors = 0;

function checkMathInText(text: string, context: string) {
  // Check for $$...$$ blocks
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  let match: RegExpExecArray | null;
  while ((match = displayMathRegex.exec(text)) !== null) {
    mathCount++;
    const math = match[1].trim();
    try {
      katex.renderToString(math, { displayMode: true, throwOnError: true });
    } catch (e: any) {
      console.error(`[DISPLAY MATH ERROR] in ${context}:\nMath: "${math}"\nError: ${e.message}\n`);
      errors++;
    }
  }

  // Remove $$...$$ before checking $...$
  const withoutDisplay = text.replace(displayMathRegex, '');
  const inlineMathRegex = /\$([^\$\n]+?)\$/g;
  while ((match = inlineMathRegex.exec(withoutDisplay)) !== null) {
    mathCount++;
    const math = match[1].trim();
    try {
      katex.renderToString(math, { displayMode: false, throwOnError: true });
    } catch (e: any) {
      console.error(`[INLINE MATH ERROR] in ${context}:\nMath: "${math}"\nError: ${e.message}\n`);
      errors++;
    }
  }
}

for (const q of data.questions) {
  checkMathInText(q.question_text, `Q${q.question_number} question_text`);
  for (const opt of q.options) {
    checkMathInText(opt.text, `Q${q.question_number} opt ${opt.label}`);
  }
  if (q.solution_text) {
    checkMathInText(q.solution_text, `Q${q.question_number} solution_text`);
  }
}

console.log(`\n========================================`);
console.log(`Validation Complete for ${data.key}`);
console.log(`Total math blocks tested: ${mathCount}`);
console.log(`Total KaTeX errors: ${errors}`);
console.log(`========================================\n`);

if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
