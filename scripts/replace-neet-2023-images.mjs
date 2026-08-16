#!/usr/bin/env node
/**
 * Replaces the NEET 2023 figure images in Supabase (paper 40 only):
 *   1. Uploads the new images from neet/Neet 2023 images/{Physics,Chemistry,Biology}/
 *      into question-images/neet-2023/ with sanitized names (q<N>.png / q<N>_opt_<x>.png,
 *      using the remapped 1-200 numbering: phy 1-50, chem 51-100, bio 101-200).
 *   2. Updates questions.figure_url and question_options.figure_url for NEET 2023
 *      to point at the new files (clearing rows that have no replacement).
 *   3. Deletes every old object that was in the neet-2023 section of storage.
 *
 * Nothing outside the NEET 2023 paper/storage section is touched.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env. Run:
 *   node scripts/replace-neet-2023-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
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

const url = envFromFile("VITE_SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "question-images";
const PREFIX = "neet-2023";
const PUB = `${url}/storage/v1/object/public/${BUCKET}/${PREFIX}`;
const IMG_ROOT = fileURLToPath(new URL("../neet/Neet 2023 images/", import.meta.url));
// Subject folder -> remapped-number offset (booklet 1-50/1-100 per domain)
const SUBJECTS = { Physics: 0, Chemistry: 50, Biology: 100 };

async function listAllObjects() {
  const out = [];
  while (true) {
    const { data: page, error } = await supabase.storage
      .from(BUCKET)
      .list(PREFIX, { limit: 200, offset: out.length });
    if (error) throw new Error(`list: ${error.message}`);
    if (!page || page.length === 0) break;
    out.push(...page.map((o) => o.name));
  }
  return out;
}

async function runInParallel(items, fn, concurrency = 10) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(fn));
  }
}

// ---- 1) Collect new files and build the mapping ----
const stems = new Map(); // remapped number -> storage name
const opts = new Map(); // "num:letter" -> storage name
const uploads = []; // { from, to }

for (const [subject, offset] of Object.entries(SUBJECTS)) {
  const dir = join(IMG_ROOT, subject);
  if (!existsSync(dir)) {
    console.error(`MISSING folder: ${dir}`);
    process.exit(1);
  }
  for (const f of readdirSync(dir).filter((x) => x.toLowerCase().endsWith(".png")).sort()) {
    const m = f.match(/^Question\s*(\d+)(?:\s+option\s+([a-d]))?\.png$/i);
    if (!m) {
      console.error(`SKIP unexpected file name: ${subject}/${f}`);
      continue;
    }
    const num = Number(m[1]) + offset;
    const letter = m[2];
    const to = letter ? `q${num}_opt_${letter}.png` : `q${num}.png`;
    if (letter) opts.set(`${num}:${letter}`, to);
    else stems.set(num, to);
    uploads.push({ from: join(dir, f), to });
  }
}
console.log(`Collected ${uploads.length} new images (${stems.size} stem, ${opts.size} option images)`);

// ---- 2) Snapshot the old storage objects BEFORE uploading ----
const oldObjects = await listAllObjects();
console.log(`Old objects in ${BUCKET}/${PREFIX}/: ${oldObjects.length}`);

// ---- 3) Upload new images ----
let upFail = 0;
for (const { from, to } of uploads) {
  const data = readFileSync(from);
  const { error } = await supabase.storage.from(BUCKET).upload(`${PREFIX}/${to}`, data, {
    upsert: true,
    contentType: "image/png",
  });
  if (error) {
    console.error(`  FAIL upload ${to}: ${error.message}`);
    upFail++;
  }
}
if (upFail) {
  console.error(`${upFail} uploads failed — aborting before DB changes/delete.`);
  process.exit(1);
}
console.log(`Uploaded ${uploads.length} new images to ${PREFIX}/`);

// ---- 4) Update DB references (NEET 2023 only) ----
const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2023").single();
const { data: questions } = await supabase
  .from("questions")
  .select("id,number,figure_url")
  .eq("paper_id", paper.id);


const { data: options } = await supabase
  .from("question_options")
  .select("id,question_id,position,figure_url")
  .in("question_id", questions.map((q) => q.id));

let qChanged = 0;
for (const q of questions) {
  const target = stems.has(q.number) ? [`${PUB}/${stems.get(q.number)}`] : [];
  if (JSON.stringify(target) !== JSON.stringify(q.figure_url ?? [])) {
    const { error } = await supabase.from("questions").update({ figure_url: target }).eq("id", q.id);
    if (error) throw new Error(`question update Q${q.number}: ${error.message}`);
    qChanged++;
  }
}
console.log(`DB: updated ${qChanged} question figure_url rows`);

const letterByPos = ["a", "b", "c", "d"];
const numById = new Map(questions.map((q) => [q.id, q.number]));
let oChanged = 0;
await runInParallel(options, async (o) => {
  const num = numById.get(o.question_id);
  if (!num) return;
  const letter = letterByPos[o.position - 1];
  const name = opts.get(`${num}:${letter}`);
  const target = name ? `${PUB}/${name}` : null;
  if ((o.figure_url ?? null) !== target) {
    const { error } = await supabase.from("question_options").update({ figure_url: target }).eq("id", o.id);
    if (error) throw new Error(`option update Q${num} opt ${letter}: ${error.message}`);
    oChanged++;
  }
});
console.log(`DB: updated ${oChanged} option figure_url rows`);

// ---- 5) Delete the old objects (only those present before the upload) ----
let removed = 0;
for (let i = 0; i < oldObjects.length; i += 100) {
  const chunk = oldObjects.slice(i, i + 100).map((n) => `${PREFIX}/${n}`);
  const { error } = await supabase.storage.from(BUCKET).remove(chunk);
  if (error) throw new Error(`remove: ${error.message}`);
  removed += chunk.length;
}
console.log(`Deleted ${removed} old objects from ${PREFIX}/`);

// ---- 6) Verify ----
const remaining = await listAllObjects();
const orphans = remaining.filter((n) => !uploads.some((u) => u.to === n));
console.log(`\nRemaining objects in ${PREFIX}/: ${remaining.length}`);
if (orphans.length) console.log(`UNEXPECTED leftovers: ${orphans.join(", ")}`);
const referenced = new Set([...stems.values(), ...opts.values()]);
const missing = [...referenced].filter((n) => !remaining.includes(n));
if (missing.length) console.log(`MISSING new files in storage: ${missing.join(", ")}`);
console.log(`\n✅ NEET 2023 image swap complete.`);
console.log(`  New images: ${uploads.length}  |  Old deleted: ${removed}  |  DB rows: ${qChanged} questions, ${oChanged} options`);
process.exit(0);
