import fs from "node:fs";
import { tokenizeMath } from "../src/lib/mathText";
import katex from "katex";

const paperPath = "jee-out/24-jan-evening-2025/questions.json";
const paperData = JSON.parse(fs.readFileSync(paperPath, "utf8"));

let totalFields = 0;
let errors = 0;

function testField(name: string, text: string) {
  if (!text) return;
  totalFields++;
  const tokens = tokenizeMath(text);
  for (const token of tokens) {
    if (token.type === "math") {
      try {
        katex.renderToString(token.content, { throwOnError: true });
      } catch (err: any) {
        console.error(`❌ KaTeX Error in [${name}]:`, token.content);
        console.error("   Reason:", err.message);
        errors++;
      }
    }
  }
}

console.log(`Testing math tokenization and KaTeX rendering for Paper 6 (${paperData.questions.length} questions)...`);

for (const q of paperData.questions) {
  testField(`Q${q.number} text`, q.text);
  if (q.options) {
    for (const opt of q.options) {
      testField(`Q${q.number} Opt ${opt.label}`, opt.text);
    }
  }
  if (q.solution) {
    testField(`Q${q.number} solution`, q.solution);
  }
}

console.log(`\nResults: ${totalFields} fields tested, ${errors} KaTeX errors.`);
if (errors === 0) {
  console.log("✅ All math fields valid and rendered cleanly with KaTeX!");
} else {
  process.exit(1);
}
