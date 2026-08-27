import { tokenizeMath } from "../src/lib/mathText.ts";
import katex from "katex";
import data from "../neet-out/2019/questions.json" with { type: "json" };

function render(s: string): { ok: boolean; error?: string } {
  try {
    for (const tk of tokenizeMath(s)) {
      if (tk.kind === "math") katex.renderToString(tk.value, { throwOnError: true });
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message.slice(0, 160) };
  }
}

let errors = 0;
let checked = 0;
for (const q of (data as any).questions) {
  const fields: [string, string][] = [["stem", q.text || ""]];
  for (const o of q.options || []) fields.push([`opt${o.label}`, o.text || ""]);
  for (const [field, text] of fields) {
    checked++;
    if (!text.trim()) continue;
    const r = render(text);
    if (!r.ok) {
      errors++;
      console.log(`Q${q.number} ${field} ERROR: ${r.error}`);
      console.log(`   text: ${JSON.stringify(text.slice(0, 200))}`);
    }
  }
}
console.log(`\nChecked ${checked} fields; ${errors} KaTeX parse errors.`);
if (errors > 0) process.exit(1);
