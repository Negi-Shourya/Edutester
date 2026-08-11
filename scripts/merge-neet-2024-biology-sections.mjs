#!/usr/bin/env node
/**
 * Merges the NEET-2024 (paper key "neet-2024") Botany + Zoology sections
 * into a single "Biology" section, matching the NEET-2025 structure.
 *
 * Updates BOTH the seed source (neet-out/2024/questions.json) and the
 * Supabase database (sections + questions.section_id).
 *
 * Run:  node scripts/merge-neet-2024-biology-sections.mjs
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

// ── 1. Patch the seed JSON ──────────────────────────────────────────────────
const JSON_PATH = new URL("../neet-out/2024/questions.json", import.meta.url);
const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
let changed = 0;
for (const q of data.questions) {
  if (q.section === "BOTANY" || q.section === "ZOOLOGY") {
    q.section = "BIOLOGY";
    changed++;
  }
}
writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`JSON updated: ${changed} questions moved to section "BIOLOGY"`);

// ── 2. Patch the database ───────────────────────────────────────────────────
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: paper } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2024")
  .maybeSingle();
if (!paper) {
  console.error("Paper lookup failed");
  process.exit(1);
}

const { data: sections, error: secErr } = await supabase
  .from("sections")
  .select("id, name, position")
  .eq("paper_id", paper.id);
if (secErr) throw new Error(`sections select failed: ${secErr.message}`);
console.log("Current sections:", JSON.stringify(sections));

const botany = sections.find((s) => s.name === "Botany");
const zoology = sections.find((s) => s.name === "Zoology");
const biology = sections.find((s) => s.name === "Biology");
if (biology && botany) {
  console.error("Section 'Biology' already exists; not merging.");
  process.exit(1);
}
if (!botany || !zoology) {
  console.error("Expected both 'Botany' and 'Zoology' sections to exist.");
  process.exit(1);
}

// Reassign all Zoology questions to the Botany (now Biology) section
const { data: moved, error: mvErr } = await supabase
  .from("questions")
  .update({ section_id: botany.id })
  .eq("section_id", zoology.id)
  .eq("paper_id", paper.id)
  .select("id");
if (mvErr) throw new Error(`question reassignment failed: ${mvErr.message}`);
console.log(`Reassigned ${moved?.length ?? 0} questions to section ${botany.id}`);

// Rename Botany -> Biology
const { error: rnErr } = await supabase
  .from("sections")
  .update({ name: "Biology" })
  .eq("id", botany.id);
if (rnErr) throw new Error(`section rename failed: ${rnErr.message}`);
console.log(`Renamed section ${botany.id} to "Biology"`);

// Delete the empty Zoology section
const { error: delErr } = await supabase.from("sections").delete().eq("id", zoology.id);
if (delErr) throw new Error(`section delete failed: ${delErr.message}`);
console.log(`Deleted empty section ${zoology.id} ("Zoology")`);

const { data: after } = await supabase
  .from("sections")
  .select("id, name, position")
  .eq("paper_id", paper.id)
  .order("position");
console.log("Sections now:", JSON.stringify(after));
console.log("\nDone.");
