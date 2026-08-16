#!/usr/bin/env node
/**
 * Fills the 10 blank NEET 2022 chemistry options (Q67 opt1/2, Q72 opt1-4,
 * Q99 opt1-4) with text extracted from the paper. No images.
 *
 * Answer-key check (DB question_keys):
 *   Q67 = A -> opt1 "Benzene, Cl2, anhydrous FeCl3" (direct halogenation)
 *   Q72 = D -> opt4 "pi = chi_i * pi(deg)" (the INCORRECT equation)
 *   Q99 = A -> opt1 "4.38 × 10^-32" (the computed [O3])
 *
 * Run:  node scripts/fix-neet-2022-chem-options.mjs
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
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const TEXTS = {
  67: {
    1: "Benzene, Cl_{2}, anhydrous FeCl_{3}",
    2: "Phenol, NaNO_{2}, HCl, CuCl",
  },
  72: {
    1: "p = p_{1} + p_{2} + p_{3}",
    2: "p = n_{1}\\frac{RT}{V} + n_{2}\\frac{RT}{V} + n_{3}\\frac{RT}{V}",
    3: "p_{i} = \\chi_{i}p",
    4: "p_{i} = \\chi_{i}p_{i}^{\\circ}",
  },
  99: {
    1: "4.38 × 10^{–32}",
    2: "1.9 × 10^{–63}",
    3: "2.4 × 10^{–19}",
    4: "1.2 × 10^{–21}",
  },
};

const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2022").single();
const { data: questions } = await supabase
  .from("questions")
  .select("id, number")
  .eq("paper_id", paper.id);
const { data: options } = await supabase
  .from("question_options")
  .select("id, question_id, position, text")
  .in("question_id", questions.map((q) => q.id));
const numById = new Map(questions.map((q) => [q.id, q.number]));

let updated = 0;
for (const o of options) {
  const qnum = numById.get(o.question_id);
  const text = TEXTS[qnum]?.[o.position];
  if (text === undefined) continue;
  const { error } = await supabase.from("question_options").update({ text }).eq("id", o.id);
  if (error) console.error(`  FAIL Q${qnum} opt ${o.position}: ${error.message}`);
  else {
    console.log(`  Q${qnum} opt ${o.position}: "${text}"`);
    updated++;
  }
}
console.log(`Chemistry options filled: ${updated}`);

// Verify: no blank options left in the chemistry section
const { data: qs2 } = await supabase
  .from("questions")
  .select("id, number, sections(name)")
  .eq("paper_id", paper.id);
const chem = qs2.filter((q) => q.sections?.name === "Chemistry");
const { data: opts2 } = await supabase
  .from("question_options")
  .select("question_id, position, text, figure_url")
  .in("question_id", chem.map((q) => q.id));
const numById2 = new Map(qs2.map((q) => [q.id, q.number]));
const blank = opts2.filter((o) => (!o.text || !o.text.trim()) && !o.figure_url);
console.log(`\nChemistry blanks remaining: ${blank.length}`);
if (blank.length) {
  for (const o of blank) console.log(`  Q${numById2.get(o.question_id)} opt${o.position}`);
}
console.log("✅ Done.");
