import { readFileSync, readdirSync } from "node:fs";
import { tokenizeMath } from "../src/lib/mathText.ts";

const files = readdirSync("public/papers").filter((f) => f.endsWith(".json"));
for (const file of files) {
  const data = JSON.parse(readFileSync(`public/papers/${file}`, "utf8"));
  let found = 0;
  for (const q of data.questions) {
    const texts = [q.text, ...(q.options || []).map((o: any) => o.text)];
    for (const text of texts) {
      if (!text) continue;
      const segs = tokenizeMath(text);
      for (const seg of segs) {
        if (seg.kind === "text" && seg.value.includes("\\")) {
          console.log(`[${file}] Q${q.number} (${q.section}): "${seg.value}" (from "${text}")`);
          found++;
        }
      }
    }
  }
  if (found > 0) console.log(`==> ${file}: ${found} stray backslashes\n`);
}
