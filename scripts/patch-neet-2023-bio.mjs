#!/usr/bin/env node
/**
 * Fixes blank/mangled text in NEET 2023 Biology (Q101-200) in Supabase.
 *
 * Every expected value below was verified against:
 *   - the local booklet PDF (neet/2023 Neet.pdf, pages 1-11), incl. a
 *     drawing-level char dump for Q160's en-dash and Q198's primes, and
 *   - the booklet's own answer key already stored in question_keys
 *     (each rebuilt match-table's four options were checked so that the
 *     stored key still selects the correct pairings).
 * No answer keys are changed.
 *
 * The 20 blank questions were all clip-rendered to images by the original
 * extractor (mostly Match List-I/List-II tables). They are rebuilt here as
 * text using the same "List-I / List-II + A. x  I. y rows" format that the
 * front-end FormattedQuestionText turns into an NTA-style table (same as
 * Chemistry Q63/Q94). Q172 keeps its image-based options (pedigree symbols)
 * — only its stem is restored, the same convention as Q50 in Physics.
 *
 * The script is idempotent: a row is updated only when its normalized
 * text differs from the expected final value.
 *
 * Run:  node scripts/patch-neet-2023-bio.mjs
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
  // Booklet 40 — Cell Cycle and Cell Division (key: D)
  140: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. M Phase  I. Proteins are synthesized",
    "B. G_{2} Phase  II. Inactive phase",
    "C. Quiescent stage  III. Interval between mitosis and initiation of DNA replication",
    "D. G_{1} Phase  IV. Equational division",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 41 — Transport in Plants (key: B)
  141: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Cohesion  I. More attraction in liquid phase",
    "B. Adhesion  II. Mutual attraction among water molecules",
    "C. Surface tension  III. Water loss in liquid phase",
    "D. Guttation  IV. Attraction towards polar surfaces",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 42 — Mineral Nutrition (key: D)
  142: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Iron  I. Synthesis of auxin",
    "B. Zinc  II. Component of nitrate reductase",
    "C. Boron  III. Activator of catalase",
    "D. Molybdenum  IV. Cell elongation and differentiation",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 44 — Respiration in Plants (booklet prints "Math", fixed; key: A)
  144: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Oxidative decarboxylation  I. Citrate synthase",
    "B. Glycolysis  II. Pyruvate",
    "C. Oxidative phosphorylation  III. Electron transport system",
    "D. Tricarboxylic acid cycle  IV. EMP pathway",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 49 — Organisms and Populations (key: C)
  149: [
    "Match List-I with List-II:",
    "List-I (Interaction)",
    "List-II (Species A and B)",
    "A. Mutualism  I. +(A), O(B)",
    "B. Commensalism  II. −(A), O(B)",
    "C. Amensalism  III. +(A), −(B)",
    "D. Parasitism  IV. +(A), +(B)",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 52 — Animal Kingdom (key: D)
  152: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Taenia  I. Nephridia",
    "B. Paramoecium  II. Contractile vacuole",
    "C. Periplaneta  III. Flame cells",
    "D. Pheretima  IV. Urecose gland",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 58 — Digestion and Absorption (key: D)
  158: [
    "Match List-I with List-II:",
    "List-I (Cells)",
    "List-II (Secretion)",
    "A. Peptic cells  I. Mucus",
    "B. Goblet Cells  II. Bile Juice",
    "C. Oxyntic Cell  III. Proenzyme Pepsinogen",
    "D. Hepatic cells  IV. HCl and intrinsic factor for absorption of vitamin B_{12}",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 60 — Breathing and Exchange of Gases (key: A)
  160: "Vital capacity of lung is ________.",
  // Booklet 61 — Body Fluids and Circulation (key: B)
  161: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. P-wave  I. Beginning of systole",
    "B. Q-wave  II. Repolarisation of ventricles",
    "C. QRS complex  III. Depolarisation of atria",
    "D. T-wave  IV. Depolarisation of ventricles",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 63 — Locomotion and Movement (key: C)
  163: [
    "Match List-I with List-II:",
    "List-I (Type of Joint)",
    "List-II (Found between)",
    "A. Cartilaginous Joint  I. Between flat skull bones",
    "B. Ball and Socket Joint  II. Between adjacent vertebrae in vertebral column",
    "C. Fibrous Joint  III. Between carpal and metacarpal of thumb",
    "D. Saddle Joint  IV. Between Humerus and Pectoral girdle",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 64 — Neural Control and Coordination (key: B)
  164: [
    "Match List-I with List-II with respect to human eye.",
    "List-I",
    "List-II",
    "A. Fovea  I. Visible coloured portion of eye that regulates diameter of pupil",
    "B. Iris  II. External layer of eye formed of dense connective tissue",
    "C. Blind spot  III. Point of greatest visual acuity or resolution",
    "D. Sclera  IV. Point where optic nerve leaves the eyeball and photoreceptor cells are absent",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 65 — Chemical Coordination and Integration (key: B)
  165: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. CCK  I. Kidney",
    "B. GIP  II. Heart",
    "C. ANF  III. Gastric gland",
    "D. ADH  IV. Pancreas",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 71 — Reproductive Health (key: C)
  171: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Vasectomy  I. Oral method",
    "B. Coitus interruptus  II. Barrier method",
    "C. Cervical caps  III. Surgical method",
    "D. Saheli  IV. Natural method",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 72 — image-based pedigree symbols (key: C); options keep figures
  172: "Which one of the following symbols represents mating between relatives in human pedigree analysis?",
  // Booklet 75 — Biotechnology: Principles and Processes (key: C)
  175: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Gene 'a'  I. β-galactosidase",
    "B. Gene 'y'  II. Transacetylase",
    "C. Gene 'i'  III. Permease",
    "D. Gene 'z'  IV. Repressor protein",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 78 — Human Health and Disease (key: B)
  178: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Ringworm  I. Haemophilus influenzae",
    "B. Filariasis  II. Trichophyton",
    "C. Malaria  III. Wuchereria bancrofti",
    "D. Pneumonia  IV. Plasmodium vivax",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 79 — Human Health and Disease (key: B)
  179: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Heroin  I. Effect on cardiovascular system",
    "B. Marijuana  II. Slow down body function",
    "C. Cocaine  III. Painkiller",
    "D. Morphine  IV. Interfere with transport of dopamine",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 83 — Organisms and Populations (key: B)
  183: [
    "Match List-I with List-II:",
    "List-I (Interacting species)",
    "List-II (Name of Interaction)",
    "A. A Leopard and a Lion in a forest/grassland  I. Competition",
    "B. A Cuckoo laying egg in a Crow's nest  II. Brood parasitism",
    "C. Fungi and root of a higher plant in Mycorrhizae  III. Mutualism",
    "D. A cattle egret and a Cattle in a field  IV. Commensalism",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 89 — Structural Organisation in Animals (key: D); rows (C)/(D)
  // and (III)/(IV) are a raster region in the PDF text layer, verified via
  // full-page text dump + web cross-check.
  189: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Mast cells  I. Ciliated epithelium",
    "B. Inner surface of bronchiole  II. Areolar connective tissue",
    "C. Blood  III. Cuboidal epithelium",
    "D. Tubular parts of nephron  IV. specialised connective tissue",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
  // Booklet 98 — Molecular Basis of Inheritance (key: D). Cleaned extraction
  // artifacts: removed the mid-sequence wrap space and fixed the trailing
  // "3?" (mis-extracted prime) to 3’.
  198: "Which one of the following is the sequence on corresponding coding strand, if the sequence on mRNA formed is as follow 5’AUCGAUCGAUCGAUCGAUCGAUCGAUCG3’",
  // Booklet 100 — Organisms and Populations (key: B)
  200: [
    "Match List-I with List-II:",
    "List-I",
    "List-II",
    "A. Logistic growth  I. Unlimited resource availability condition",
    "B. Exponential growth  II. Limited resource availability condition",
    "C. Expanding age pyramid  III. The percent individuals of pre-reproductive age is largest followed by reproductive and post-reproductive age groups",
    "D. Stable age pyramid  IV. The percent individuals of pre-reproductive and reproductive age group are same",
    "Choose the correct answer from the options given below:",
  ].join("\n"),
};

// ── Verified final option texts (question -> [opt1, opt2, opt3, opt4]) ──
const OPTIONS_FULL = {
  140: ["A-II, B-IV, C-I, D-III", "A-III, B-II, C-IV, D-I", "A-IV, B-II, C-I, D-III", "A-IV, B-I, C-II, D-III"],
  141: ["A-II, B-I, C-IV, D-III", "A-II, B-IV, C-I, D-III", "A-IV, B-III, C-II, D-I", "A-III, B-I, C-IV, D-II"],
  142: ["A-II, B-IV, C-I, D-III", "A-III, B-II, C-I, D-IV", "A-III, B-III, C-IV, D-I", "A-III, B-I, C-IV, D-II"],
  144: ["A-II, B-IV, C-III, D-I", "A-III, B-IV, C-II, D-I", "A-II, B-IV, C-I, D-III", "A-III, B-I, C-II, D-IV"],
  149: ["A-III, B-I, C-IV, D-II", "A-IV, B-II, C-I, D-III", "A-IV, B-I, C-II, D-III", "A-IV, B-III, C-I, D-II"],
  152: ["A-II, B-I, C-IV, D-III", "A-I, B-II, C-III, D-IV", "A-I, B-II, C-IV, D-III", "A-III, B-II, C-IV, D-I"],
  158: ["A-II, B-IV, C-I, D-III", "A-IV, B-III, C-II, D-I", "A-II, B-I, C-III, D-IV", "A-III, B-I, C-IV, D-II"],
  // Vital capacity — en dash (U+2013) verified at char level in the PDF
  160: ["IRV+ERV+TV", "IRV+ERV", "IRV+ERV+TV+RV", "IRV+ERV+TV–RV"],
  161: ["A-I, B-II, C-III, D-IV", "A-III, B-I, C-IV, D-II", "A-IV, B-III, C-II, D-I", "A-II, B-IV, C-I, D-III"],
  163: ["A-II, B-IV, C-III, D-I", "A-III, B-I, C-II, D-IV", "A-II, B-IV, C-I, D-III", "A-I, B-IV, C-III, D-II"],
  164: ["A-II, B-I, C-III, D-IV", "A-III, B-I, C-IV, D-II", "A-IV, B-III, C-II, D-I", "A-I, B-IV, C-III, D-II"],
  165: ["A-IV, B-II, C-III, D-I", "A-IV, B-III, C-II, D-I", "A-III, B-II, C-IV, D-I", "A-II, B-IV, C-I, D-III"],
  171: ["A-IV, B-II, C-I, D-III", "A-III, B-I, C-IV, D-II", "A-III, B-IV, C-II, D-I", "A-II, B-III, C-I, D-IV"],
  175: ["A-III, B-I, C-IV, D-II", "A-III, B-I, C-IV, D-III", "A-II, B-III, C-IV, D-I", "A-III, B-IV, C-I, D-II"],
  178: ["A-III, B-II, C-IV, D-I", "A-II, B-III, C-IV, D-I", "A-II, B-III, C-I, D-IV", "A-III, B-II, C-I, D-IV"],
  179: ["A-III, B-IV, C-I, D-II", "A-II, B-I, C-IV, D-III", "A-I, B-II, C-III, D-IV", "A-IV, B-III, C-II, D-I"],
  183: ["A-II, B-III, C-I, D-IV", "A-I, B-II, C-III, D-IV", "A-I, B-II, C-IV, D-III", "A-III, B-IV, C-I, D-II"],
  189: ["A-III, B-IV, C-II, D-I", "A-I, B-II, C-IV, D-III", "A-II, B-III, C-I, D-IV", "A-II, B-I, C-IV, D-III"],
  // Coding-strand sequences — mid-sequence wrap spaces removed
  198: [
    "3’ATCGATCGATCGTCGATCGATCGATCG5’",
    "5’UAGCUAGCUAGCUAGCUAGCUAGC3’",
    "3’UAGCUAGCUAGCUAGCUAGCUAGC5’",
    "5’ATCGATCGATCGATCGATCGATCG3’",
  ],
  200: ["A-II, B-IV, C-III, D-I", "A-II, B-I, C-III, D-IV", "A-II, B-III, C-I, D-IV", "A-II, B-IV, C-I, D-III"],
};

const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();

// ── Fetch ──────────────────────────────────────────────────────
const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2023").single();
const { data: qs } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const bio = qs.filter((q) => q.number >= 101 && q.number <= 200);
const byNum = new Map(bio.map((q) => [q.number, q]));

const { data: opts } = await sb
  .from("question_options")
  .select("id,question_id,position,text")
  .in("question_id", bio.map((q) => q.id))
  .order("position");

const optsByQ = new Map();
for (const o of opts) {
  if (!optsByQ.has(o.question_id)) optsByQ.set(o.question_id, []);
  optsByQ.get(o.question_id).push(o);
}

let stemChanged = 0;
let optChanged = 0;

// ── Apply stem fixes (idempotent) ──────────────────────────────
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

// ── Verify (re-query after updates) no biology row is left blank ──
const { data: freshQ } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const freshBio = freshQ.filter((q) => q.number >= 101 && q.number <= 200);
const { data: freshOpts } = await sb
  .from("question_options")
  .select("question_id,position,text,figure_url")
  .in("question_id", freshBio.map((q) => q.id));
const freshByQ = new Map();
for (const o of freshOpts) {
  if (!freshByQ.has(o.question_id)) freshByQ.set(o.question_id, []);
  freshByQ.get(o.question_id).push(o);
}
const problems = [];
for (const q of freshBio) {
  if (!q.text?.trim()) problems.push(`Q${q.number}: blank stem`);
  for (const o of freshByQ.get(q.id) ?? []) {
    // Q172 options are image-based pedigree symbols (blank text by design)
    if (!o.text?.trim() && !o.figure_url) problems.push(`Q${q.number} opt${o.position}: blank (no figure)`);
  }
}
if (problems.length) {
  console.error("Post-patch problems found:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

console.log(`✅ Biology patch applied: ${stemChanged} stems, ${optChanged} options updated.`);
console.log("Answer keys were not touched; no blank rows remain (Q172 options carry figures).");
process.exit(0);
