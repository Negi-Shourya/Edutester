#!/usr/bin/env node
/**
 * Assembles neet-out/reneet-2026/questions.json from the 21 per-page
 * transcriptions plus the Code-50 answer key.
 *
 * Normalisations applied here (rather than in the page files, so the page
 * files stay a faithful record of the scan):
 *   - "Statement I :" / "Assertion A :" / "Reason R :"  → no space before the
 *     colon, which is what StatementQuestionRenderer matches on.
 *   - "Statement-I" / "Statement-II" in option text     → "Statement I/II",
 *     matching the spelling every other question in this paper uses.
 *
 * Answer key specials: Q26 is "Drop" (answers: []), Q38 is "2, 3".
 * `solution` is always null — the user does not want solutions on the site.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "neet-out", "reneet-2026");

const META = {
  key: "reneet-2026",
  title: "Re-NEET 2026",
  fullTitle: "Re-NEET (UG) 2026",
  examDate: "2026-06-21",
  durationMinutes: 195,
  questionCount: 180,
};

function normalise(s) {
  return s
    .replace(/\b(Statement I{1,2}|Assertion A|Reason R)\s+:/g, "$1:")
    .replace(/\bStatement-(I{1,2})\b/g, "Statement $1");
}

const pageFiles = readdirSync(join(DIR, "pages"))
  .filter((f) => /^p\d+\.json$/.test(f))
  .sort();

const raw = [];
for (const f of pageFiles) {
  raw.push(...JSON.parse(readFileSync(join(DIR, "pages", f), "utf8")));
}
raw.sort((a, b) => a.number - b.number);

const numbers = raw.map((q) => q.number);
const missing = [];
for (let n = 1; n <= 180; n++) if (!numbers.includes(n)) missing.push(n);
const dupes = numbers.filter((n, i) => numbers.indexOf(n) !== i);
if (missing.length || dupes.length) {
  console.error(`missing: ${missing.join(",")}  dupes: ${dupes.join(",")}`);
  process.exit(1);
}

const keyRaw = JSON.parse(readFileSync(join(DIR, "answer-key-code50.json"), "utf8"));

const questions = raw.map((q) => {
  const k = keyRaw[String(q.number)];
  const answers =
    !k || /^drop$/i.test(k.trim())
      ? []
      : k
          .split(/[,+]/)
          .map((s) => s.trim())
          .filter(Boolean);
  for (const a of answers) {
    if (!["1", "2", "3", "4"].includes(a)) {
      console.error(`Q${q.number}: bad answer token ${JSON.stringify(a)}`);
      process.exit(1);
    }
  }
  const labels = (q.options ?? []).map((o) => String(o.label));
  if (labels.join(",") !== "1,2,3,4") {
    console.error(`Q${q.number}: options are ${labels.join(",")}`);
    process.exit(1);
  }
  return {
    section: q.section,
    number: q.number,
    bookletNumber: q.number,
    text: normalise(q.text ?? ""),
    options: (q.options ?? []).map((o) => {
      const out = { label: String(o.label), text: normalise(o.text ?? "") };
      if (o.figure) out.figure = o.figure;
      return out;
    }),
    answers,
    solution: null,
    page: q.page,
    images: q.images ?? [],
  };
});

const sections = {};
for (const q of questions) sections[q.section] = (sections[q.section] ?? 0) + 1;

writeFileSync(
  join(DIR, "questions.json"),
  JSON.stringify({ ...META, questions }, null, 2) + "\n",
  "utf8"
);

const dropped = questions.filter((q) => !q.answers.length).map((q) => q.number);
const multi = questions.filter((q) => q.answers.length > 1).map((q) => `${q.number}=${q.answers}`);
console.log(`questions.json written: ${questions.length} questions`);
console.log(`  sections: ${Object.entries(sections).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`  dropped (no key): ${dropped.join(",") || "none"}`);
console.log(`  multi-answer: ${multi.join(", ") || "none"}`);
console.log(
  `  stem figures: ${questions.reduce((n, q) => n + q.images.length, 0)}, option figures: ${questions.reduce((n, q) => n + q.options.filter((o) => o.figure).length, 0)}`
);
