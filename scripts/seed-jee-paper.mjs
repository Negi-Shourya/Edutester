#!/usr/bin/env node
/**
 * Seeds a JEE Main paper from jee-out/<key>/questions.json into Supabase.
 * Uploads figure images to Supabase Storage and inserts paper, sections,
 * subsections, questions, options, and keys using fast batched inserts.
 *
 * Run:  node scripts/seed-jee-paper.mjs <paper-key> [--force]
 * E.g.: node scripts/seed-jee-paper.mjs 21-jan-morning --force
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
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
      // next
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

const paperKey = process.argv[2];
if (!paperKey || paperKey.startsWith("--")) {
  console.error("Usage: node scripts/seed-jee-paper.mjs <paper-key> [--force]");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "jee-out", paperKey);
const JSON_PATH = join(OUT_DIR, "questions.json");

if (!existsSync(JSON_PATH)) {
  console.error(`Missing file: ${JSON_PATH}`);
  process.exit(1);
}

const paperData = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const BUCKET = "question-images";
const PUB_BASE = `${url}/storage/v1/object/public/${BUCKET}`;
const FOLDER = paperData.year === 2026 && paperKey.includes("jan") ? `jee-2026-jan/${paperKey}` : `jee-${paperData.year || 2025}/${paperKey}`;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function uploadImages() {
  const dir = join(OUT_DIR, "images");
  if (!existsSync(dir)) {
    console.log("  No images directory found, skipping upload.");
    return;
  }

  const files = readdirSync(dir).filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"));
  if (files.length === 0) return;

  console.log(`Uploading ${files.length} images to ${BUCKET}/${FOLDER}...`);
  for (const f of files) {
    const filePath = join(dir, f);
    const blob = readFileSync(filePath);
    const dest = `${FOLDER}/${f}`;
    const { error } = await supabase.storage.from(BUCKET).upload(dest, blob, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw new Error(`Failed to upload ${f}: ${error.message}`);
  }
  console.log("  Images uploaded successfully.");
}

async function seed() {
  console.log(`\n=== Seeding JEE Paper: ${paperData.title} (${paperKey}) ===`);

  // 1. Check if paper already exists
  const { data: existing, error: checkErr } = await supabase
    .from("papers")
    .select("id")
    .eq("key", paperKey);

  if (checkErr) throw checkErr;

  if (existing && existing.length > 0) {
    if (!FORCE) {
      console.log(`Paper '${paperKey}' already exists with id ${existing[0].id}. Pass --force to replace.`);
      return;
    }
    console.log(`Paper exists with id ${existing[0].id}. Deleting old paper...`);
    const { error: delErr } = await supabase.from("papers").delete().eq("id", existing[0].id);
    if (delErr) throw delErr;
    console.log("  Old paper deleted.");
  }

  // 2. Upload images
  await uploadImages();

  // 3. Insert Paper
  const { data: paperRow, error: paperErr } = await supabase
    .from("papers")
    .insert({
      key: paperData.key,
      title: paperData.title,
      full_title: paperData.full_title,
      exam_date: paperData.exam_date,
      session: paperData.session,
      year: paperData.year || 2026,
      duration_minutes: paperData.duration_minutes || 180,
      question_count: paperData.question_count || 75,
      exam_type: "jee",
      is_trial: paperData.is_trial || false,
    })
    .select("id")
    .single();

  if (paperErr) throw new Error(`Failed to insert paper: ${paperErr.message}`);
  const pid = paperRow.id;
  console.log(`  Paper inserted with id ${pid}.`);

  // 4. Insert Sections (Physics, Chemistry, Mathematics)
  const sectionDefs = [
    { name: "Physics", position: 1 },
    { name: "Chemistry", position: 2 },
    { name: "Mathematics", position: 3 },
  ];

  const sectionMap = new Map();
  for (const s of sectionDefs) {
    const { data: secRow, error: secErr } = await supabase
      .from("sections")
      .insert({
        paper_id: pid,
        name: s.name,
        position: s.position,
      })
      .select("id")
      .single();
    if (secErr) throw new Error(`Failed to insert section ${s.name}: ${secErr.message}`);
    sectionMap.set(s.name, secRow.id);
  }

  // 5. Insert Subsections (Section A: pos 1, Section B: pos 2)
  const subSectionMap = new Map(); // `${secName}:${subName}` -> id
  for (const [secName, secId] of sectionMap.entries()) {
    for (const sub of [
      { name: "Section A", position: 1 },
      { name: "Section B", position: 2 },
    ]) {
      const { data: subRow, error: subErr } = await supabase
        .from("subsections")
        .insert({
          section_id: secId,
          name: sub.name,
          position: sub.position,
        })
        .select("id")
        .single();
      if (subErr) throw new Error(`Failed to insert subsection ${sub.name} for ${secName}: ${subErr.message}`);
      subSectionMap.set(`${secName}:${sub.name}`, subRow.id);
    }
  }

  // 6. Fast Batched Insert of Questions
  console.log(`  Inserting ${paperData.questions.length} questions in batch...`);
  const questionRows = paperData.questions.map((q, idx) => {
    const secId = sectionMap.get(q.section);
    const subSecId = subSectionMap.get(`${q.section}:${q.subSection}`);
    const figUrls = [];

    const rawFigs = [];
    if (q.figure) rawFigs.push(q.figure);
    if (q.diagram) rawFigs.push(q.diagram);
    if (q.image) rawFigs.push(q.image);
    if (Array.isArray(q.figure_url)) rawFigs.push(...q.figure_url);
    else if (typeof q.figure_url === "string") rawFigs.push(q.figure_url);
    if (Array.isArray(q.figures)) rawFigs.push(...q.figures);
    if (Array.isArray(q.images)) rawFigs.push(...q.images);

    // Also extract markdown images in text
    let cleanText = q.text || "";
    const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = mdImgRegex.exec(q.text || "")) !== null) {
      rawFigs.push(match[1]);
    }
    cleanText = cleanText.replace(mdImgRegex, "").trim();

    for (const f of rawFigs) {
      if (!f) continue;
      const finalUrl = f.startsWith("http") ? f : `${PUB_BASE}/${FOLDER}/${basename(f)}`;
      if (!figUrls.includes(finalUrl)) figUrls.push(finalUrl);
    }

    const secNum = ((q.number - 1) % 25) + 1;
    return {
      paper_id: pid,
      section_id: secId,
      subsection_id: subSecId,
      number: secNum,
      type: q.type,
      text: cleanText,
      marks: 4,
      negative_marks: -1,
      position: idx + 1,
      figure_url: figUrls,
    };
  });

  const { data: insertedQuestions, error: qErr } = await supabase
    .from("questions")
    .insert(questionRows)
    .select("id, position");

  if (qErr) throw new Error(`Failed to batch insert questions: ${qErr.message}`);

  const qIdByPos = new Map(insertedQuestions.map((r) => [r.position, r.id]));

  // 7. Fast Batched Insert of Options & Keys
  const optionRows = [];
  const keyRows = [];

  for (const [idx, q] of paperData.questions.entries()) {
    const qid = qIdByPos.get(idx + 1);
    if (!qid) continue;

    if (q.type === "mcq" && Array.isArray(q.options)) {
      for (const [optIdx, opt] of q.options.entries()) {
        let optFigRaw = opt.figure || opt.diagram || opt.image || opt.figure_url;
        let optCleanText = opt.text || "";
        const mdOptImg = /!\[.*?\]\((.*?)\)/.exec(opt.text || "");
        if (mdOptImg) {
          optFigRaw = mdOptImg[1];
          optCleanText = optCleanText.replace(/!\[.*?\]\(.*?\)/g, "").trim();
        }

        let optFig = null;
        if (optFigRaw) {
          optFig = optFigRaw.startsWith("http") ? optFigRaw : `${PUB_BASE}/${FOLDER}/${basename(optFigRaw)}`;
        }

        optionRows.push({
          question_id: qid,
          label: opt.label,
          position: optIdx + 1,
          text: optCleanText,
          figure_url: optFig,
        });
      }
    }

    if (q.correct_answer) {
      keyRows.push({
        question_id: qid,
        correct_answer: String(q.correct_answer),
        solution: q.solution || "",
      });
    }
  }

  if (optionRows.length > 0) {
    console.log(`  Inserting ${optionRows.length} options in batch...`);
    const { error: optErr } = await supabase.from("question_options").insert(optionRows);
    if (optErr) throw new Error(`Failed to batch insert options: ${optErr.message}`);
  }

  if (keyRows.length > 0) {
    console.log(`  Inserting ${keyRows.length} answer keys in batch...`);
    const { error: keyErr } = await supabase.from("question_keys").insert(keyRows);
    if (keyErr) throw new Error(`Failed to batch insert keys: ${keyErr.message}`);
  }

  console.log(`  Seeded ${questionRows.length} questions, ${optionRows.length} options, and ${keyRows.length} answer keys.`);
  console.log(`Done seeding ${paperKey}!\n`);
}

await seed();
