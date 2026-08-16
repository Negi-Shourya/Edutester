#!/usr/bin/env node
/**
 * Fixes the blank options for NEET 2022 Q30 (light propagation in a medium).
 * The four options were image-only formulas that had no curated images, so
 * their figure_url was cleared and they render blank. This sets their text
 * to the KaTeX markup rendered by VectorText (see src/components/VectorText.tsx
 * and src/lib/mathText.ts).
 *
 * Only touches the 4 option rows of question 30 in the 'neet-2022' paper.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env. Run:
 *   node scripts/fix-neet-2022-q30-options.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
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

// KaTeX markup for Q30 options (position 1-4), matching VectorText conventions.
const OPTION_TEXTS = [
  "v = c",
  "v = \\sqrt{\\frac{\\mu_r}{\\epsilon_r}}",
  "v = \\sqrt{\\frac{\\epsilon_r}{\\mu_r}}",
  "v = \\frac{c}{\\sqrt{\\epsilon_r\\mu_r}}",
];

const { data: paper, error: paperErr } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2022")
  .single();
if (paperErr) throw new Error(`paper lookup: ${paperErr.message}`);

const { data: question, error: qErr } = await supabase
  .from("questions")
  .select("id,number")
  .eq("paper_id", paper.id)
  .eq("number", 30)
  .single();
if (qErr) throw new Error(`question lookup: ${qErr.message}`);

const { data: options, error: oErr } = await supabase
  .from("question_options")
  .select("id,position,text,figure_url")
  .eq("question_id", question.id)
  .order("position");
if (oErr) throw new Error(`options lookup: ${oErr.message}`);
if (!options?.length) throw new Error("No options found for Q30");

console.log(`Paper: ${paper.id} | Q30: ${question.id} | options: ${options.length}`);

let changed = 0;
for (const opt of options) {
  const target = OPTION_TEXTS[opt.position - 1];
  if (opt.text !== target || opt.figure_url !== null) {
    const { error } = await supabase
      .from("question_options")
      .update({ text: target, figure_url: null })
      .eq("id", opt.id);
    if (error) throw new Error(`option ${opt.position} update: ${error.message}`);
    console.log(`  updated option ${opt.position} (was text=${JSON.stringify(opt.text)}, figure=${JSON.stringify(opt.figure_url)})`);
    changed++;
  } else {
    console.log(`  option ${opt.position} already correct`);
  }
}

console.log(`\n✅ Updated ${changed} option row(s) for NEET 2022 Q30.`);
