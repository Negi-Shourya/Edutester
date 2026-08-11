#!/usr/bin/env node
/**
 * Replaces NEET 2024 images in Supabase Storage and remaps figure_url
 * on questions / question_options based on file names in
 * `neet/Neet 2024 images/`.
 *
 * Name conventions (parsed case-insensitively):
 *   "Question 104.png"          -> stem image for question 104
 *   "Question 11 option a.png"  -> option A image for question 11
 *
 * Steps:
 *   1. Deletes every file under the `neet-2024/` storage folder.
 *   2. Uploads all images from the local folder to `neet-2024/`.
 *   3. Clears figure_url on all NEET 2024 questions/options, then sets
 *      it only where a matching image exists (no broken references).
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env. Run:
 *   node scripts/apply-neet-2024-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
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
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const BUCKET = "question-images";
const PREFIX = "neet-2024";
const PUB_BASE = `${url}/storage/v1/object/public/${BUCKET}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, "..", "neet", "Neet 2024 images");

const QUESTION_RE = /^question\s+(\d+)\.png$/i;
const OPTION_RE = /^question\s+(\d+)\s+option\s+([a-d])\.png$/i;
const LETTERS = { a: "A", b: "B", c: "C", d: "D" };

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── 1. Delete all existing files under neet-2024/ ─────────────────────────
console.log(`Deleting all files in storage "${PREFIX}/"…`);
const { data: oldFiles, error: listErr } = await supabase.storage
  .from(BUCKET)
  .list(PREFIX, { limit: 1000 });
if (listErr) {
  console.error(`  list failed: ${listErr.message}`);
  process.exit(1);
}
if (oldFiles && oldFiles.length > 0) {
  const { error: rmErr } = await supabase.storage
    .from(BUCKET)
    .remove(oldFiles.map((o) => `${PREFIX}/${o.name}`));
  if (rmErr) {
    console.error(`  delete failed: ${rmErr.message}`);
    process.exit(1);
  }
  console.log(`  Removed ${oldFiles.length} file(s)`);
} else {
  console.log("  Nothing to remove.");
}

// ── 2. Upload the new images ──────────────────────────────────────────────
const files = readdirSync(IMG_DIR).filter((f) => /\.png$/i.test(f)).sort();
console.log(`Uploading ${files.length} image(s) from ${IMG_DIR}…`);
let uploaded = 0;
let failed = 0;
for (const file of files) {
  const data = readFileSync(join(IMG_DIR, file));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${PREFIX}/${file}`, data, { upsert: true, contentType: "image/png" });
  if (error) {
    console.error(`  FAIL ${file}: ${error.message}`);
    failed++;
  } else {
    uploaded++;
  }
}
console.log(`  Uploaded ${uploaded}, failed ${failed}`);

// ── 3. Remap figure_url on questions / options ────────────────────────────
console.log("Remapping figure_url…");
const { data: paper } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2024")
  .maybeSingle();
if (!paper) {
  console.error("NEET 2024 paper not found in DB.");
  process.exit(1);
}

const { data: questions } = await supabase
  .from("questions")
  .select("id, number")
  .eq("paper_id", paper.id);
const qIds = questions.map((q) => q.id);

const { data: options } = await supabase
  .from("question_options")
  .select("id, question_id, label")
  .in("question_id", qIds);

const byNum = new Map(questions.map((q) => [q.number, q]));
const optLookup = new Map();
for (const o of options) optLookup.set(`${o.question_id}:${o.label}`, o);

// Clear everything first so no broken references remain
const { error: clearQErr } = await supabase
  .from("questions")
  .update({ figure_url: null })
  .eq("paper_id", paper.id);
const { error: clearOErr } = await supabase
  .from("question_options")
  .update({ figure_url: null })
  .in("question_id", qIds);
if (clearQErr || clearOErr) {
  console.error(`  clear failed: ${clearQErr?.message ?? clearOErr?.message}`);
  process.exit(1);
}

let setQ = 0;
let setO = 0;
let unmatched = [];
for (const file of files) {
  const pub = `${PUB_BASE}/${PREFIX}/${file}`;
  const mOpt = file.match(OPTION_RE);
  if (mOpt) {
    const q = byNum.get(Number(mOpt[1]));
    const opt = q ? optLookup.get(`${q.id}:${LETTERS[mOpt[2].toLowerCase()]}`) : null;
    if (!opt) {
      unmatched.push(file);
      continue;
    }
    const { error } = await supabase
      .from("question_options")
      .update({ figure_url: pub })
      .eq("id", opt.id);
    if (error) console.error(`  FAIL set option ${file}: ${error.message}`);
    else setO++;
    continue;
  }
  const mQ = file.match(QUESTION_RE);
  if (mQ) {
    const q = byNum.get(Number(mQ[1]));
    if (!q) {
      unmatched.push(file);
      continue;
    }
    const { error } = await supabase
      .from("questions")
      .update({ figure_url: [pub] })
      .eq("id", q.id);
    if (error) console.error(`  FAIL set question ${file}: ${error.message}`);
    else setQ++;
    continue;
  }
  unmatched.push(file);
}

console.log(`  Questions updated: ${setQ}`);
console.log(`  Options updated: ${setO}`);
if (unmatched.length) {
  console.log("  Unmatched files (no DB row):");
  for (const f of unmatched) console.log(`    ${f}`);
}
console.log("Done.");
