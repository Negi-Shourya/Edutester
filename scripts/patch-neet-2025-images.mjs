#!/usr/bin/env node
/**
 * Uploads the curated NEET 2025 diagram images (question_images/neet-2025-images/)
 * to Supabase Storage and links them to the NEET 2025 paper in the database.
 *
 * File naming convention (mirrors the neet/neet images folder):
 *   "Question N.png"          -> stem figure of question N
 *   "Question N option X.png" -> figure of option X (a/b/c/d) of question N
 *
 * Questions with a curated stem image get their figure_url replaced with it;
 * questions that only have curated option images get figure_url cleared so the
 * diagrams show up under the options instead of stale block screenshots.
 *
 * Run:  node scripts/patch-neet-2025-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const BUCKET = "question-images";
const FOLDER = "neet-2025-images";
const DIR = join(__dirname, "..", "question_images", "neet-2025-images");
const PUB_BASE = `${url}/storage/v1/object/public/${BUCKET}/${FOLDER}`;
const LETTER_TO_POS = { a: 1, b: 2, c: 3, d: 4 };

const supabase = createClient(url, key, { auth: { persistSession: false } });

function parseName(file) {
  const opt = file.match(/^Question (\d+) option ([a-d])\.png$/i);
  if (opt) return { qnum: Number(opt[1]), pos: LETTER_TO_POS[opt[2].toLowerCase()] };
  const stem = file.match(/^Question (\d+)\b.*\.png$/i);
  if (stem) return { qnum: Number(stem[1]), pos: null };
  return null;
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".png")).sort();
  if (!files.length) {
    console.error(`No PNG files in ${DIR}`);
    process.exit(1);
  }

  // 1. Upload all images (upsert) to the new storage folder
  let uploaded = 0;
  let failed = 0;
  for (const file of files) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${FOLDER}/${file}`, readFileSync(join(DIR, file)), {
        upsert: true,
        contentType: "image/png",
      });
    if (error) {
      console.error(`  FAIL ${file}: ${error.message}`);
      failed++;
    } else {
      uploaded++;
    }
  }
  console.log(`Storage: ${uploaded} uploaded to ${BUCKET}/${FOLDER}/ (${failed} failed)`);
  if (failed) process.exit(1);

  // 2. Map files -> questions/options
  const stemUrls = new Map();
  const optUrls = new Map();
  for (const file of files) {
    const p = parseName(file);
    if (!p) {
      console.error(`  UNPARSED ${file}`);
      continue;
    }
    const full = `${PUB_BASE}/${encodeURIComponent(file)}`;
    if (p.pos === null) stemUrls.set(p.qnum, full);
    else optUrls.set(`${p.qnum}:${p.pos}`, full);
  }
  console.log(`Mapping: ${stemUrls.size} stem image(s), ${optUrls.size} option image(s)`);

  // 3. Look up the paper's question ids
  const { data: paper } = await supabase
    .from("papers")
    .select("id")
    .eq("key", "neet-2025")
    .single();
  if (!paper) {
    console.error("neet-2025 paper not found");
    process.exit(1);
  }
  const { data: questions } = await supabase
    .from("questions")
    .select("id, number")
    .eq("paper_id", paper.id);
  const idByNumber = new Map(questions.map((q) => [q.number, q.id]));

  // 4. Update stem figures (replace stale automated clips with curated ones)
  for (const [qnum, fileUrl] of stemUrls) {
    const qid = idByNumber.get(qnum);
    if (!qid) {
      console.error(`  Q${qnum}: no question row`);
      continue;
    }
    const { error } = await supabase
      .from("questions")
      .update({ figure_url: [fileUrl] })
      .eq("id", qid);
    if (error) console.error(`  Q${qnum} stem update failed: ${error.message}`);
    else console.log(`  Q${qnum}: figure_url -> ${fileUrl.split("/").pop()}`);
  }

  // 5. Clear stem figures for questions that only have curated option images
  for (const qnum of new Set([...optUrls.keys()].map((k) => Number(k.split(":")[0])))) {
    if (stemUrls.has(qnum)) continue;
    const qid = idByNumber.get(qnum);
    if (!qid) continue;
    const { error } = await supabase
      .from("questions")
      .update({ figure_url: [] })
      .eq("id", qid);
    if (error) console.error(`  Q${qnum} stem clear failed: ${error.message}`);
    else console.log(`  Q${qnum}: figure_url cleared (option images only)`);
  }

  // 6. Update option figures
  let optUpdated = 0;
  for (const [keyStr, fileUrl] of optUrls) {
    const [qnum, pos] = keyStr.split(":").map(Number);
    const qid = idByNumber.get(qnum);
    if (!qid) continue;
    const { error } = await supabase
      .from("question_options")
      .update({ figure_url: fileUrl })
      .eq("question_id", qid)
      .eq("position", pos);
    if (error) console.error(`  Q${qnum} opt ${pos} update failed: ${error.message}`);
    else optUpdated++;
  }
  console.log(`Options: ${optUpdated} updated`);

  console.log("\nDone.");
}

await main();
