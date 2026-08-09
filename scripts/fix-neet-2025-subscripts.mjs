#!/usr/bin/env node
/**
 * Fixes NEET 2025 subscript/formatting issues, restoring the exact
 * content from the official PDF (neet/2025 Neet.pdf):
 *
 *   Q5   - FA/FB -> F_{A}/F_{B}; options as stacked fractions
 *   Q11  - "VA - VB" -> "V_{A} - V_{B}" (curly quotes)
 *   Q14  - O2 -> O_{2}; R = 100/12 as fraction; mol/K exponents; 27┬░C
 *   Q20  - mangled text (K1 3 d ... 8 2) restored with \frac fractions
 *   Q29  - V1/V2/n1/n2/p1/p2 subscripts
 *   Q40  - (D1)/(D2) -> (D_{1})/(D_{2}); pi mojibake fixed
 *   Q44  - k1/k2/AQ/AP subscripts (options were already correct)
 *   Q51  - Ni complexes: [NiCl4] -> [NiCl_{4}], H2O -> H_{2}O, etc.
 *   Q55  - KO2/H2O2/H2SO4 subscripts; option minus signs
 *   Q59  - mangled statements restored (H3PO4, Ka notation, ions)
 *   Q68  - Na2CO3/Na2O/H2/CO2 subscripts
 *   Q69  - Vitamin B12/B2/B6 subscripts; stray "below." removed
 *   Q73  - KP -> K_{P}; equilibrium arrow; mol/K exponents
 *   Q86  - C4H8O -> C_{4}H_{8}O
 *   Q87  - H2O/NH3/CHCl3/XeF4/XeO3/XeF2/N2/O2/H2 subscripts
 *   Q88  - N2/O2 subscripts in options; arrow/delta/exponent fixed
 *   Q152 - F3 -> F_{3} generation
 *   Q179 - option D watermark junk ("■■ PW Web/App - http Library- https:/mart") removed
 *
 * Run:  node scripts/fix-neet-2025-subscripts.mjs
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

// Character constants (kept as unicode escapes so the file stays ASCII)
const DASH = "\u2013"; // en dash (U+2013) - used by the PDF for Q55/Q59/Q73/Q87/Q88/Q51
const MINUS = "\u2212"; // minus sign (U+2212) - used by the PDF for Q14
const EQ = "\u21CC"; // equilibrium arrow (PDF private-use glyph \uf083)
const DELTA = "\u2206"; // capital delta (U+2206)
const PI = "\u03C0";
const DEG = "\u00B0";
const LDQ = "\u201C";
const RDQ = "\u201D";

const FIXES = {
  5: {
    text: "The kinetic energies of two similar cars A and B are 100 J and 225 J respectively. On applying breaks, car A stops after 1000 m and car B stops after 1500 m. If F_{A} and F_{B} are the forces applied by the breaks on cars A and B, respectively, then the ratio F_{A}/F_{B} is",
    options: [
      { position: 1, text: "\\frac{3}{2}" },
      { position: 2, text: "\\frac{2}{3}" },
      { position: 3, text: "\\frac{1}{3}" },
      { position: 4, text: "\\frac{1}{2}" },
    ],
  },
  11: {
    text: `AB is a part of an electrical circuit (see figure). The potential difference ${LDQ}V_{A} ${DASH} V_{B}${RDQ}, at the instant when current i = 2 A and is increasing at a rate of 1 amp/second is:`,
    options: null,
  },
  14: {
    text: `An oxygen cylinder of volume 30 litre has 18.20 moles of oxygen. After some oxygen is withdrawn from the cylinder, its gauge pressure drops to 11 atmospheric pressure at temperature 27${DEG}C. The mass of the oxygen withdrawn from the cylinder is nearly equal to : [Given, R = \\frac{100}{12} J mol^{${MINUS}1} K^{${MINUS}1}, and molecular mass of O_{2} = 32, 1 atm pressure = 1.01 \\times 10^{5} N/m^{2}]`,
    options: null,
  },
  20: {
    text: "The plates of a parallel plate capacitor are separated by d. Two slabs of different dielectric constant K_{1} and K_{2} with thickness \\frac{3}{8}d and \\frac{d}{2}, respectively are inserted in the capacitor. Due to this, the capacitance becomes two times larger than when there is nothing between the plates. If K_{1} = 1.25 K_{2}, the value of K_{1} is:",
    options: null,
  },
  29: {
    text: "A container has two chambers of volumes V_{1} = 2 litres and V_{2} = 3 litres separated by a partition made of a thermal insulator. The chambers contains n_{1} = 5 and n_{2} = 4 moles of ideal gas at pressures p_{1} = 1 atm and p_{2} = 2 atm, respectively. When the partition is removed, the mixture attains an equilibrium pressure of:",
    options: null,
  },
  40: {
    text: `A full wave rectifier circuit with diodes (D_{1}) and (D_{2}) is shown in the figure. If input supply voltage Vin = 220sin (100${PI}t) volt, then at t = 15 m sec`,
    options: [
      { position: 1, text: "D_{1} is forward biased, D_{2} is reverse biased" },
      { position: 2, text: "D_{1} is reverse biased, D_{2} is forward biased" },
      { position: 3, text: "D_{1} and D_{2} both are forward biased" },
      { position: 4, text: "D_{1} and D_{2} both are reverse biased" },
    ],
  },
  44: {
    text: "Two identical point masses P and Q, suspended from two separate massless springs of spring constants k_{1} and k_{2} respectively, oscillate vertically. If their maximum speeds are the same, the ratio (A_{Q}/A_{P}) of the amplitude A_{Q} of mass Q to the amplitude A_{P} of mass P is:",
    options: null,
  },
  51: {
    text: `Which of the following are paramagnetic? A. [NiCl_{4}]^{2${DASH}} B. Ni(CO)_{4} C. [Ni(CN)_{4}]^{2${DASH}} D. [Ni(H_{2}O)_{6}]^{2+} E. Ni (PPh_{3})_{4} Choose the correct answer from the options given below:`,
    options: null,
  },
  55: {
    text: "Consider the following compounds: KO_{2}, H_{2}O_{2} and H_{2}SO_{4} The oxidation states of the underlined elements in them are, respectively,",
    options: [
      { position: 1, text: `+1, ${DASH}1, and +6` },
      { position: 2, text: `+2, ${DASH}2, and +6` },
      { position: 3, text: `+1, ${DASH}2, and +4` },
      { position: 4, text: `+4, ${DASH}4, and +6` },
    ],
  },
  59: {
    text: `Phosphoric acid ionizes in three steps with their ionization constant values K_{a1}, K_{a2}, K_{a3}, respectively, while K is the overall ionization constant. Which of the following statements are true? A. log K = log K_{a1} + log K_{a2} + log K_{a3} B. H_{3}PO_{4} is stronger acid than H_{2}PO_{4}^{${DASH}} and HPO_{4}^{2${DASH}}. C. K_{a1} > K_{a2} > K_{a3} D. K_{a1} = K_{a3} + 2K_{a2} Choose the correct answer from the options given below:`,
    options: null,
  },
  68: {
    text: "Among the following, choose the ones with equal number of atoms. A. 212 g of Na_{2}CO_{3} (s) [molar mass = 106 g] B. 248 g of Na_{2}O (s) [molar mass = 62 g] C. 240 g of NaOH (s) [molar mass = 40 g] D. 12 g of H_{2}(g) [molar mass = 2 g] E. 220 g of CO_{2}(g) [molar mass = 44 g] Choose the correct answer from the options given below:",
    options: null,
  },
  69: {
    text: [
      "Match the List-I with List-II.",
      "List-I (Name of Vitamin)",
      "List-II (Deficiency disease)",
      "A. Vitamin B_{12} -> I. Cheilosis",
      "B. Vitamin D -> II. Convulsions",
      "C. Vitamin B_{2} -> III. Rickets",
      "D. Vitamin B_{6} -> IV. Pernicious anaemia",
      "Choose the correct answer from the options given below.",
    ].join("\n"),
    options: null,
  },
  73: {
    text: `For the reaction A(g) ${EQ} 2B(g), the backward reaction rate constant is higher than the forward reaction rate constant by a factor of 2500, at 1000 K. [Given: R= 0.0831 L atm mol^{${DASH}1} K^{${DASH}1}] K_{P} for the reaction at 1000 K is`,
    options: null,
  },
  86: {
    text: "Total number of possible isomers (both structural as well as stereoisomers) of cyclic ethers of molecular formula C_{4}H_{8}O is:",
    options: null,
  },
  87: {
    text: `Identify the correct orders against the property mentioned A. H_{2}O > NH_{3} > CHCl_{3} - dipole moment B. XeF_{4} > XeO_{3} > XeF_{2} ${DASH} number of lone pairs on central atom C. O${DASH}H > C${DASH}H > N${DASH}O ${DASH} bond length D. N_{2} > O_{2} > H_{2} ${DASH} bond enthalpy Choose the correct answer from the options given below:`,
    options: null,
  },
  88: {
    text: `Higher yield of NO in N_{2} (g) + O_{2} ${EQ} 2NO(g) can be obtained at [${DELTA}H of the reaction = + 180.7 kJ mol^{${DASH}1}] A. higher temperature B. lower temperature C. higher concentration of N_{2} D. higher concentration of O_{2} Choose the correct answer from the options given below:`,
    options: null,
  },
  152: {
    text: "With the help of given pedigree, find out the probability for the birth of a child having no disease and being a carrier (has the disease mutation in one allele of the gene) in F_{3} generation.",
    options: null,
  },
  179: {
    text: null,
    options: [
      { position: 4, text: "Statement I is incorrect but Statement II is correct" },
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

  if (fix.text !== null && fix.text !== undefined) {
    const { error: qErr } = await supabase
      .from("questions")
      .update({ text: fix.text })
      .eq("id", q.id);
    if (qErr) throw new Error(`Q${q.number} text update failed: ${qErr.message}`);
    console.log(`Q${q.number}: text set`);
  }

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
