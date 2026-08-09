#!/usr/bin/env node
/**
 * Fixes blank NEET 2025 questions 90 and 92 (empty text + options)
 * by restoring the exact content from the official PDF
 * (neet/2025 Neet.pdf).
 *
 * Q90 (Chemistry) - Lassaigne's test
 * Q92 (Biology)   - PCR amplification equation
 *
 * Run:  node scripts/fix-neet-2025-q90-q92.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

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

const FIXES = {
  90: {
    text: 'Which one of the following reactions does NOT belong to \u201cLassaigne\u2019s test\u201d?',
    options: [
      { position: 1, text: "Na + C + N \\xrightarrow{\\Delta} NaCN" },
      { position: 2, text: "2Na + S \\xrightarrow{\\Delta} Na_{2}S" },
      { position: 3, text: "Na + X \\xrightarrow{\\Delta} + NaX" },
      { position: 4, text: "2CuO + C \\xrightarrow{\\Delta} 2Cu + CO_{2}" },
    ],
  },
  92: {
    text: "Polymerase chain reaction (PCR) amplifies DNA following the equation.",
    options: [
      { position: 1, text: "N^{2}" },
      { position: 2, text: "2^{n}" },
      { position: 3, text: "2n + 1" },
      { position: 4, text: "2N^{2}" },
    ],
  },
};

const { data: paper, error: paperErr } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2025")
  .single();
if (paperErr || !paper) throw new Error("neet-2025 paper not found");

const { data: questions } = await supabase
  .from("questions")
  .select("id, number")
  .eq("paper_id", paper.id)
  .in("number", Object.keys(FIXES).map(Number));

for (const q of questions) {
  const fix = FIXES[q.number];
  if (!fix) continue;

  const { error: qErr } = await supabase
    .from("questions")
    .update({ text: fix.text })
    .eq("id", q.id);
  if (qErr) throw new Error(`Q${q.number} text update failed: ${qErr.message}`);
  console.log(`Q${q.number}: text set`);

  for (const opt of fix.options) {
    const { error: oErr } = await supabase
      .from("question_options")
      .update({ text: opt.text })
      .eq("question_id", q.id)
      .eq("position", opt.position);
    if (oErr) throw new Error(`Q${q.number} opt ${opt.position} update failed: ${oErr.message}`);
    console.log(`Q${q.number} opt ${opt.position}: ${opt.text}`);
  }
}

console.log("\nDone.");
