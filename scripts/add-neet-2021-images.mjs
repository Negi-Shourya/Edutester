#!/usr/bin/env node
/**
 * Uploads the user-curated NEET 2021 figure images (neet/Neet 2021 images/)
 * to Supabase Storage (question-images/neet-2021/) and wires them into the
 * DB for paper key 'neet-2021':
 *   1. Uploads images with sanitized names:
 *        "Question 138 full match the following table replace it.png" -> q138.png
 *        "Question 98 list I a.png" / "list I b.png" -> q98_list_i_a/b.png
 *        "Question N.png" -> qN.png (stem), "Question N option x.png" -> qN_opt_x.png
 *   2. Sets questions.figure_url (stems) and question_options.figure_url,
 *      clearing the "[Diagram/Graph from Paper]" placeholder text on options
 *      that now carry an image (the UI renders text OR image, not both).
 *   3. Rebuilds the garbled match-table stems of Q98 (List-I now image-based)
 *      and Q138 (full table replaced by image).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env. Run:
 *   node scripts/add-neet-2021-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
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
const PREFIX = "neet-2021";
const PUB = `${url}/storage/v1/object/public/${BUCKET}/${PREFIX}`;
const IMG_DIR = fileURLToPath(new URL("../neet/Neet 2021 images/", import.meta.url));

// ---- 1) Collect new files and build the mapping ----
const SPECIAL = {
  "Question 138 full match the following table replace it.png": "q138.png",
  "Question 98 list I a.png": "q98_list_i_a.png",
  "Question 98 list I b.png": "q98_list_i_b.png",
};

const stems = new Map(); // question number -> storage name
const opts = new Map(); // "num:letter" -> storage name
const uploads = []; // { from, to }

for (const f of readdirSync(IMG_DIR).filter((x) => x.toLowerCase().endsWith(".png")).sort()) {
  if (SPECIAL[f]) {
    const to = SPECIAL[f];
    const m = f.match(/^Question\s*(\d+)/);
    stems.set(Number(m[1]), to);
    uploads.push({ from: join(IMG_DIR, f), to });
    continue;
  }
  const m = f.match(/^Question\s*(\d+)(?:\s+option\s+([a-d]))?\.png$/i);
  if (!m) {
    console.error(`SKIP unexpected file name: ${f}`);
    continue;
  }
  const num = Number(m[1]);
  const letter = m[2];
  const to = letter ? `q${num}_opt_${letter.toLowerCase()}.png` : `q${num}.png`;
  if (letter) opts.set(`${num}:${letter.toLowerCase()}`, to);
  else stems.set(num, to);
  uploads.push({ from: join(IMG_DIR, f), to });
}
console.log(`Collected ${uploads.length} new images (${stems.size} stem, ${opts.size} option images)`);

// ---- 2) Upload new images ----
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
  console.error(`${upFail} uploads failed — aborting before DB changes.`);
  process.exit(1);
}
console.log(`Uploaded ${uploads.length} new images to ${PREFIX}/`);

// ---- 3) Update DB references (NEET 2021 only) ----
const { data: paper, error: perr } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2021")
  .single();
if (perr) throw new Error(`paper lookup: ${perr.message}`);
const { data: questions } = await supabase
  .from("questions")
  .select("id,number,text,figure_url")
  .eq("paper_id", paper.id);

const { data: options } = await supabase
  .from("question_options")
  .select("id,question_id,position,text,figure_url")
  .in("question_id", questions.map((q) => q.id));

let qChanged = 0;
for (const q of questions) {
  const name = stems.get(q.number);
  const target = name ? [PUB + "/" + name] : [];
  if (q.number === 98) target.splice(0, target.length, PUB + "/q98_list_i_a.png", PUB + "/q98_list_i_b.png");
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
for (const o of options) {
  const num = numById.get(o.question_id);
  if (!num) continue;
  const letter = letterByPos[o.position - 1];
  const name = opts.get(`${num}:${letter}`);
  const target = name ? `${PUB}/${name}` : null;
  const patch = {};
  if ((o.figure_url ?? null) !== target) patch.figure_url = target;
  if (name && o.text === "[Diagram/Graph from Paper]") patch.text = "";
  if (Object.keys(patch).length) {
    const { error } = await supabase.from("question_options").update(patch).eq("id", o.id);
    if (error) throw new Error(`option update Q${num} opt ${letter}: ${error.message}`);
    oChanged++;
  }
}
console.log(`DB: updated ${oChanged} option rows (figure_url / placeholder text)`);

// ---- 4) Rebuild garbled match-table stems (Q98: List-I now images; Q138: full table image) ----
const STEM_NEW = new Map([
  [
    98,
    "Match List - I with List - II.\n| List-I | List-II |\n| (a) | (i) Hell-Volhard-Zelinsky reaction |\n| (b) | (ii) Gattermann-Koch reaction |\n| (c) | (iii) Haloform + R'COOH reaction |\n| (d) | (iv) Esterification |",
  ],
  [138, "Match Column - I with Column - II."],
]);
let tChanged = 0;
for (const q of questions) {
  if (!STEM_NEW.has(q.number)) continue;
  if (q.text === STEM_NEW.get(q.number)) continue;
  const { error } = await supabase.from("questions").update({ text: STEM_NEW.get(q.number) }).eq("id", q.id);
  if (error) throw new Error(`stem update Q${q.number}: ${error.message}`);
  tChanged++;
}
console.log(`DB: rebuilt ${tChanged} match-table stems (Q98, Q138)`);

// ---- 5) Verify ----
const { data: stored } = await supabase.storage.from(BUCKET).list(PREFIX, { limit: 200 });
const storedNames = (stored || []).map((o) => o.name).sort();
const expected = uploads.map((u) => u.to).sort();
console.log(`\nStorage objects in ${PREFIX}/: ${storedNames.length}`);
const missing = expected.filter((n) => !storedNames.includes(n));
const orphans = storedNames.filter((n) => !expected.includes(n));
if (missing.length) console.log(`MISSING new files in storage: ${missing.join(", ")}`);
if (orphans.length) console.log(`UNEXPECTED extra files in storage: ${orphans.join(", ")}`);

const { data: checkQ } = await supabase
  .from("questions")
  .select("number,text,figure_url")
  .eq("paper_id", paper.id)
  .in("number", [...stems.keys()]);
for (const q of checkQ) console.log(`  Q${q.number}: ${q.figure_url.join(", ") || "(none)"}`);
console.log(`\n✅ NEET 2021 image add complete.`);
process.exit(0);
