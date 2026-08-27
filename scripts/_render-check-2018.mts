import { readFileSync } from "node:fs";
import katex from "katex";

const data = JSON.parse(readFileSync("neet-out/2018/questions.json", "utf8"));
let errors = 0;
let checked = 0;

// KaTeX token matching equivalent to mathText.ts
const GROUP_SRC = "{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}";
const SCRIPT_GROUP_SRC = "[_\\^]" + GROUP_SRC;
const SCRIPT_CMD_SRC = "_(?:\\\\[a-zA-Z]+|[A-Za-z0-9])";
const MATH_TOKEN_RE = new RegExp(
  String.raw`(?:\\[a-zA-Z]+(?:` +
    GROUP_SRC +
    String.raw`|` +
    SCRIPT_GROUP_SRC +
    String.raw`|` +
    SCRIPT_CMD_SRC +
    String.raw`|\[[^\]]*\])*|` +
    SCRIPT_GROUP_SRC +
    String.raw`|` +
    SCRIPT_CMD_SRC +
    String.raw`|\^[{0-9a-zA-Z+-]+|_[{0-9a-zA-Z+-]+)`,
  "g"
);

for (const q of data.questions) {
  for (const text of [q.text, ...q.options.map((o: any) => o.text)]) {
    if (!text) continue;
    const tokens = text.match(MATH_TOKEN_RE) || [];
    for (const t of tokens) {
      checked++;
      try {
        katex.renderToString(t, { throwOnError: true });
      } catch (e: any) {
        console.error(`KaTeX parse error in Q${q.number}: "${t}" -> ${e.message}`);
        errors++;
      }
    }
  }
}

console.log(`Render check: ${checked} KaTeX tokens verified across all 180 questions, ${errors} errors.`);
if (errors > 0) process.exit(1);
