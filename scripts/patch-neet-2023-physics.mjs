#!/usr/bin/env node
/**
 * Fixes blank/mangled text in NEET 2023 Physics (Q1-50) in Supabase.
 *
 * Every expected value below was verified against:
 *   - the local booklet PDF (neet/2023 Neet.pdf, pages 19-23), incl.
 *     char-level dumps for vector-drawn minus signs / radicals, and
 *   - the booklet's own answer key already stored in question_keys.
 * No answer keys are changed.
 *
 * The script is idempotent: a row is updated only when its normalized
 * text differs from the expected final value (same pattern as the
 * STEM_FULL/OPTIONS_FULL sections), so it is safe to re-run.
 *
 * Run:  node scripts/patch-neet-2023-physics.mjs
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
  9: "Two bodies of mass m and 9m are placed at a distance R. The gravitational potential on the line joining the bodies where the gravitational field equals zero, will be (G = gravitational constant):",
  18: "The equivalent capacitance of the system shown in the following circuit is:",
  19: "The magnitude and direction of the current in the following circuit is:",
  20: "If the galvanometer G does not show any deflection in the circuit shown, the value of R is given by:",
  24: "In a series LCR circuit, the inductance L is 10 mH, capacitance C is 1µF and resistance R is 100Ω. The frequency at which resonance occurs is:",
  27: "In a plane electromagnetic wave travelling in free space, the electric field component oscillates sinusoidally at a frequency of 2.0 \\times 10^{10} Hz and amplitude 48 Vm^{–1}. Then the amplitude of oscillating magnetic field is: (Speed of light in free space = 3 \\times 10^{8} ms^{–1})",
  28: "Light travels a distance x in time t_{1} in air and 10x in time t_{2} in another denser medium. What is the critical angle for this pair of media?",
  38: "A bullet from a gun is fired on a rectangular wooden block with velocity u. When bullet travels 24 cm through the block along its length horizontally, velocity of bullet become \\frac{u}{3}. Then it further penetrates into the block in the same direction before coming to rest exactly at the other end of the block. The total length of the block is:",
  39: "A satellite is orbiting just above the surface of the earth with period T. If d is the density of the earth and G is the universal constant of gravitation, the quantity \\frac{3π}{Gd} represents:",
  40: "The x–t graph of a particle performing simple harmonic motion is shown in the figure. The acceleration of the particle at t = 2 s is:",
  41: "An electric dipole is placed as shown in the figure. The electric potential (in 10^{2} V) at point P due to the dipole is (ε_{0} = permittivity of free space and K = \\frac{1}{4πε_{0}}):",
  44: "A very long conducting wire is bent in a semi-circular shape from A to B as shown in figure. The magnetic field at point P for steady current configuration is given by:",
  45: "A wire carrying a current I along the positive x-axis has length L. It is kept in a magnetic field \\vec{B} = (2\\hat{i} + 3\\hat{j} − 4\\hat{k}) T. The magnitude of the magnetic force acting on the wire is:",
  46: "The net impedance of circuit (as shown in figure) will be:",
  47: "In the figure shown here, what is the equivalent focal length of the combination of lenses (Assume that all layers are thin)?",
  50: "For the following logic circuit, the truth table is:",
};

// ── Verified final option texts (question -> [opt1, opt2, opt3, opt4]) ──
const OPTIONS_FULL = {
  3: ["\\frac{3v}{4}", "\\frac{v}{3}", "\\frac{2v}{3}", "\\frac{4v}{3}"],
  9: ["-\\frac{20Gm}{R}", "-\\frac{8Gm}{R}", "-\\frac{12Gm}{R}", "-\\frac{16Gm}{R}"],
  10: ["Zero", "\\frac{2W}{A}", "\\frac{W}{A}", "\\frac{W}{2A}"],
  16: ["2 mC", "8 mC", "6 mC", "4 mC"],
  19: [
    "1.5 A from B to A through E",
    "0.2 A from B to A through E",
    "0.5 A from A to B through E",
    "\\frac{5}{9} A from A to B through E",
  ],
  28: [
    "sin^{–1}(\\frac{10t_{1}}{t_{2}})",
    "sin^{–1}(\\frac{t_{2}}{10t_{1}})",
    "sin^{–1}(\\frac{10t_{2}}{t_{1}})",
    "sin^{–1}(\\frac{t_{1}}{10t_{2}})",
  ],
  30: ["V^{2}", "\\frac{1}{\\sqrt{V}}", "\\frac{1}{V}", "\\sqrt{V}"],
  40: [
    "-\\frac{π^{2}}{16} ms^{–2}",
    "\\frac{π^{2}}{8} ms^{–2}",
    "-\\frac{π^{2}}{8} ms^{–2}",
    "\\frac{π^{2}}{16} ms^{–2}",
  ],
  41: ["\\frac{8qK}{3}", "\\frac{3qK}{8}", "\\frac{5qK}{8}", "\\frac{8qK}{5}"],
  44: [
    "\\frac{µ_{0}i}{4R}[1 − \\frac{2}{π}] pointed into the page",
    "\\frac{µ_{0}i}{4R} pointed into the page",
    "\\frac{µ_{0}i}{4R} pointed away from the page",
    "\\frac{µ_{0}i}{4R}[1 − \\frac{2}{π}] pointed away from the page",
  ],
  45: ["\\sqrt{3} IL", "3 IL", "\\sqrt{5} IL", "5 IL"],
  46: ["25 Ω", "10\\sqrt{2} Ω", "15 Ω", "5\\sqrt{5} Ω"],
  39: ["\\sqrt{T}", "T", "T^{2}", "T^{3}"],
  48: ["Infinite", "Zero", "\\frac{f}{4}", "\\frac{f}{2}"],
};

const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();

// ── Fetch ──────────────────────────────────────────────────────
const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2023").single();
const { data: qs } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const phys = qs.filter((q) => q.number >= 1 && q.number <= 50);
const byNum = new Map(phys.map((q) => [q.number, q]));

const { data: opts } = await sb
  .from("question_options")
  .select("id,question_id,position,text")
  .in("question_id", phys.map((q) => q.id))
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

// ── Verify (re-query after updates) no physics row is left blank ──
const { data: freshQ } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", paper.id)
  .order("number");
const freshPhys = freshQ.filter((q) => q.number >= 1 && q.number <= 50);
const { data: freshOpts } = await sb
  .from("question_options")
  .select("question_id,position,text,figure_url")
  .in("question_id", freshPhys.map((q) => q.id));
const freshByQ = new Map();
for (const o of freshOpts) {
  if (!freshByQ.has(o.question_id)) freshByQ.set(o.question_id, []);
  freshByQ.get(o.question_id).push(o);
}
const problems = [];
for (const q of freshPhys) {
  if (!q.text?.trim()) problems.push(`Q${q.number}: blank stem`);
  for (const o of freshByQ.get(q.id) ?? []) {
    // Q50 options are image-based truth tables (blank text is by design)
    if (q.number === 50) continue;
    if (!o.text?.trim() && !o.figure_url) problems.push(`Q${q.number} opt${o.position}: blank`);
  }
}
if (problems.length) {
  console.error("Post-patch problems found:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

console.log(`✅ Physics patch applied: ${stemChanged} stems, ${optChanged} options updated.`);
console.log("Answer keys were not touched; no blanks remain (Q50 options are image-based by design).");
process.exit(0);
