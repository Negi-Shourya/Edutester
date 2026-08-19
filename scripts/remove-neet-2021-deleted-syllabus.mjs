#!/usr/bin/env node
/**
 * Removes questions from the NEET 2021 paper so it matches NEET 2025's
 * 180-question layout (45 Physics / 45 Chemistry / 45 Botany / 45 Zoology).
 *
 * Removes 5 questions per section, all on NMC rationalized-syllabus deleted
 * topics (NCERT 2023 rationalization = NMC NEET syllabus basis):
 *   Physics:   Q1  zener diode (14.8 special purpose p-n junction diodes)
 *              Q19 radioactive decay sequence (13.6.2-4 alpha/beta/gamma decay)
 *              Q22 screw gauge (2.3 measurement of length + 2.6 errors)
 *              Q27 potentiometer (3.16)
 *              Q38 digital electronics and logic gates (14.9)
 *   Chemistry: Q52 solid state (Bravais lattices — chapter deleted)
 *              Q57 surface chemistry (Tyndall effect — chapter deleted)
 *              Q59 metallurgy (isolation of elements — chapter deleted)
 *              Q63 states of matter (Boyle's law — chapter deleted)
 *              Q85 hydrogen (tritium — chapter deleted)
 *   Botany:    Q114 tissue culture / protoplast fusion (Strategies for
 *                    Enhancement in Food Production — chapter deleted)
 *              Q117 photoperiodism (15.5 deleted)
 *              Q127 transport in plants (cohesion/adhesion/guttation —
 *                    chapter deleted)
 *              Q128 diadelphous stamens / pea (5.9.1 Fabaceae deleted)
 *              Q134 standing state (14.7 ecosystem nutrient cycling deleted)
 *   Zoology:   Q154 cockroach morphology/anatomy (7.4 deleted)
 *              Q156 sphincter of oddi (Digestion and Absorption — chapter
 *                    deleted)
 *              Q165 biofortification (Strategies for Enhancement in Food
 *                    Production — chapter deleted)
 *              Q174 Dobson units / ozone (Environmental Issues — chapter
 *                    deleted)
 *              Q190 Allen's rule / adaptations (13.1.3 deleted)
 *
 * After deletion the remaining questions are renumbered contiguously per
 * section (Physics 1-45, Chemistry 46-90, Botany 91-135, Zoology 136-180)
 * and papers.question_count is set to 180. The local seed source
 * (neet-out/2021/questions.json) is mirrored so a future re-seed keeps it.
 * Answer keys are never modified.
 *
 * Run:  node scripts/remove-neet-2021-deleted-syllabus.mjs        (apply)
 *       node scripts/remove-neet-2021-deleted-syllabus.mjs --dry-run   (preview)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

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

const PAPER_KEY = "neet-2021";

// Questions to remove, by section (current question numbers).
const REMOVALS = {
  Physics: {
    nums: [1, 19, 22, 27, 38],
    note: "zener diode, radioactive decay sequence, screw gauge, potentiometer, digital logic gates",
  },
  Chemistry: {
    nums: [52, 57, 59, 63, 85],
    note: "solid state (Bravais), surface chemistry (Tyndall), metallurgy, states of matter (Boyle), hydrogen (tritium)",
  },
  Botany: {
    nums: [114, 117, 127, 128, 134],
    note: "tissue culture/somatic hybridization, photoperiodism, transport in plants, Fabaceae, ecosystem nutrient cycling",
  },
  Zoology: {
    nums: [154, 156, 165, 174, 190],
    note: "cockroach, digestion (sphincter of oddi), biofortification, environmental issues (ozone), adaptations",
  },
};

// Section order + renumbering start (mirrors NEET 2025 layout).
const RENUMBER_START = { Physics: 1, Chemistry: 46, Botany: 91, Zoology: 136 };

const { data: paper, error: pErr } = await supabase
  .from("papers")
  .select("id, key, title, question_count")
  .eq("key", PAPER_KEY)
  .single();
if (pErr) throw new Error(`fetch paper: ${pErr.message}`);

const { data: sections, error: secErr } = await supabase
  .from("sections")
  .select("id, name, position")
  .eq("paper_id", paper.id)
  .order("position");
if (secErr) throw new Error(`fetch sections: ${secErr.message}`);

const { data: questions, error: qErr } = await supabase
  .from("questions")
  .select("id, number, text, section_id")
  .eq("paper_id", paper.id)
  .order("number");
if (qErr) throw new Error(`fetch questions: ${qErr.message}`);

const sectionByName = new Map(sections.map((s) => [s.name, s.id]));
const byName = (name) => sectionByName.get(name);

console.log(`=== ${paper.key} (${paper.title}) ===`);

const toRemove = [];
for (const [secName, spec] of Object.entries(REMOVALS)) {
  const secId = byName(secName);
  if (!secId) throw new Error(`${secName}: section not found`);
  const secQs = questions.filter((q) => q.section_id === secId);
  const missing = spec.nums.filter((n) => !secQs.some((q) => q.number === n));
  if (missing.length) throw new Error(`${secName}: numbers not found: ${missing.join(", ")}`);
  for (const n of spec.nums) toRemove.push({ q: secQs.find((x) => x.number === n), secName });
}

if (toRemove.length !== 20) {
  throw new Error(`expected 20 removals, got ${toRemove.length}`);
}

console.log(`  Removing ${toRemove.length} questions (${Object.entries(REMOVALS)
  .map(([s, spec]) => `${s}: ${spec.nums.length}`).join(", ")})`);
for (const { q, secName } of [...toRemove].sort((a, b) => a.q.number - b.q.number)) {
  console.log(`    ${secName} Q${q.number} (id=${q.id}): ${(q.text ?? "").replace(/\s+/g, " ").slice(0, 90)}`);
}

if (DRY_RUN) {
  console.log("  [DRY RUN] not deleting.");
} else {
  const ids = toRemove.map((t) => t.q.id);
  const { error: delErr } = await supabase.from("questions").delete().in("id", ids);
  if (delErr) throw new Error(`delete failed: ${delErr.message}`);
  console.log(`  ✅ deleted ${ids.length} questions (cascade removes options + keys)`);

  for (const [secName, sId] of sectionByName.entries()) {
    if (!(secName in RENUMBER_START)) continue;
    const remaining = questions
      .filter((q) => q.section_id === sId && !ids.includes(q.id))
      .sort((a, b) => a.number - b.number);
    for (let i = 0; i < remaining.length; i++) {
      const newNumber = RENUMBER_START[secName] + i;
      if (remaining[i].number !== newNumber) {
        const { error: upErr } = await supabase
          .from("questions")
          .update({ number: newNumber })
          .eq("id", remaining[i].id);
        if (upErr) throw new Error(`${secName} renumber: ${upErr.message}`);
      }
    }
    console.log(`  ${secName}: renumbered to ${RENUMBER_START[secName]}-${RENUMBER_START[secName] + remaining.length - 1} (${remaining.length} q)`);
  }

  const { error: pcErr } = await supabase
    .from("papers")
    .update({ question_count: 180 })
    .eq("id", paper.id);
  if (pcErr) throw new Error(`question_count update failed: ${pcErr.message}`);
  console.log("  ✅ question_count -> 180");
}

// ── Mirror into the local seed source ──
const file = new URL("../neet-out/2021/questions.json", import.meta.url);
const data = JSON.parse(readFileSync(file, "utf8"));
const removeSet = new Set(Object.values(REMOVALS).flatMap((spec) => spec.nums));
const kept = data.questions.filter((q) => !removeSet.has(q.number));
if (kept.length !== data.questions.length - 20) {
  throw new Error(`local mirror: expected to drop 20, dropping ${data.questions.length - kept.length}; aborting`);
}
const norm = (s) => (s || "").toLowerCase();
const counters = Object.fromEntries(Object.keys(RENUMBER_START).map((k) => [k, RENUMBER_START[k]]));
for (const q of kept) {
  for (const name of Object.keys(RENUMBER_START)) {
    if (norm(q.section) === norm(name)) q.number = counters[name]++;
  }
}
data.questionCount = kept.length;
data.questions = kept;
if (!DRY_RUN) {
  writeFileSync(file, JSON.stringify(data, null, 1) + "\n", "utf8");
  console.log(`  ✅ mirrored -> neet-out/2021/questions.json (${kept.length} questions)`);
} else {
  console.log(`  [DRY RUN] would mirror -> neet-out/2021/questions.json (${kept.length} questions)`);
}

console.log(DRY_RUN ? "\nDRY RUN complete — nothing was changed." : "\nDone. NEET 2025 and JEE papers untouched; keys unmodified.");