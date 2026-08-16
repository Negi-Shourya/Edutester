#!/usr/bin/env node
/**
 * Fixes blank/mangled text in NEET 2023 Chemistry (Q51-100) in Supabase.
 *
 * Every expected value below was verified against:
 *   - the local booklet PDF (neet/2023 Neet.pdf, pages 29-34), and
 *   - the booklet's own answer key already stored in question_keys.
 * No answer keys are changed.
 *
 * Image-based options (chemical structures shown as figures) get blank
 * text with their figure kept — the same convention as Q50 in Physics.
 * The script is idempotent: a row is updated only when its normalized
 * text differs from the expected final value.
 *
 * Run:  node scripts/patch-neet-2023-chem.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Verified final stem texts (question number -> expected text) ──
const STEM_FULL = {
  51: "The right option for the mass of CO_{2} produced by heating 20 g of 20% pure limestone is (Atomic mass of Ca = 40) CaCO_{3} \\xrightarrow{1200K} CaO + CO_{2}",
  58: "Which amongst the following options is correct graphical representation of Boyle's Law?",
  63: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Coke  I. Carbon atoms are sp^{3} hybridised",
    "B. Diamond  II. Used as a dry lubricant",
    "C. Fullerene  III. Used as a reducing agent",
    "D. Graphite  IV. Cage like molecules",
  ].join("\n"),
  77: "Consider the following reaction and identify the product (P).",
  79: "Identify product (A) in the following reaction:",
  80: "Complete the following reaction: [C] is _______",
  82: "Identify the product in the following reaction:",
  84: "Which amongst the following molecules on polymerization produces neoprene?",
  89: "Consider the following compounds/species: The number of compounds/species which obey Huckel's rule is _______.",
  94: [
    "Match List-I with List-II:",
    "List-I (Oxoacids of Sulphur)",
    "List-II (Bonds of Sulphur)",
    "A. Peroxodisulphuric acid  I. Two S-OH, Four S=O, One S-O-S",
    "B. Sulphuric acid  II. Two S-OH, One S=O",
    "C. Pyrosulphuric acid  III. Two S-OH, Four S=O, One S-O-O-S",
    "D. Sulphurous acid  IV. Two S-OH, Two S=O",
  ].join("\n"),
  97: "Consider the following reaction: Identify products A and B",
  98: "Which amongst the following will be most readily dehydrated under acidic conditions?",
  99: "Identify the major product obtained in the following reaction:",
  100: "Identify the final product [D] obtained in the following sequence of reactions,",
};

// Targeted stem replaces: [question, search, replace]
const STEM_REPLACE = [
  // Specific anchors: the generic "Reason R:" already occurs earlier in the
  // stem ("labelled as Reason R:"), so search the surrounding context.
  [68, "diving apparatus. Reasons R:", "diving apparatus. Reason R:"],
  [70, "depends on n. Reasons R:", "depends on n. Reason R:"],
];

// ── Verified final option texts (question -> [opt1, opt2, opt3, opt4]) ──
const OPTIONS_FULL = {
  // The correct relation n_m = 2l + 1 (extraction garbled it into "λ = nm −1")
  53: ["n_{m} = l + 2", "n_{m} = 2l + 1", "l = 2n_{m} + 1", "n_{m} = 2l^{2} + 1"],
  // Image-based graph options — blank the garbled label text, keep figures
  58: ["", "", "", ""],
  77: ["", "", "", ""],
  79: ["", "", "", ""],
  80: ["", "", "", ""],
  82: ["", "", "", ""],
  84: ["", "", "", ""],
  // Reaction arrows with conditions (cleaned from mangled markup)
  81: [
    "CH_{3}CONH_{2} \\xrightarrow{(i)~LiAlH_{4}~(ii)~H_{3}O^{+}} Product",
    "CH_{3}CONH_{2} \\xrightarrow{Br_{2}/KOH} Product",
    "CH_{3}CN \\xrightarrow{(i)~LiAlH_{4}~(ii)~H_{3}O^{+}} Product",
    "CH_{3}NC \\xrightarrow{(i)~LiAlH_{4}~(ii)~H_{3}O^{+}} Product",
  ],
  63: ["A-III, B-IV, C-I, D-II", "A-II, B-IV, C-I, D-III", "A-IV, B-I, C-II, D-III", "A-III, B-I, C-IV, D-II"],
  91: ["\\frac{1}{12}", "\\frac{1}{2}", "\\frac{1}{3}", "\\frac{1}{4}"],
  94: ["A-III, B-IV, C-II, D-I", "A-I, B-III, C-II, D-IV", "A-III, B-IV, C-I, D-II", "A-I, B-III, C-IV, D-II"],
  98: ["", "", "", ""],
  99: ["", "", "", ""],
  100: ["HC ≡ C^{–}Na^{+}", "", "", null],
};

const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();

// ── Fetch ──────────────────────────────────────────────────────
const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2023").single();
const { data: qs } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const chem = qs.filter((q) => q.number >= 51 && q.number <= 100);
const byNum = new Map(chem.map((q) => [q.number, q]));

const { data: opts } = await sb
  .from("question_options")
  .select("id,question_id,position,text")
  .in("question_id", chem.map((q) => q.id))
  .order("position");

const optsByQ = new Map();
for (const o of opts) {
  if (!optsByQ.has(o.question_id)) optsByQ.set(o.question_id, []);
  optsByQ.get(o.question_id).push(o);
}

let stemChanged = 0;
let optChanged = 0;

// ── Apply stem fixes (idempotent) ──────────────────────────────
for (const [num, search, replace] of STEM_REPLACE) {
  const q = byNum.get(num);
  if (!q) {
    console.error(`Q${num}: not found`);
    continue;
  }
  if (!q.text.includes(search)) {
    if (q.text.includes(replace)) continue; // already applied
    console.error(`Q${num}: search string not found in stem — "${search}"`);
    continue;
  }
  if (q.text.includes(replace)) continue; // already applied
  const next = q.text.replace(search, replace);
  if (norm(next) !== norm(q.text)) {
    const { error } = await sb.from("questions").update({ text: next }).eq("id", q.id);
    if (error) throw new Error(`Q${num} stem: ${error.message}`);
    stemChanged++;
  }
}

for (const [num, text] of Object.entries(STEM_FULL)) {
  const q = byNum.get(Number(num));
  if (!q) {
    console.error(`Q${num}: not found`);
    continue;
  }
  if (norm(text) !== norm(q.text)) {
    const { error } = await sb.from("questions").update({ text }).eq("id", q.id);
    if (error) throw new Error(`Q${num} stem: ${error.message}`);
    stemChanged++;
  }
}

// ── Apply option fixes (idempotent) ────────────────────────────
for (const [num, texts] of Object.entries(OPTIONS_FULL)) {
  const q = byNum.get(Number(num));
  const olist = optsByQ.get(q?.id) ?? [];
  for (let i = 0; i < texts.length; i++) {
    const target = texts[i];
    if (target === null) continue;
    const o = olist.find((x) => x.position === i + 1);
    if (!o) {
      console.error(`Q${num} opt${i + 1}: option row not found`);
      continue;
    }
    if (norm(target) !== norm(o.text)) {
      const { error } = await sb.from("question_options").update({ text: target }).eq("id", o.id);
      if (error) throw new Error(`Q${num} opt${i + 1}: ${error.message}`);
      optChanged++;
    }
  }
}

// ── Verify (re-query after updates) no chemistry row is left blank ──
const { data: freshQ } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const freshChem = freshQ.filter((q) => q.number >= 51 && q.number <= 100);
const { data: freshOpts } = await sb
  .from("question_options")
  .select("question_id,position,text,figure_url")
  .in("question_id", freshChem.map((q) => q.id));
const freshByQ = new Map();
for (const o of freshOpts) {
  if (!freshByQ.has(o.question_id)) freshByQ.set(o.question_id, []);
  freshByQ.get(o.question_id).push(o);
}
const problems = [];
for (const q of freshChem) {
  if (!q.text?.trim()) problems.push(`Q${q.number}: blank stem`);
  for (const o of freshByQ.get(q.id) ?? []) {
    // Image-based options (structures/graphs) may have blank text by design
    if (!o.text?.trim() && !o.figure_url) problems.push(`Q${q.number} opt${o.position}: blank (no figure)`);
  }
}
if (problems.length) {
  console.error("Post-patch problems found:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

console.log(`✅ Chemistry patch applied: ${stemChanged} stems, ${optChanged} options updated.`);
console.log("Answer keys were not touched; no blank rows remain (image options carry figures).");
process.exit(0);
