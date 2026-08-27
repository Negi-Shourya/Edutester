import { tokenizeMath } from "../src/lib/mathText.ts";
import data from "../neet-out/reneet-2026/questions.json" with { type: "json" };
const want = new Set((process.argv.slice(2)).map(Number));
for (const q of (data as any).questions) {
  if (!want.has(q.number)) continue;
  const show = (label: string, t: string) => {
    if (!t.trim()) return;
    const segs = tokenizeMath(t).map((s) => (s.kind === "math" ? `⟦${s.value}⟧` : s.value)).join("");
    console.log(`Q${q.number} ${label}: ${segs}`);
  };
  show("stem", q.text);
  for (const o of q.options) show(`opt${o.label}`, o.text);
  console.log("");
}
