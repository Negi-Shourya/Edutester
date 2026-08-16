#!/usr/bin/env node
/**
 * Restores the NEET 2022 questions/options that lost their figures when the
 * curated-image swap ran (scripts/replace-neet-2022-images.mjs), and removes
 * the corrupted text that was later written into those option rows.
 *
 * The curated set (neet/Neet 2022 images/) stays untouched. This only re-adds
 * the ORIGINAL paper scans (neet-out/2022/images/) for:
 *   - option figures of Q42, Q43, Q67 (a,b), Q72, Q99
 *   - stem figures of Q19, Q24, Q42, Q63, Q74, Q135, Q156, Q198, Q200
 *
 * Run:  node scripts/restore-neet-2022-originals.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

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
const PUB = `${url}/storage/v1/object/public/${BUCKET}/${PREFIX}`;
const IMG_DIR = fileURLToPath(new URL("../neet-out/2022/images/", import.meta.url));

// The questions/options whose figures the swap deleted (no curated replacement).
const STEM_FILES = {
  19: ["Q19_fig1.png"], 24: ["Q24_fig1.png"], 42: ["Q42_fig1.png"],
  63: ["Q63_fig1.png"], 74: ["Q74_fig1.png"], 135: ["Q135_fig1.png"],
  156: ["Q156_fig1.png"], 198: ["Q198_fig1.png", "Q198_fig2.png", "Q198_fig3.png", "Q198_fig4.png", "Q198_fig5.png"],
  200: ["Q200_fig1.png"],
};
// option position -> file (1-4). Q67 positions 3/4 keep their curated images.
const OPT_FILES = {
  42: { 1: "Q42_opt1.png", 2: "Q42_opt2.png", 3: "Q42_opt3.png", 4: "Q42_opt4.png" },
  43: { 1: "Q43_opt1.png", 2: "Q43_opt2.png", 3: "Q43_opt3.png", 4: "Q43_opt4.png" },
  67: { 1: "Q67_opt1.png", 2: "Q67_opt2.png" },
  72: { 1: "Q72_opt1.png", 2: "Q72_opt2.png", 3: "Q72_opt3.png", 4: "Q72_opt4.png" },
  99: { 1: "Q99_opt1.png", 2: "Q99_opt2.png", 3: "Q99_opt3.png", 4: "Q99_opt4.png" },
};

async function upload(file) {
  const path = join(IMG_DIR, file);
  if (!existsSync(path)) {
    console.error(`  MISSING LOCAL FILE ${file}`);
    return false;
  }
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${PREFIX}/${file}`, readFileSync(path), {
      upsert: true,
      contentType: "image/png",
    });
  if (error) {
    console.error(`  FAIL upload ${file}: ${error.message}`);
    return false;
  }
  return true;
}

const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2022").single();
const { data: questions } = await supabase
  .from("questions")
  .select("id, number, figure_url")
  .eq("paper_id", paper.id);
const { data: options } = await supabase
  .from("question_options")
  .select("id, question_id, position, text, figure_url")
  .in("question_id", questions.map((q) => q.id));
const numById = new Map(questions.map((q) => [q.id, q.number]));

// ---- 1) Stems: only touch rows that are currently empty (curated rows are left alone) ----
let stems = 0;
for (const q of questions) {
  const expected = STEM_FILES[q.number];
  if (!expected) continue;
  const current = q.figure_url ?? [];
  if (current.length > 0) continue;
  const ok = [];
  for (const f of expected) if (await upload(f)) ok.push(`${PUB}/${f}`);
  if (ok.length === expected.length) {
    const { error } = await supabase.from("questions").update({ figure_url: ok }).eq("id", q.id);
    if (error) console.error(`  Q${q.number} stem update failed: ${error.message}`);
    else {
      console.log(`  Q${q.number}: stem restored [${expected.join(", ")}]`);
      stems++;
    }
  }
}
console.log(`Stems restored: ${stems}`);

// ---- 2) Options: set figure_url + clear the corrupted text ----
let opts = 0;
for (const o of options) {
  const qnum = numById.get(o.question_id);
  const file = OPT_FILES[qnum]?.[o.position];
  if (!file) continue;
  let changed = false;
  if (!o.figure_url || o.text !== "") {
    const { error } = await supabase
      .from("question_options")
      .update({ figure_url: `${PUB}/${file}`, text: "" })
      .eq("id", o.id);
    if (error) {
      console.error(`  Q${qnum} opt ${o.position} update failed: ${error.message}`);
      continue;
    }
    changed = true;
  }
  if (await upload(file)) {
    console.log(`  Q${qnum} opt ${o.position}: figure=${file} text cleared`);
    opts++;
  }
}
console.log(`Options restored: ${opts}`);

// ---- 3) Verify ----
const { data: list } = await supabase.storage.from(BUCKET).list(PREFIX, { limit: 10000 });
const have = new Set(list.map((f) => f.name));
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
console.log(`\nVerify: storage=${have.size} broken_refs=${broken} blank_options=${blank.length}`);
if (blank.length) {
  const byQ = {};
  for (const o of blank) {
    const n = numById2.get(o.question_id);
    byQ[n] = (byQ[n] ?? 0) + 1;
  }
  console.log("  blanks:", Object.entries(byQ).map(([n, c]) => `Q${n}:${c}`).join(" "));
}
console.log("✅ Done.");
