#!/usr/bin/env node
/**
 * Fixes the NEET 2025 "Match List-I with List-II" questions in the database.
 *
 * The extraction pipeline produced broken text for match-the-following
 * questions (only the instruction line, or one garbled line of merged
 * words). The correct two-column tables were verified against the source
 * PDF (neet/2025 Neet.pdf), page by page:
 *
 *   Q48 p8 L | Q64 p10 L | Q66 p10 R | Q69 p11 L | Q72 p11 R | Q80 p12 R
 *   Q101 p15 L | Q110 p16 L (options on p16 R) | Q121 p17 R | Q122 p18 L
 *   Q134 p19 R | Q162 p23 L | Q164 p23 L | Q178 p24 R
 *
 * The text uses the format the frontend MatchQuestionRenderer parses:
 *   title line, "List-I"/"List-II" header lines, "A. x -> I. y" rows,
 *   and the footer ("Choose the correct answer..." / "Choose the option...").
 *
 * Options and answers were already correct (verified against the paper's
 * ANSWER KEY page), so only `questions.text` is rewritten.
 *
 * Run:  node scripts/fix-neet-2025-match-questions.mjs
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

const FOOTER_STD = "Choose the correct answer from the options given below.";
const FOOTER_ALL = "Choose the option with all correct matches.";

// question number -> [title, listI header, listII header, [[A, I], [B, II], ...], footer]
const MATCH_QUESTIONS = {
  48: [
    "Match List-I with List-II.",
    "List-I (Ion)",
    "List-II (Group Number in Cation Analysis)",
    [
      ["A. Co^{2+}", "I. Group-I"],
      ["B. Mg^{2+}", "II. Group-III"],
      ["C. Pb^{2+}", "III. Group-IV"],
      ["D. Al^{3+}", "IV. Group-VI"],
    ],
    FOOTER_STD,
  ],
  64: [
    "Match the List-I with List-II. below.",
    "List-I",
    "List-II",
    [
      ["A. XeO_{3}", "I. sp^{3}d; linear"],
      ["B. XeF_{2}", "II. sp^{3}; pyramidal"],
      ["C. XeOF_{4}", "III. sp^{3}d^{3}: distorted octahedral"],
      ["D. XeF_{6}", "IV. sp^{3}d^{2}; square pyramidal"],
    ],
    FOOTER_STD,
  ],
  66: [
    "Match the List-I with List-II. below.",
    "List-I (Example)",
    "List-II (Type of Solution)",
    [
      ["A. Humidity", "I. Solid in solid"],
      ["B. Alloys", "II. Liquid in gas"],
      ["C. Amalgams", "III. Solid in gas"],
      ["D. Smoke", "IV. Liquid in solid"],
    ],
    FOOTER_STD,
  ],
  69: [
    "Match the List-I with List-II. below.",
    "List-I (Name of Vitamin)",
    "List-II (Deficiency disease)",
    [
      ["A. Vitamin B12", "I. Cheilosis"],
      ["B. Vitamin D", "II. Convulsions"],
      ["C. Vitamin B2", "III. Rickets"],
      ["D. Vitamin B6", "IV. Pernicious anaemia"],
    ],
    FOOTER_STD,
  ],
  72: [
    "Match the List-I with List-II. below.",
    "List-I (Mixture)",
    "List-II (Method of Separation)",
    [
      ["A. CHCl_{3} + C_{6}H_{5}NH_{2}", "I. Distillation under reduced pressure"],
      ["B. Crude oil in petroleum industry", "II. Steam distillation"],
      ["C. Glycerol from spent-lye", "III. Fractional distillation"],
      ["D. Aniline-water", "IV. Simple distillation"],
    ],
    FOOTER_STD,
  ],
  80: [
    "Match List-I with List-II. below:",
    "List-I",
    "List-II",
    [
      ["A. Haber process", "I. Fe catalyst"],
      ["B. Wacker oxidation", "II. PdCl_{2}"],
      ["C. Wilkinson catalyst", "III. [(PPh_{3})_{3}RhCl]"],
      ["D. Ziegler catalyst", "IV. TiCl_{4} with Al(CH_{3})_{3}"],
    ],
    FOOTER_STD,
  ],
  101: [
    "Match List-I with List-II. below:",
    "List-I",
    "List-II",
    [
      ["A. Emphysema", "I. Rapid spasms in muscle due to low Ca^{2+} in body fluid"],
      ["B. Angina Pectoris", "II. Damaged alveolar walls and decreased respiratory surface"],
      ["C. Glomerulo-nephritis", "III. Acute chest pain when not enough oxygen is reaching to heart muscle"],
      ["D. Tetany", "IV. Inflammation of glomeruli of kidney"],
    ],
    FOOTER_STD,
  ],
  110: [
    "Match List-I with List-II.",
    "List-I",
    "List-II",
    [
      ["A. Head", "I. Enzymes"],
      ["B. Middle piece", "II. Sperm motility"],
      ["C. Acrosome", "III. Energy"],
      ["D. Tail", "IV. Genetic material"],
    ],
    FOOTER_STD,
  ],
  121: [
    "Match List-I with List-II. below:",
    "List-I",
    "List-II",
    [
      ["A. Centromere", "I. Mitochondrion"],
      ["B. Cilium", "II. Cell division"],
      ["C. Cristae", "III. Cell movement"],
      ["D. Cell membrane", "IV. Phospholipid Bilayer"],
    ],
    FOOTER_STD,
  ],
  122: [
    "Match List-I with List-II.",
    "List-I",
    "List-II",
    [
      ["A. Chlorophyll a", "I. Yellow-green"],
      ["B. Chlorophyll b", "II. Yellow"],
      ["C. Xanthophylls", "III. Blue-green"],
      ["D. Carotenoids", "IV. Yellow to Yellow-orange"],
    ],
    FOOTER_ALL,
  ],
  134: [
    "Match List-I with List-II. below:",
    "List-I",
    "List-II",
    [
      ["A. Alfred Hershey and Martha Chase", "I. Streptococcus Pneumoniae"],
      ["B. Euchromatin", "II. Densely packed and dark-stained"],
      ["C. Frederick Griffith", "III. Loosely packed and light-stained"],
      ["D. Heterochromatin", "IV. DNA as genetic material confirmation"],
    ],
    FOOTER_STD,
  ],
  162: [
    "Match List-I with List-II.",
    "List-I",
    "List-II",
    [
      ["A. Pteridophyte", "I. Salvia"],
      ["B. Bryophyte", "II. Ginkgo"],
      ["C. Angiosperm", "III. Polytrichum"],
      ["D. Gymnosperm", "IV. Salvinia"],
    ],
    FOOTER_ALL,
  ],
  164: [
    "Match List-I with List-II.",
    "List-I",
    "List-II",
    [
      ["A. The Evil Quartet", "I. Cryopreservation"],
      ["B. Ex situ conservation", "II. Alien species invasion"],
      ["C. Lantana camara", "III. Causes of biodiversity losses"],
      ["D. Dodo", "IV. Extinction"],
    ],
    FOOTER_ALL,
  ],
  178: [
    "Match List-I with List-II. below:",
    "List-I",
    "List-II",
    [
      ["A. Progesterone", "I. Pars intermedia"],
      ["B. Relaxin", "II. Ovary"],
      ["C. Melanocyte stimulating hormone", "III. Adrenal Medulla"],
      ["D. Catecholamines", "IV. Corpus luteum"],
    ],
    FOOTER_STD,
  ],
};

function buildText([title, h1, h2, rows, footer]) {
  const lines = [title, h1, h2];
  for (const [l, r] of rows) lines.push(`${l} -> ${r}`);
  lines.push(footer);
  return lines.join("\n");
}

async function main() {
  const { data: paper } = await supabase
    .from("papers")
    .select("id")
    .eq("key", "neet-2025")
    .single();
  if (!paper) {
    console.error("neet-2025 paper not found");
    process.exit(1);
  }
  const numbers = Object.keys(MATCH_QUESTIONS).map(Number);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, number, text")
    .eq("paper_id", paper.id)
    .in("number", numbers);
  const byNumber = new Map(questions.map((q) => [q.number, q]));

  for (const num of numbers) {
    const q = byNumber.get(num);
    if (!q) {
      console.error(`  Q${num}: not found`);
      continue;
    }
    const newText = buildText(MATCH_QUESTIONS[num]);
    const { error } = await supabase.from("questions").update({ text: newText }).eq("id", q.id);
    if (error) {
      console.error(`  Q${num}: update failed: ${error.message}`);
      continue;
    }
    console.log(`  Q${num}: updated`);
  }
  console.log(`\n${numbers.length} match questions updated.`);
}

await main();
