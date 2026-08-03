#!/usr/bin/env node
/** Generates supabase/migrations/20260731030000_add_figure_url.sql
 *  mapping extracted images (question_images/<folder>/) to questions.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../question_images/", import.meta.url).pathname;
const OUT = new URL("../supabase/migrations/20260731030000_add_figure_url.sql", import.meta.url).pathname;

const MONTHS = { 1: "jan", 2: "feb", 3: "mar", 4: "apr", 5: "may", 6: "jun", 7: "jul", 8: "aug", 9: "sep", 10: "oct", 11: "nov", 12: "dec" };

const PAPER_ID = {
  "02-apr-morning": 1, "02-apr-evening": 2, "04-apr-morning": 3, "04-apr-evening": 4,
  "05-apr-morning": 5, "05-apr-evening": 6, "06-apr-morning": 7, "06-apr-evening": 8,
  "08-apr-evening": 9,
};

const BASE = "https://gvsgromfsqvywawauzfi.supabase.co/storage/v1/object/public/question-images";

function folderToPaperKey(folder) {
  const m = folder.match(/^(\d{4})-(\d{2})-(\d{2})-(morning|evening)$/);
  if (!m) return null;
  return `${m[3]}-${MONTHS[Number(m[2])]}-${m[4]}`;
}

const byPaper = new Map();
for (const folder of readdirSync(ROOT)) {
  const key = folderToPaperKey(folder);
  if (!key || !PAPER_ID[key]) continue;
  const files = readdirSync(join(ROOT, folder)).filter((f) => /^.+_Q\d+(?:_\d+)?\.(png|jpe?g)$/i.test(f)).sort();
  if (!files.length) continue;
  byPaper.set(key, files);
}

const lines = [
  "-- Add figure_url to questions and populate from the question-images storage bucket.",
  "do $$ begin",
  "  if not exists (select 1 from information_schema.columns",
  "                 where table_schema = 'public' and table_name = 'questions' and column_name = 'figure_url') then",
  "    alter table public.questions add column figure_url jsonb;",
  "  end if;",
  "end $$;",
  "",
  "update public.questions set figure_url = '[]'::jsonb where figure_url is null;",
  "",
];

for (const [key, files] of [...byPaper.entries()].sort()) {
  const id = PAPER_ID[key];
  const qnums = [...new Set(files.map((f) => Number(f.match(/_Q(\d+)/)[1])))];
  for (const qn of qnums.sort((a, b) => a - b)) {
    const qFiles = files
      .filter((f) => new RegExp(`_Q${qn}(?:_\\d+)?\\.`).test(f))
      .sort();
    const urls = qFiles.map((f) => `${BASE}/${folderFromKey(key)}/${f}`);
    lines.push(`-- ${key} Q${qn} (id ${id * 1000 + qn}): ${qFiles.length} image(s)`);
    lines.push(`update public.questions set figure_url = '${JSON.stringify(urls)}'::jsonb`);
    lines.push(`where id = ${id * 1000 + qn};`);
    lines.push("");
  }
}

writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${OUT}`);
console.log(byPaper.size, "papers,", [...byPaper.values()].reduce((a, f) => a + f.length, 0), "images mapped");

function folderFromKey(key) {
  return "2026-04-" + key.slice(0, 2) + "-" + key.slice(3).split("-").pop();
}
