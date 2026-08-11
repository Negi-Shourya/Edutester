#!/usr/bin/env node
/**
 * Fixes NEET 2024 text mojibake and fills in Q5.
 *
 * The PDF extraction stored Windows-1252 codepoints as Latin-1:
 *   U+0091 -> ' (LEFT SINGLE QUOTATION MARK)
 *   U+0092 -> ' (RIGHT SINGLE QUOTATION MARK)
 *   U+0096 -> – (EN DASH)
 * which the frontend cannot render. Q5 was a block-image question with
 * no replacement image, so its stem + options are filled from the PDF.
 *
 * Run:  node scripts/fix-neet-2024-mojibake.mjs
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

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const FIX_MAP = {
  "\u0091": "\u2018", // ' left single quote
  "\u0092": "\u2019", // ' right single quote
  "\u0096": "\u2013", // – en dash
};

const Q5_STEM =
  "In an ideal transformer, the turns ratio is N_{p}/N_{s} = \\frac{1}{2}. The ratio V_{s} : V_{p} is equal to (the symbols carry their usual meaning):";
const Q5_OPTIONS = ["1 : 1", "1 : 4", "1 : 2", "2 : 1"];

function fix(text) {
  if (!text) return text;
  let out = text;
  for (const [bad, good] of Object.entries(FIX_MAP)) {
    out = out.split(bad).join(good);
  }
  return out;
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: paper } = await supabase
  .from("papers")
  .select("id")
  .eq("key", "neet-2024")
  .maybeSingle();
if (!paper) {
  console.error("NEET 2024 paper not found.");
  process.exit(1);
}

const { data: questions } = await supabase
  .from("questions")
  .select("id, number, text")
  .eq("paper_id", paper.id)
  .order("number");

const { data: options } = await supabase
  .from("question_options")
  .select("id, question_id, position, text")
  .in("question_id", questions.map((q) => q.id));

const needs = (t) => /[\u0091\u0092\u0096]/.test(t ?? "");
let stemFixes = 0;
let optFixes = 0;

for (const q of questions) {
  if (needs(q.text)) {
    const fixed = fix(q.text);
    const { error } = await supabase
      .from("questions")
      .update({ text: fixed })
      .eq("id", q.id);
    if (error) console.error(`  FAIL Q${q.number} stem: ${error.message}`);
    else {
      stemFixes++;
      console.log(`  Q${q.number} stem fixed`);
    }
  }
}

for (const o of options) {
  if (needs(o.text)) {
    const fixed = fix(o.text);
    const { error } = await supabase
      .from("question_options")
      .update({ text: fixed })
      .eq("id", o.id);
    if (error) console.error(`  FAIL option ${o.id}: ${error.message}`);
    else {
      optFixes++;
    }
  }
}

const q5 = questions.find((q) => q.number === 5);
if (q5) {
  const { error: e1 } = await supabase
    .from("questions")
    .update({ text: Q5_STEM, figure_url: null })
    .eq("id", q5.id);
  if (e1) console.error(`  FAIL Q5 stem: ${e1.message}`);
  else console.log("  Q5 stem filled from PDF");
  const q5opts = options.filter((o) => o.question_id === q5.id).sort((a, b) => a.position - b.position);
  for (const [i, o] of q5opts.entries()) {
    const { error } = await supabase
      .from("question_options")
      .update({ text: Q5_OPTIONS[i] ?? "" })
      .eq("id", o.id);
    if (error) console.error(`  FAIL Q5 opt${o.position}: ${error.message}`);
  }
  console.log("  Q5 options filled from PDF");
}

console.log(`\nDone. Stems fixed: ${stemFixes}, options fixed: ${optFixes}`);
