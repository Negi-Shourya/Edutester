import { tokenizeMath } from "../src/lib/mathText.ts";
import katex from "katex";
import * as fs from "fs";
import * as path from "path";

const folders = fs.readdirSync("jee-out").filter(f => f.endsWith("2025"));

function render(s: string): { ok: boolean; error?: string } {
  try {
    for (const tk of tokenizeMath(s)) {
      if (tk.kind === "math") {
        katex.renderToString(tk.value, { throwOnError: true, strict: false });
      }
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message.slice(0, 120) };
  }
}

let totalErrors = 0;
let totalChecked = 0;

for (const fldr of folders) {
  const p = path.join("jee-out", fldr, "questions.json");
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  let fldrErrors = 0;

  for (const q of (data as any).questions) {
    const fields: [string, string][] = [["stem", q.text || ""]];
    for (const o of q.options || []) fields.push([`opt${o.label}`, o.text || ""]);
    if (q.solution) fields.push(["sol", q.solution]);

    for (const [field, text] of fields) {
      totalChecked++;
      if (!text.trim()) continue;
      const r = render(text);
      if (!r.ok) {
        fldrErrors++;
        totalErrors++;
        console.log(`[${fldr}] Q${q.number} ${field} ERROR: ${r.error}`);
        console.log(`   text: ${JSON.stringify(text.slice(0, 160))}`);
      }
    }
  }
  console.log(`[${fldr}] 75 questions checked, KaTeX parse errors: ${fldrErrors}`);
}

console.log(`\n======================================================`);
console.log(`Total fields checked: ${totalChecked}`);
console.log(`Total KaTeX parse errors across all 19 papers: ${totalErrors}`);
console.log(`======================================================`);

if (totalErrors > 0) process.exit(1);
