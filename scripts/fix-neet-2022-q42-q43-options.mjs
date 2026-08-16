#!/usr/bin/env node
/**
 * Q42 / Q43 option text (extracted from the paper) + removal of every
 * scan image that was (re)added to NEET 2022 storage/DB from the PDF.
 *
 * - Q42, Q43 options: set TEXT (site markup, verified to render).
 * - All other non-curated rows (Q67 a/b, Q72, Q99 options; stems of
 *   Q19, Q24, Q42, Q63, Q74, Q135, Q156, Q198, Q200): figure_url cleared.
 * - The scan files themselves are deleted from storage.
 *
 * Run:  node scripts/fix-neet-2022-q42-q43-options.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync(new URL("../.env", import.meta.url), "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "question-images";
const PREFIX = "neet-2022";

// Q42 / Q43 option text — the actual paper content, in site markup.
// (Written via this file so the backslashes survive; verified to render.)
const TEXTS = {
  42: {
    1: "\\nu_{0} = \\nu = 50 Hz",
    2: "\\nu_{0} = \\nu = \\frac{50}{\\pi} Hz",
    3: "\\nu_{0} = \\frac{50}{\\pi} Hz, \\nu = 50 Hz",
    4: "\\nu = 100 Hz; \\nu_{0} = \\frac{100}{\\pi} Hz",
  },
  43: {
    1: "\\frac{1}{R^{2}}",
    2: "\\frac{1}{R^{3}}",
    3: "\\frac{1}{R^{4}}",
    4: "\\frac{1}{R^{6}}",
  },
};

// Scan files that must be removed from storage (all added by me).
const SCAN_FILES = [
  // options
  "Q42_opt1.png", "Q42_opt2.png", "Q42_opt3.png", "Q42_opt4.png",
  "Q43_opt1.png", "Q43_opt2.png", "Q43_opt3.png", "Q43_opt4.png",
  "Q67_opt1.png", "Q67_opt2.png",
  "Q72_opt1.png", "Q72_opt2.png", "Q72_opt3.png", "Q72_opt4.png",
  "Q99_opt1.png", "Q99_opt2.png", "Q99_opt3.png", "Q99_opt4.png",
  // stems
  "Q19_fig1.png", "Q24_fig1.png", "Q42_fig1.png", "Q63_fig1.png",
  "Q74_fig1.png", "Q135_fig1.png", "Q156_fig1.png",
  "Q198_fig1.png", "Q198_fig2.png", "Q198_fig3.png", "Q198_fig4.png", "Q198_fig5.png",
  "Q200_fig1.png",
];

// Stems to clear (non-curated questions whose scan stem was re-added).
const CLEAR_STEMS = [19, 24, 42, 63, 74, 135, 156, 198, 200];
// Options to clear figure on (no text replacement, back to post-swap state).
const CLEAR_OPTIONS = {
  67: [1, 2],
  72: [1, 2, 3, 4],
  99: [1, 2, 3, 4],
};

const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2022").single();
const { data: questions } = await supabase
  .from("questions")
  .select("id, number, figure_url")
  .eq("paper_id", paper.id);
const { data: options } = await supabase
  .from("question_options")
  .select("id, question_id, position, text, figure_url")
  .in("question_id", questions.map((q) => q.id));
const idByNum = new Map(questions.map((q) => [q.number, q.id]));
const numById = new Map(questions.map((q) => [q.id, q.number]));

// ---- 1) Q42 / Q43 option text ----
let textSet = 0;
for (const o of options) {
  const qnum = numById.get(o.question_id);
  const text = TEXTS[qnum]?.[o.position];
  if (text === undefined) continue;
  const { error } = await supabase
    .from("question_options")
    .update({ text, figure_url: null })
    .eq("id", o.id);
  if (error) console.error(`  FAIL Q${qnum} opt ${o.position}: ${error.message}`);
  else {
    console.log(`  Q${qnum} opt ${o.position}: text="${text}" (figure cleared)`);
    textSet++;
  }
}
console.log(`Q42/Q43 option text set: ${textSet}`);

// ---- 2) Clear remaining non-curated option figures ----
let cleared = 0;
for (const o of options) {
  const qnum = numById.get(o.question_id);
  const positions = CLEAR_OPTIONS[qnum];
  if (!positions?.includes(o.position)) continue;
  if (o.figure_url) {
    const { error } = await supabase.from("question_options").update({ figure_url: null }).eq("id", o.id);
    if (error) console.error(`  FAIL Q${qnum} opt ${o.position}: ${error.message}`);
    else {
      console.log(`  Q${qnum} opt ${o.position}: figure cleared`);
      cleared++;
    }
  }
}
console.log(`Other option figures cleared: ${cleared}`);

// ---- 3) Clear non-curated stems ----
let stemCleared = 0;
for (const num of CLEAR_STEMS) {
  const q = questions.find((x) => x.number === num);
  if (!q || !(q.figure_url ?? []).length) continue;
  const { error } = await supabase.from("questions").update({ figure_url: [] }).eq("id", q.id);
  if (error) console.error(`  FAIL Q${num} stem: ${error.message}`);
  else {
    console.log(`  Q${num}: stem figure cleared`);
    stemCleared++;
  }
}
console.log(`Stems cleared: ${stemCleared}`);

// ---- 4) Delete the scan files from storage ----
for (let i = 0; i < SCAN_FILES.length; i += 100) {
  const chunk = SCAN_FILES.slice(i, i + 100).map((n) => `${PREFIX}/${n}`);
  const { error } = await supabase.storage.from(BUCKET).remove(chunk);
  if (error) console.error(`  FAIL remove: ${error.message}`);
}
console.log(`Storage: requested removal of ${SCAN_FILES.length} scan files`);

// ---- 5) Verify ----
const { data: list } = await supabase.storage.from(BUCKET).list(PREFIX, { limit: 10000 });
const have = new Set(list.map((f) => f.name));
const leftovers = SCAN_FILES.filter((f) => have.has(f));
const { data: qs2 } = await supabase
  .from("questions")
  .select("id, number, figure_url")
  .eq("paper_id", paper.id);
const { data: opts2 } = await supabase
  .from("question_options")
  .select("question_id, position, text, figure_url")
  .in("question_id", qs2.map((q) => q.id));
const numById2 = new Map(qs2.map((q) => [q.id, q.number]));
let broken = 0;
for (const q of qs2) for (const u of q.figure_url ?? []) if (!have.has(u.split("/").pop())) broken++;
for (const o of opts2) if (o.figure_url && !have.has(o.figure_url.split("/").pop())) broken++;
const blank = opts2.filter((o) => (!o.text || !o.text.trim()) && !o.figure_url);
console.log(`\nVerify: storage=${have.size} scan_leftovers=${leftovers.length} broken_refs=${broken} blank_options=${blank.length}`);
if (blank.length) {
  const byQ = {};
  for (const o of blank) {
    const n = numById2.get(o.question_id);
    byQ[n] = (byQ[n] ?? 0) + 1;
  }
  console.log("  blanks:", Object.entries(byQ).map(([n, c]) => `Q${n}:${c}`).join(" "));
}
console.log("✅ Done.");
