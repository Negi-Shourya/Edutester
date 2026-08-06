#!/usr/bin/env node
/**
 * Seeds the extracted NEET papers into the question bank.
 *
 * Reads questions.json + images/ produced by scripts/extract_neet.py, uploads
 * the images to the question-images storage bucket and inserts the paper,
 * sections, subsections, questions, options and private answer keys.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (or env var). Run:
 *   node scripts/seed-neet.mjs [2023 2024 2025 2026] [--force]
 * --force deletes an already-seeded paper (cascade) and re-seeds it,
 * including replacing every image in storage for that year.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

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

const OUT_DIR =
  process.env.NEET_OUT_DIR ??
  "/var/folders/yp/_yrrgw0x4pn0n3krhnhbnqvh0000gn/T/opencode/neet-out";

const FORCE = process.argv.includes("--force");
const YEARS = process.argv.slice(2).filter((a) => a !== "--force").length > 0
  ? process.argv.slice(2).filter((a) => a !== "--force")
  : ["2023", "2024", "2025", "2026"];
const BUCKET = "question-images";
const PUB_BASE = `${url}/storage/v1/object/public/${BUCKET}`;
const TRIAL_YEAR = "2026"; // NEET (UG) 2026 is the free-trial paper

const supabase = createClient(url, key, { auth: { persistSession: false } });

const LABEL_TO_LETTER = { "1": "A", "2": "B", "3": "C", "4": "D" };

// Extracted sections are uppercase ("PHYSICS"); the DB stores title case.
const TITLE_CASE = { PHYSICS: "Physics", CHEMISTRY: "Chemistry", MATHEMATICS: "Mathematics", BIOLOGY: "Biology", BOTANY: "Botany", ZOOLOGY: "Zoology" };
const sectionName = (name) => TITLE_CASE[name] ?? name;

// Questions whose stems were rendered as images (empty text layer in the PDF)
// should show that stem image first, before any other figure. Option figures
// are excluded: they render inline with their option row, so including them
// in the question body would show them twice.
function figureUrls(year, images, optionFigureFiles) {
  const ordered = [...images]
    .filter((f) => !optionFigureFiles.has(f))
    .sort((a, b) => {
      const aStem = a.endsWith("_stem.png") ? 0 : 1;
      const bStem = b.endsWith("_stem.png") ? 0 : 1;
      return aStem - bStem;
    });
  return ordered.map((f) => `${PUB_BASE}/neet-${year}/${f}`);
}

async function uploadImages(year, questions) {
  const dir = join(OUT_DIR, year, "images");
  const files = new Set();
  for (const q of questions) {
    for (const f of q.images ?? []) files.add(f);
    for (const o of q.options ?? []) if (o.figure) files.add(o.figure);
  }
  let uploaded = 0;
  let failed = 0;
  const prefix = `neet-${year}/`;
  for (const file of [...files].sort()) {
    const path = join(dir, file);
    if (!existsSync(path)) {
      console.error(`  MISSING FILE ${file}`);
      failed++;
      continue;
    }
    const data = readFileSync(path);
    const { error } = await supabase.storage.from(BUCKET).upload(prefix + file, data, {
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

  // Remove year-prefix files that are no longer referenced (e.g. the old
  // watermark images that were wrongly extracted before the fix).
  const { data: existingFiles, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 2000 });
  if (listError) {
    console.error(`  listing storage failed: ${listError.message}`);
  } else {
    const stale = (existingFiles ?? [])
      .filter((f) => !files.has(f.name))
      .map((f) => prefix + f.name);
    if (stale.length > 0) {
      const { error: delError } = await supabase.storage.from(BUCKET).remove(stale);
      if (delError) console.error(`  stale-file cleanup failed: ${delError.message}`);
      else console.log(`  removed ${stale.length} stale files`);
    }
  }

  console.log(`  images: ${uploaded} uploaded, ${failed} failed`);
  return failed === 0;
}

async function seedYear(year) {
  const file = join(OUT_DIR, year, "questions.json");
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    return;
  }
  const data = JSON.parse(readFileSync(file, "utf8"));
  const { key, title, fullTitle, examDate, durationMinutes, questionCount } = data;

  const { data: existing } = await supabase
    .from("papers")
    .select("id")
    .eq("key", key)
    .maybeSingle();
  if (existing && !FORCE) {
    console.log(`${key}: already seeded, skipping (use --force to re-seed)`);
    return;
  }
  if (existing) {
    const { error: delError } = await supabase.from("papers").delete().eq("id", existing.id);
    if (delError) {
      console.error(`  delete failed: ${delError.message}`);
      return;
    }
    console.log(`${key}: existing paper removed for re-seed`);
  }

  console.log(`Seeding ${key} (${title})`);
  if (!(await uploadImages(year, data.questions))) return;

  const optFigs = new Set();
  for (const q of data.questions) for (const o of q.options ?? []) if (o.figure) optFigs.add(o.figure);

  const { data: paper, error: paperError } = await supabase
    .from("papers")
    .insert({
      key,
      title,
      full_title: fullTitle,
      exam_date: examDate,
      session: null,
      year: Number(year),
      duration_minutes: durationMinutes,
      question_count: questionCount,
      exam_type: "neet",
      is_trial: year === TRIAL_YEAR,
    })
    .select("id")
    .single();
  if (paperError || !paper) {
    console.error(`  paper insert failed: ${paperError?.message}`);
    return;
  }
  const paperId = paper.id;

  const sectionNames = [];
  for (const q of data.questions) {
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

  // 2023/2024 have Section A (MCQ) + Section B (attempt any 10) subsections;
  // 2025/2026 have a single Biology section with no subsection split.
  const subsectionIds = {};
  const subNames = [];
  for (const q of data.questions) {
    if (q.subsection && !subNames.includes(q.subsection)) subNames.push(q.subsection);
  }
  for (const [idx, name] of subNames.entries()) {
    const { data: sub, error: subError } = await supabase
      .from("subsections")
      .insert({ section_id: sectionIds[subNameSectionOf(data.questions, name)], name, position: idx + 1 })
      .select("id")
      .single();
    if (subError) throw new Error(`subsection insert failed: ${subError.message}`);
    subsectionIds[name] = sub.id;
  }

  // Batched inserts: chunks of rows per request instead of one round-trip per
  // row (per-question round trips took >10 min for a 200-question paper).
  const CHUNK = 100;
  const chunked = (rows) => {
    const out = [];
    for (let i = 0; i < rows.length; i += CHUNK) out.push(rows.slice(i, i + CHUNK));
    return out;
  };

  const questionRows = data.questions.map((q, idx) => ({
    paper_id: paperId,
    section_id: sectionIds[sectionName(q.section)],
    subsection_id: q.subsection ? subsectionIds[q.subsection] : null,
    number: q.number,
    type: "mcq",
    text: q.text || "",
    marks: 4,
    negative_marks: -1,
    position: idx + 1,
    figure_url: figureUrls(year, q.images ?? [], optFigs),
  }));

  // Resume support: questions already inserted for this paper (e.g. after a
  // previous run timed out mid-paper) are skipped by position.
  const { data: existingQuestions } = await supabase
    .from("questions")
    .select("id, position, number")
    .eq("paper_id", paperId);

  const byPosition = new Map((existingQuestions ?? []).map((q) => [q.position, q]));

  let insertedCount = 0;
  for (const chunk of chunked(questionRows)) {
    const fresh = chunk.filter((r) => !byPosition.has(r.position));
    if (fresh.length === 0) continue;
    const { data: inserted, error: qError } = await supabase
      .from("questions")
      .insert(fresh)
      .select("id, position");
    if (qError) throw new Error(`questions insert failed: ${qError.message}`);
    for (const row of inserted) byPosition.set(row.position, row);
    insertedCount += inserted.length;
  }

  const optionRows = [];
  const keyRows = [];
  for (const [idx, q] of data.questions.entries()) {
    const question = byPosition.get(idx + 1);
    if (!question) {
      console.error(`  Q${q.number} has no question row — skipping its options/key`);
      continue;
    }
    for (const opt of q.options ?? []) {
      optionRows.push({
        question_id: question.id,
        position: Number(opt.label),
        label: LABEL_TO_LETTER[String(opt.label)] ?? opt.label,
        text: opt.text ?? "",
        figure_url: opt.figure ? `${PUB_BASE}/neet-${year}/${opt.figure}` : null,
      });
    }
    keyRows.push({
      question_id: question.id,
      correct_answer: (q.answers ?? []).map((a) => LABEL_TO_LETTER[a]).join(","),
      solution: q.solution?.trim() ? q.solution.trim() : null,
    });
  }

  for (const chunk of chunked(optionRows)) {
    const { error: optError } = await supabase.from("question_options").insert(chunk);
    if (optError) throw new Error(`options insert failed: ${optError.message}`);
  }
  for (const chunk of chunked(keyRows)) {
    const { error: keyError } = await supabase.from("question_keys").insert(chunk);
    if (keyError) throw new Error(`keys insert failed: ${keyError.message}`);
  }

  console.log(
    `  done: ${sectionNames.join(" / ")} — ${insertedCount} new / ${data.questions.length} total questions, ` +
      `${data.questions.reduce((n, q) => n + (q.images ?? []).length, 0)} images`
  );
}

function subNameSectionOf(questions, subName) {
  const raw = questions.find((q) => q.subsection === subName)?.section ?? questions[0].section;
  return sectionName(raw);
}

for (const year of YEARS) {
  await seedYear(year);
}
console.log("NEET seeding complete");
