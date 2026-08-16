#!/usr/bin/env node
/**
 * Removes questions from the older NEET papers (2022/2023/2024) so each paper
 * matches NEET 2025's 180-question layout (45 Physics / 45 Chemistry / 90 Biology,
 * with Biology split 45 Botany + 45 Zoology in spirit).
 *
 * Per paper it removes: 5 Physics + 5 Chemistry + 5 Botany + 5 Zoology,
 * preferring questions on the NMC rationalized-syllabus deleted topics.
 * NEET 2025 and all JEE papers are NEVER touched.
 *
 * After deletion the remaining questions are renumbered contiguously within
 * each section, following the NEET 2025 convention:
 *   2023/2024: Physics 1-45, Chemistry 46-90, Biology 91-180
 *   2022:      Physics 1-45, Chemistry 46-90, Botany 91-135, Zoology 136-180
 * and papers.question_count is set to 180.
 *
 * It also mirrors the removals into the local seed sources
 * (neet-out/{2022,2023,2024}/questions.json) so a future re-seed keeps them.
 *
 * Run:  node scripts/remove-neet-deleted-syllabus.mjs        (apply)
 *       node scripts/remove-neet-deleted-syllabus.mjs --dry-run   (preview only)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
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

const DRY_RUN = process.argv.includes("--dry-run");
const supabase = createClient(url, key, { auth: { persistSession: false } });

// ─────────────────────────────────────────────────────────────────────────
// Which questions to remove, per paper + section (by current question number).
// "deleted": clearly on the NMC rationalized-syllabus deleted topics.
// "borderline": closely tied to deleted topics (2024 papers were the first
// exams on the rationalized syllabus, so few of their questions are deleted).
// ─────────────────────────────────────────────────────────────────────────
const REMOVALS = {
  "neet-2022": {
    Physics: { nums: [13, 19, 44, 45, 50], note: "COM w/rod, radioactivity (β+), shear/modulus of rigidity, earth's magnetic field, nuclear radius" },
    Chemistry: { nums: [55, 63, 72, 75, 76], note: "chemistry in everyday life, solid state (Frenkel), states of matter (Dalton), surface chemistry, s-block" },
    Botany: { nums: [108, 114, 115, 121, 150], note: "mineral nutrition, transport in plants (girdling, apoplast), air pollution (ESP), CNG/environmental issues" },
    Zoology: { nums: [154, 169, 174, 179, 200], note: "digestion/lacteals, salivary glands, cockroach (tegmina), biofortification, air pollution (scrubber)" },
  },
  "neet-2023": {
    Physics: { nums: [1, 2, 13, 21, 33], note: "errors in measurement, Carnot engine (heat engines), carbon-resistor colour code, radioactivity half-life" },
    Chemistry: { nums: [59, 73, 84, 85, 93], note: "hydrogen, surface chemistry/catalysis, polymers, chemistry in everyday life (tranquilizers), metallurgy (blast furnace)" },
    Biology: { nums: [112, 113, 118, 142, 185, 158, 159, 164, 165, 188], note: "Botany: transport (transpiration), mineral nutrition ×2, tissue culture, air pollution (ESP); Zoology: digestive glands, caecum, eye, GI hormones, cockroach dimorphism" },
  },
  "neet-2024": {
    Physics: { nums: [7, 21, 29, 43, 44], note: "vernier callipers, nuclear decay chain, magnetometer/earth magnetism, telescope magnifying power, bent permanent magnet" },
    Chemistry: { nums: [58, 66, 77, 79, 94], note: "thermodynamic process definitions, quantum numbers, Bohr energy calc, sublimation purification, cyanides (deleted)" },
    Biology: { nums: [102, 110, 113, 117, 137, 154, 158, 161, 193, 194], note: "Botany: ex-situ conservation, fungi classification ×2, totipotency, somatic hybridization (tissue culture); Zoology: cockroach ×2, muscle types, digestive enzymes, bone marrow/thymus" },
  },
};

// Section order + renumbering start per paper (mirrors NEET 2025 layout).
const RENUMBER_START = {
  "neet-2022": { Physics: 1, Chemistry: 46, Botany: 91, Zoology: 136 },
  "neet-2023": { Physics: 1, Chemistry: 46, Biology: 91 },
  "neet-2024": { Physics: 1, Chemistry: 46, Biology: 91 },
};

async function fetchPaper(paperKey) {
  const { data: paper, error } = await supabase
    .from("papers")
    .select("id, key, title, question_count")
    .eq("key", paperKey)
    .single();
  if (error) throw new Error(`fetch paper ${paperKey}: ${error.message}`);
  const { data: sections, error: secErr } = await supabase
    .from("sections")
    .select("id, name, position")
    .eq("paper_id", paper.id)
    .order("position");
  if (secErr) throw new Error(`fetch sections ${paperKey}: ${secErr.message}`);
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, number, text, section_id")
    .eq("paper_id", paper.id)
    .order("number");
  if (qErr) throw new Error(`fetch questions ${paperKey}: ${qErr.message}`);
  return { paper, sections, questions };
}

const sectionNameOf = (sections, id) => sections.find((s) => s.id === id)?.name;

async function removeFromPaper(paperKey) {
  const { paper, sections, questions } = await fetchPaper(paperKey);
  const plan = REMOVALS[paperKey];
  const sectionByName = new Map(sections.map((s) => [s.name, s.id]));
  const byName = (name) => sectionByName.get(name);

  console.log(`\n=== ${paperKey} (${paper.title}) ===`);

  // Build the list of (question row, section name) to remove
  const toRemove = [];
  for (const [secName, spec] of Object.entries(plan)) {
    const secId = byName(secName);
    if (!secId) throw new Error(`${paperKey}: section ${secName} not found`);
    const secQs = questions.filter((q) => q.section_id === secId);
    const missing = spec.nums.filter((n) => !secQs.some((q) => q.number === n));
    if (missing.length) throw new Error(`${paperKey} ${secName}: numbers not found: ${missing.join(", ")}`);
    for (const n of spec.nums) {
      const q = secQs.find((x) => x.number === n);
      toRemove.push({ q, secName });
    }
  }

  if (toRemove.length !== 20) {
    throw new Error(`${paperKey}: expected 20 removals, got ${toRemove.length}`);
  }

  console.log(`  Removing ${toRemove.length} questions (${Object.entries(plan)
    .map(([s, spec]) => `${s}: ${spec.nums.length}`).join(", ")})`);
  for (const { q, secName } of [...toRemove].sort((a, b) => a.q.number - b.q.number)) {
    console.log(`    ${secName} Q${q.number} (id=${q.id}): ${(q.text ?? "").replace(/\s+/g, " ").slice(0, 90)}`);
  }

  if (DRY_RUN) {
    console.log("  [DRY RUN] not deleting.");
    return;
  }

  // 1. Delete (cascade removes question_options + question_keys)
  const ids = toRemove.map((t) => t.q.id);
  const { error: delErr } = await supabase.from("questions").delete().in("id", ids);
  if (delErr) throw new Error(`${paperKey}: delete failed: ${delErr.message}`);
  console.log(`  ✅ deleted ${ids.length} questions (cascade removes options + keys)`);

  // 2. Renumber remaining questions contiguously per section
  const start = RENUMBER_START[paperKey];
  for (const [secName, sId] of sectionByName.entries()) {
    if (!(secName in start)) continue;
    const remaining = questions
      .filter((q) => q.section_id === sId && !ids.includes(q.id))
      .sort((a, b) => a.number - b.number);
    for (let i = 0; i < remaining.length; i++) {
      const newNumber = start[secName] + i;
      if (remaining[i].number !== newNumber) {
        const { error: upErr } = await supabase
          .from("questions")
          .update({ number: newNumber })
          .eq("id", remaining[i].id);
        if (upErr) throw new Error(`${paperKey} ${secName} renumber: ${upErr.message}`);
      }
    }
    console.log(`  ${secName}: renumbered to ${start[secName]}-${start[secName] + remaining.length - 1} (${remaining.length} q)`);
  }

  // 3. Update question_count
  const { error: pcErr } = await supabase
    .from("papers")
    .update({ question_count: 180 })
    .eq("id", paper.id);
  if (pcErr) throw new Error(`${paperKey}: question_count update failed: ${pcErr.message}`);
  console.log(`  ✅ question_count -> 180`);
}

// ─────────────────────────────────────────────────────────────────────────
// Mirror removals into the local seed source files (neet-out/*/questions.json)
// ─────────────────────────────────────────────────────────────────────────
function mirrorLocalFiles() {
  for (const [paperKey, plan] of Object.entries(REMOVALS)) {
    const dir = join("neet-out", paperKey.replace("neet-", ""));
    const file = join(dir, "questions.json");
    let data;
    try {
      data = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      console.warn(`  ! could not read ${file}, skipping local mirror`);
      continue;
    }
    const removeSet = new Set(Object.values(plan).flatMap((spec) => spec.nums));
    const kept = data.questions.filter((q) => !removeSet.has(q.number));
    if (kept.length !== data.questions.length - 20) {
      console.warn(`  ! ${file}: expected to drop 20 questions, dropping ${data.questions.length - kept.length}; aborting local mirror`);
      continue;
    }
    const start = RENUMBER_START[paperKey];
    // renumber per section (case-insensitive section names in the json)
    const norm = (s) => (s || "").toLowerCase();
    const sectionOf = (q) => {
      for (const name of Object.keys(start)) if (norm(q.section) === norm(name)) return name;
      return null;
    };
    const counters = Object.fromEntries(Object.keys(start).map((k) => [k, start[k]]));
    for (const q of kept) {
      const sec = sectionOf(q);
      if (sec) q.number = counters[sec]++;
    }
    data.questionCount = kept.length;
    data.questions = kept;
    if (!DRY_RUN) {
      writeFileSync(file, JSON.stringify(data, null, 1) + "\n", "utf8");
      console.log(`  ✅ mirrored -> ${file} (${kept.length} questions)`);
    } else {
      console.log(`  [DRY RUN] would mirror -> ${file} (${kept.length} questions)`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
for (const paperKey of Object.keys(REMOVALS)) {
  await removeFromPaper(paperKey);
}
console.log("\n--- local seed files ---");
mirrorLocalFiles();
console.log(DRY_RUN ? "\n🎉 DRY RUN complete — nothing was changed." : "\n🎉 Done. NEET 2025 and JEE papers untouched.");
