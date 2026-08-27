#!/usr/bin/env node
/**
 * Seeds NEET 2019 extracted questions into the Supabase question bank.
 *
 * Reads neet-out/2019/questions.json + images, uploads images to storage,
 * inserts paper/sections/questions/options/keys into the database.
 *
 * Section order is Physics (1-45), Chemistry (46-90), Biology (91-180),
 * matching standard NEET papers.
 *
 * Run:  node scripts/seed-neet-2019.mjs [--force]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  for (const name of ["../.env", "../env"]) {
    try {
      const line = readFileSync(new URL(name, import.meta.url), "utf8")
        .split("\n")
        .find((l) => l.trim().startsWith(`${key}=`));
      if (line) return line.slice(line.indexOf("=") + 1).trim();
    } catch {
      // next candidate
    }
  }
  return undefined;
}

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");
const BUCKET = "question-images";
const PUB_BASE = `${url}/storage/v1/object/public/${BUCKET}`;
const FOLDER = "neet-2019";
const YEAR = 2019;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "neet-out", "2019");

const supabase = createClient(url, key, { auth: { persistSession: false } });

const LABEL_TO_LETTER = { "1": "A", "2": "B", "3": "C", "4": "D" };
const TITLE_CASE = {
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  BIOLOGY: "Biology",
};
const sectionName = (name) => TITLE_CASE[name.toUpperCase()] ?? name;

const BUST = Date.now();

function figureUrls(images, optionFigures) {
  const optFigSet = new Set(optionFigures);
  return images
    .filter((f) => !optFigSet.has(f))
    .map((f) => `${PUB_BASE}/${FOLDER}/${f}?v=${BUST}`);
}

async function uploadImages(questions) {
  const dir = join(OUT_DIR, "images");
  if (!existsSync(dir)) {
    console.log("  No images directory found, skipping upload.");
    return true;
  }

  const files = new Set();
  for (const q of questions) {
    for (const f of q.images ?? []) if (f) files.add(f);
    for (const o of q.options ?? []) {
      const f = o.figure ?? o.image;
      if (f) files.add(f);
    }
  }

  // Clean old storage objects
  let removed = 0;
  try {
    const { data: lst, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(FOLDER, { limit: 1000, offset: 0 });
    if (listErr) throw listErr;
    const stale = (lst ?? []).filter((o) => !files.has(o.name));
    if (stale.length) {
      const { error: rmErr } = await supabase.storage
        .from(BUCKET)
        .remove(stale.map((o) => `${FOLDER}/${o.name}`));
      if (rmErr) throw rmErr;
      removed = stale.length;
    }
  } catch {
    console.log("  Could not clean old storage objects, continuing.");
  }
  if (removed) console.log(`  Removed ${removed} stale objects from storage`);

  let uploaded = 0;
  let failed = 0;

  for (const file of [...files].sort()) {
    const path = join(dir, file);
    if (!existsSync(path)) {
      console.error(`  MISSING FILE ${file}`);
      failed++;
      continue;
    }
    const data = readFileSync(path);
    const { error } = await supabase.storage.from(BUCKET).upload(`${FOLDER}/${file}`, data, {
      upsert: true,
      contentType: file.endsWith(".png") ? "image/png" : "image/jpeg",
    });
    if (error) {
      console.error(`  FAIL ${file}: ${error.message}`);
      failed++;
    } else {
      uploaded++;
    }
  }

  console.log(`  Images: ${uploaded} uploaded, ${failed} failed`);
  return failed === 0;
}

async function seed() {
  const file = join(OUT_DIR, "questions.json");
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(file, "utf8"));
  const { key: paperKey, title, fullTitle, examDate, durationMinutes, questionCount } = data;
  const questions = [...data.questions].sort((a, b) => a.number - b.number);

  if (questions.length !== questionCount) {
    console.error(`  questionCount says ${questionCount} but found ${questions.length}`);
    process.exit(1);
  }
  const missingKey = questions.filter((q) => !(q.answers ?? []).length).map((q) => q.number);
  if (missingKey.length) {
    console.error(`  questions with no answer key: ${missingKey.join(", ")}`);
    process.exit(1);
  }

  console.log(`Seeding ${paperKey} (${title}): ${questionCount} questions`);

  const { data: existing } = await supabase
    .from("papers")
    .select("id")
    .eq("key", paperKey)
    .maybeSingle();

  if (existing && !FORCE) {
    console.log(`${paperKey}: already seeded, skipping (use --force to re-seed)`);
    return;
  }
  if (existing) {
    const { error: delError } = await supabase.from("papers").delete().eq("id", existing.id);
    if (delError) {
      console.error(`  delete failed: ${delError.message}`);
      return;
    }
    console.log(`${paperKey}: existing paper removed for re-seed`);
  }

  if (!(await uploadImages(questions))) {
    console.error("Image upload had failures, but continuing with seeding...");
  }

  const optFigs = [];
  for (const q of questions) {
    for (const o of q.options ?? []) {
      const f = o.figure ?? o.image;
      if (f) optFigs.push(f);
    }
  }

  const { data: paper, error: paperError } = await supabase
    .from("papers")
    .insert({
      key: paperKey,
      title,
      full_title: fullTitle,
      exam_date: examDate,
      session: null,
      year: YEAR,
      duration_minutes: durationMinutes,
      question_count: questionCount,
      exam_type: "neet",
      is_trial: false,
    })
    .select("id")
    .single();

  if (paperError || !paper) {
    console.error(`  paper insert failed: ${paperError?.message}`);
    return;
  }
  const paperId = paper.id;
  console.log(`  Paper inserted: id=${paperId}`);

  const sectionNames = [];
  for (const q of questions) {
    const name = sectionName(q.section);
    if (!sectionNames.includes(name)) sectionNames.push(name);
  }

  const sectionIds = {};
  for (const [idx, name] of sectionNames.entries()) {
    const { data: sec, error: secError } = await supabase
      .from("sections")
      .insert({ paper_id: paperId, name, position: idx + 1 })
      .select("id")
      .single();
    if (secError) throw new Error(`section insert failed: ${secError.message}`);
    sectionIds[name] = sec.id;
  }
  console.log(`  Sections: ${sectionNames.join(", ")}`);

  const CHUNK = 50;
  const chunked = (rows) => {
    const out = [];
    for (let i = 0; i < rows.length; i += CHUNK) out.push(rows.slice(i, i + CHUNK));
    return out;
  };

  const questionRows = questions.map((q, idx) => ({
    paper_id: paperId,
    section_id: sectionIds[sectionName(q.section)],
    subsection_id: null,
    number: q.number,
    type: "mcq",
    text: q.text || "",
    marks: 4,
    negative_marks: -1,
    position: idx + 1,
    figure_url: figureUrls(q.images ?? [], optFigs),
  }));

  const byPosition = new Map();
  let insertedCount = 0;

  for (const chunk of chunked(questionRows)) {
    const { data: inserted, error: qError } = await supabase
      .from("questions")
      .insert(chunk)
      .select("id, position");
    if (qError) throw new Error(`questions insert failed: ${qError.message}`);
    for (const row of inserted) byPosition.set(row.position, row);
    insertedCount += inserted.length;
  }
  console.log(`  Questions: ${insertedCount} inserted`);

  const optionRows = [];
  const keyRows = [];
  for (const [idx, q] of questions.entries()) {
    const question = byPosition.get(idx + 1);
    if (!question) {
      console.error(`  Q${q.number} has no question row — skipping options`);
      continue;
    }
    for (const opt of q.options ?? []) {
      const fig = opt.figure ?? opt.image;
      optionRows.push({
        question_id: question.id,
        position: Number(opt.label),
        label: LABEL_TO_LETTER[String(opt.label)] ?? opt.label,
        text: opt.text ?? "",
        figure_url: fig ? `${PUB_BASE}/${FOLDER}/${fig}?v=${BUST}` : null,
      });
    }
    const sol = Array.isArray(q.solution) ? q.solution.join("\n") : q.solution;
    keyRows.push({
      question_id: question.id,
      correct_answer: (q.answers ?? []).map((a) => LABEL_TO_LETTER[a] ?? a).join(","),
      solution: sol?.trim() ? sol.trim() : null,
    });
  }

  for (const chunk of chunked(optionRows)) {
    const { error: optError } = await supabase.from("question_options").insert(chunk);
    if (optError) throw new Error(`options insert failed: ${optError.message}`);
  }
  console.log(`  Options: ${optionRows.length} inserted`);

  for (const chunk of chunked(keyRows)) {
    const { error: keyError } = await supabase.from("question_keys").insert(chunk);
    if (keyError) throw new Error(`keys insert failed: ${keyError.message}`);
  }
  console.log(`  Keys: ${keyRows.length} inserted`);

  console.log(`\nNEET 2019 seeded successfully.`);
  console.log(`  Paper ID: ${paperId}`);
  console.log(`  Questions: ${insertedCount}`);
  console.log(`  Sections: ${sectionNames.join(", ")}`);
  console.log(`  Stem images: ${questions.reduce((n, q) => n + (q.images ?? []).length, 0)}`);
  console.log(`  Option images: ${optFigs.length}`);
}

await seed();
