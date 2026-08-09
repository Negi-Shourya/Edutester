#!/usr/bin/env node
/**
 * Fixes NEET 2025 questions that were blank or mangled, restoring the
 * exact content from the official PDF (neet/2025 Neet.pdf):
 *
 *   Q46  - option values shifted/mangled (fractions 1/36, 1/16, 1/9, 1/4);
 *          option D was empty and the stem had option-1's value appended.
 *   Q111 - pteridophytes life-cycle sequence (was completely blank)
 *   Q119 - bryophytes life-cycle sequence (was completely blank)
 *   Q125 - nephron diagram question (stem text was missing; option
 *          figures were already linked, so only the stem is set)
 *   Q148 - Match List-I with List-II (stem lost the lists; "below:"
 *          was wrongly appended to the title)
 *
 * Run:  node scripts/fix-neet-2025-q46-q148.mjs
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
  46: {
    text: "The ratio of the wavelengths of the light absorbed by a Hydrogen atom when it undergoes n = 2 \u2192 n = 3 and n = 4 \u2192 n = 6 transitions, respectively, is",
    options: [
      { position: 1, text: "\\frac{1}{36}" },
      { position: 2, text: "\\frac{1}{16}" },
      { position: 3, text: "\\frac{1}{9}" },
      { position: 4, text: "\\frac{1}{4}" },
    ],
  },
  111: {
    text: "Given below are the stages in the life cycle of pteridophytes. Arrange the following stages in the correct sequence. A. Prothallus stage B. Meiosis in spore mother cells C. Fertilisation D. Formation of archegonia and antheridia in gametophyte. E. Transfer of antherozoids to the archegonia in presence of water. Choose the correct answer from the options given below:",
    options: [
      { position: 1, text: "B, A, D, E, C" },
      { position: 2, text: "B, A, E, C, D" },
      { position: 3, text: "D, E, C, A, B" },
      { position: 4, text: "E, D, C, B, A" },
    ],
  },
  119: {
    text: "The correct sequence of events in the life cycle of bryophytes is A. Fusion of antherozoid with egg. B. Attachment of gametophyte to substratum. C. Reduction division to produce haploid spores. D. Formation of sporophyte. E. Release of antherozoids into water. Choose the correct answer from the option given below:",
    options: [
      { position: 1, text: "D, E, A, C, B" },
      { position: 2, text: "B, E, A, C, D" },
      { position: 3, text: "B, E, A, D, C" },
      { position: 4, text: "D, E, A, B, C" },
    ],
  },
  125: {
    text: "Which of the following diagrams is correct with regard to the proximal (P) and distal (D) tubule of the Nephron.",
    options: null,
  },
  148: {
    text: [
      "Match List-I with List-II.",
      "List-I",
      "List-II",
      "A. Heart -> I. Erythropoietin",
      "B. Kidney -> II. Aldosterone",
      "C. Gastro-intestinal tracts -> III. Atrial natriuretic factor",
      "D. Adrenal Cortex -> IV. Secretin",
      "Choose the correct answer from the options given below:",
    ].join("\n"),
    options: null,
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

  if (!fix.options) continue;
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
