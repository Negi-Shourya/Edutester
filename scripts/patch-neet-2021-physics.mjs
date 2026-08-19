import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const N = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const n = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const STEMS = [
  {
    number: 2,
    guard: /V=V_\{0\} sin/,
    fix: (t) => t.replace(/V=V_\{0\} sin\u03c9t/, "V=V_{0}\\sin\\omega t"),
  },
  { number: 5, guard: /is 3 \./, fix: (t) => t.replace("is 3 .", "is \\sqrt{3}.") },
  {
    number: 7,
    guard: /\(P\) \\frac\{1\}\{2\} n m v\^\{2\}/,
    fix: () =>
      "Match Column - I and Column - II and choose the correct match from the given choices. \n| Column-I | Column-II |\n|---|---|\n| (A) Root mean square speed of gas molecules | (P) \\frac{1}{3}nm\\bar{v}^{2} |\n| (B) Pressure exerted by ideal gas | (Q) \\sqrt{\\frac{3RT}{M}} |\n| (C) Average kinetic energy of a molecule | (R) \\frac{5}{2}RT |\n| (D) Total internal energy of 1 mole of a diatomic gas | (S) \\frac{3}{2}k_{B}T |",
  },
  {
    number: 10,
    guard: /908C/,
    fix: (t) =>
      t
        .replaceAll("908C", "90°C")
        .replaceAll("808C", "80°C")
        .replaceAll("208C", "20°C")
        .replaceAll("608C", "60°C"),
  },
  {
    number: 11,
    guard: /respectively :  \\frac\{S\}\{4\}, \\frac\{3gS\}\{2\}$/,
    fix: (t) => t.replace(/respectively :  \\frac\{S\}\{4\}, \\frac\{3gS\}\{2\}$/, "respectively :"),
  },
  {
    number: 14,
    guard: /ne_\{2\}/,
    fix: (t) =>
      t
        .replace("\n m\n", "\n")
        .replace(/\(P\) ne_\{2\} \u03c1 \|/, "(P) \\frac{m}{ne^{2}\\rho} |")
        .replace(/\(Q\) nevd eE \|/, "(Q) nev_{d} |")
        .replace(/\(R\) \u03c4 m E \|/, "(R) \\frac{eE\\tau}{m} |")
        .replace(/\(S\) J \|/, "(S) \\frac{E}{J} |"),
  },
  { number: 20, guard: /10 2 A/, fix: (t) => t.replace("10 2 A", "10\\sqrt{2} A") },
  { number: 22, guard: /10\^\{0\} divisions/, fix: (t) => t.replace("10^{0} divisions", "100 divisions") },
  {
    number: 23,
    guard: /m\/s_\{2\}/,
    fix: (t) => t.replaceAll("m/s_{2}", "m/s^{2}"),
  },
  { number: 28, guard: /is : R_\{1\}$/, fix: (t) => t.replace(/is : R_\{1\}$/, "is :") },
  { number: 29, guard: /then : 2m 2$/, fix: (t) => t.replace(/then : 2m 2$/, "then :") },
  {
    number: 32,
    guard: /E gravitational constant, then has the dimensions G of/,
    fix: (t) =>
      t.replace(
        "E gravitational constant, then has the dimensions G of",
        "gravitational constant, then \\frac{E}{G} has the dimensions of"
      ),
  },
  { number: 34, guard: /10\^\{0\} hours/, fix: (t) => t.replace("10^{0} hours", "100 hours") },
  { number: 36, guard: /: R_\{1\}$/, fix: (t) => t.replace(/: R_\{1\}$/, ":") },
  { number: 40, guard: /m\/s_\{2\}/, fix: (t) => t.replaceAll("m/s_{2}", "m/s^{2}") },
  {
    number: 42,
    guard: /5 m\/s_\{2\}/,
    fix: (t) => t.replaceAll("m/s_{2}", "m/s^{2}"),
  },
  { number: 45, guard: /m\/s_\{2\}/, fix: (t) => t.replaceAll("m/s_{2}", "m/s^{2}") },
  { number: 48, guard: /is : k$/, fix: (t) => t.replace(/ is : k$/, " is :") },
  {
    number: 49,
    guard: /i_\{3\} ratio/,
    fix: (t) =>
      t.replace(
        "The i_{3} ratio of currents in terms of resistances used i_{1} in the circuit is : r_{1}",
        "The ratio \\frac{i_{3}}{i_{1}} of currents in terms of resistances used in the circuit is :"
      ),
  },
  { number: 50, guard: /MR_\{2\}/, fix: (t) => t.replace("MR_{2}", "MR^{2}") },
];

const OPTIONS = [
  { number: 2, pos: 1, guard: /Ccos/, text: "I_{d} = V_{0}\\omega C \\cos\\omega t" },
  { number: 2, pos: 2, guard: /V_0 cos/, text: "I_{d} = \\frac{V_{0}\\cos\\omega t}{\\omega C}" },
  { number: 2, pos: 3, guard: /V_0 sin/, text: "I_{d} = \\frac{V_{0}\\sin\\omega t}{\\omega C}" },
  { number: 2, pos: 4, guard: /Csin/, text: "I_{d} = V_{0}\\omega C \\sin\\omega t" },
  { number: 11, pos: 2, guard: /^\\frac\{S\}\{2\}/, text: "\\frac{S}{2}, \\frac{\\sqrt{3gS}}{2}" },
  { number: 11, pos: 3, guard: /^\\frac\{S\}\{4\}, \\frac\{3gS\}\{4\}/, text: "\\frac{S}{4}, \\frac{\\sqrt{3gS}}{2}" },
  { number: 11, pos: 4, guard: /^\\frac\{S\}\{4\}, \\frac\{\\sqrt\{3gS\}\}\{2\}/, text: "\\frac{S}{4}, \\sqrt{\\frac{3gS}{2}}" },
  { number: 17, pos: 2, guard: /^8.*10\^\{-20\} N/, text: "8\\pi \\times 10^{-20} N" },
  { number: 17, pos: 3, guard: /^4.*10\^\{-20\} N/, text: "4\\pi \\times 10^{-20} N" },
  { number: 18, pos: 4, guard: /^all of the above\. A$/, text: "all of the above." },
  { number: 19, pos: 1, guard: /[^\x20-\x7E]/, text: "\\alpha, \\beta^{-}, \\beta^{+}" },
  { number: 19, pos: 2, guard: /[^\x20-\x7E]/, text: "\\alpha, \\beta^{+}, \\beta^{-}" },
  { number: 19, pos: 3, guard: /[^\x20-\x7E]/, text: "\\beta^{+}, \\alpha, \\beta^{-}" },
  { number: 19, pos: 4, guard: /[^\x20-\x7E]/, text: "\\beta^{-}, \\alpha, \\beta^{+}" },
  { number: 20, pos: 1, guard: /^4 2 /, text: "4\\sqrt{2} Ω" },
  { number: 20, pos: 2, guard: /^5 2 /, text: "\\frac{5}{\\sqrt{2}} Ω" },
  { number: 28, pos: 1, guard: /^R_\{2\} R_\{2\}$/, text: "\\frac{R_{1}}{R_{2}}" },
  { number: 28, pos: 2, guard: /^R_\{1\} R_\{1\}$/, text: "\\frac{R_{2}}{R_{1}}" },
  { number: 28, pos: 3, guard: /^R_\{2\} R_\{1\}$/, text: "\\sqrt{\\frac{R_{1}}{R_{2}}}" },
  { number: 28, pos: 4, guard: /^R_\{2\}2$/, text: "\\frac{R_{1}^{2}}{R_{2}^{2}}" },
  { number: 29, pos: 1, guard: /hc/, text: "\\lambda = \\frac{2m}{hc}\\lambda_{d}^{2}" },
  { number: 29, pos: 2, guard: /2mc/, text: "\\lambda_{d} = \\frac{2mc}{h}\\lambda^{2}" },
  { number: 29, pos: 3, guard: /2h/, text: "\\lambda = \\frac{2mc}{h}\\lambda_{d}^{2}" },
  { number: 29, pos: 4, guard: / mc$/, text: "\\lambda = \\frac{2h}{mc}\\lambda_{d}^{2}" },
  { number: 34, pos: 2, guard: /^2 2$/, text: "\\frac{1}{2\\sqrt{2}}" },
  { number: 34, pos: 3, guard: /^\[Diagram\/Graph from Paper\]$/, text: "\\frac{2}{3}" },
  { number: 34, pos: 4, guard: /^3 2$/, text: "\\frac{2}{3\\sqrt{2}}" },
  { number: 35, pos: 4, guard: /^216 MeV/, text: "216 MeV" },
  { number: 36, pos: 1, guard: /^R_\{2\} R_\{2\}$/, text: "\\frac{R_{1}}{R_{2}}" },
  { number: 36, pos: 2, guard: /^R_\{1\} R_\{1\}$/, text: "\\frac{R_{2}}{R_{1}}" },
  { number: 36, pos: 3, guard: /^R_\{2\} R_\{2\}$/, text: "\\frac{R_{1}^{2}}{R_{2}}" },
  { number: 36, pos: 4, guard: /^R_\{1\}$/, text: "\\frac{R_{2}^{2}}{R_{1}}" },
  { number: 42, pos: 1, guard: /^20 m\/s, 5 m\/s_\{2\}$/, text: "20 m/s, 5 m/s^{2}" },
  { number: 42, pos: 3, guard: /^20 2 m\/s, 0$/, text: "20\\sqrt{2} m/s, 0" },
  { number: 42, pos: 4, guard: /^20 2 m\/s, 10 m\/s_\{2\}$/, text: "20\\sqrt{2} m/s, 10 m/s^{2}" },
  { number: 44, pos: 1, guard: /^3 Ia_\{2\} and 3 Ia_\{2\}$/, text: "\\sqrt{3}Ia^{2} and 3Ia^{2}" },
  { number: 44, pos: 2, guard: /^3 Ia_\{2\} and Ia_\{2\}$/, text: "3Ia^{2} and Ia^{2}" },
  { number: 44, pos: 3, guard: /^3 Ia_\{2\} and 4 Ia_\{2\}$/, text: "3Ia^{2} and 4Ia^{2}" },
  { number: 44, pos: 4, guard: /^4 Ia_\{2\} and 3 Ia_\{2\}$/, text: "4Ia^{2} and 3Ia^{2}" },
  { number: 47, pos: 1, guard: /gT\^\{2\}/, text: "\\theta = \\cos^{-1}[(\\frac{gT^{2}}{\\pi R^{2}})^{\\frac{1}{2}}]" },
  { number: 47, pos: 2, guard: /gT\^\{2\}/, text: "\\theta = \\cos^{-1}[(\\frac{\\pi R^{2}}{gT^{2}})^{\\frac{1}{2}}]" },
  { number: 47, pos: 3, guard: /R_\{2\}/, text: "\\theta = \\sin^{-1}[(\\frac{gT^{2}}{\\pi R^{2}})^{\\frac{1}{2}}]" },
  { number: 47, pos: 4, guard: /g_\{2\}/, text: "\\theta = \\sin^{-1}[(\\frac{2gT^{2}}{\\pi^{2}R})^{\\frac{1}{2}}]" },
  { number: 48, pos: 1, guard: /^R 1/, text: "R(\\frac{k}{1-k})^{2}" },
  { number: 48, pos: 2, guard: /1\+k/, text: "R(\\frac{k}{1+k})^{2}" },
  { number: 48, pos: 3, guard: /Rk_\{2\}/, text: "\\frac{R^{2}k}{1+k}" },
  { number: 48, pos: 4, guard: /^1/, text: "\\frac{Rk^{2}}{1-k^{2}}" },
  { number: 49, pos: 1, guard: /^r_\{2\}\+r_\{3\} r_\{2\}$/, text: "\\frac{r_{1}}{r_{2}+r_{3}}" },
  { number: 49, pos: 2, guard: /^r_\{2\}\+r_\{3\} r_\{1\}$/, text: "\\frac{r_{2}}{r_{2}+r_{3}}" },
  { number: 49, pos: 3, guard: /^r_\{1\}\+r_\{2\} r_\{2\}$/, text: "\\frac{r_{1}}{r_{1}+r_{2}}" },
  { number: 49, pos: 4, guard: /^r_\{1\}\+r_\{3\}$/, text: "\\frac{r_{2}}{r_{1}+r_{3}}" },
  { number: 50, pos: 1, guard: /^\[Diagram\/Graph from Paper\]$/, text: "\\frac{3}{4}" },
  { number: 50, pos: 2, guard: /^\[Diagram\/Graph from Paper\]$/, text: "\\frac{7}{8}" },
  { number: 50, pos: 3, guard: /^\[Diagram\/Graph from Paper\]$/, text: "\\frac{1}{4}" },
  { number: 50, pos: 4, guard: /^Section - A \(Chemistry\)$/, text: "\\frac{1}{8}" },
];

function applyStemFix(t, spec) {
  if (!spec) return null;
  const newText = spec.fix(t);
  if (newText === t) return null;
  if (!spec.guard.test(t)) throw new Error(`stem guard failed: ${N(spec.guard.source)}`);
  return newText;
}

function applyOptionFix(t, spec) {
  if (!spec.guard.test(t)) throw new Error(`option guard failed: ${N(spec.guard.source)}`);
  return spec.text;
}

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const numbers = [...new Set([...STEMS.map((s) => s.number), ...OPTIONS.map((o) => o.number)])];

const { data: qs, error: qerr } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", 56)
  .in("number", numbers);
if (qerr) throw new Error(`questions select failed: ${qerr.message}`);

const { data: opts, error: oerr } = await sb
  .from("question_options")
  .select("id,question_id,position,text")
  .in("question_id", qs.map((q) => q.id));
if (oerr) throw new Error(`options select failed: ${oerr.message}`);

let stemChanged = 0;
let optChanged = 0;

for (const spec of STEMS) {
  const q = qs.find((x) => x.number === spec.number);
  if (!q) throw new Error(`question ${spec.number} not found`);
  const newText = applyStemFix(q.text, spec);
  if (newText === null) {
    console.log(`Q${spec.number} stem: already correct`);
    continue;
  }
  const { error: uerr } = await sb.from("questions").update({ text: newText }).eq("id", q.id);
  if (uerr) throw new Error(`Q${spec.number} stem update failed: ${uerr.message}`);
  q.text = newText;
  stemChanged++;
  console.log(`Q${spec.number} stem: fixed`);
}

for (const spec of OPTIONS) {
  const q = qs.find((x) => x.number === spec.number);
  const row = opts.find((x) => x.question_id === q.id && x.position === spec.pos);
  if (!row) throw new Error(`Q${spec.number} pos ${spec.pos}: option not found`);
  if (row.text === spec.text) {
    console.log(`Q${spec.number} pos ${spec.pos}: already correct`);
    continue;
  }
  const newText = applyOptionFix(row.text, spec);
  const { error: uerr } = await sb
    .from("question_options")
    .update({ text: newText })
    .eq("id", row.id);
  if (uerr) throw new Error(`Q${spec.number} pos ${spec.pos} update failed: ${uerr.message}`);
  row.text = newText;
  optChanged++;
  console.log(`Q${spec.number} pos ${spec.pos}: fixed`);
}

console.log(`DB: ${stemChanged} stem(s) + ${optChanged} option(s) updated`);

const jsonPath = new URL("../neet-out/2021/questions.json", import.meta.url);
const json = JSON.parse(readFileSync(jsonPath, "utf8"));
let jStem = 0;
let jOpt = 0;
for (const spec of STEMS) {
  const jq = json.questions.find((x) => x.number === spec.number);
  if (!jq) continue;
  const newText = applyStemFix(jq.text, spec);
  if (newText === null) continue;
  jq.text = newText;
  jStem++;
}
for (const spec of OPTIONS) {
  const jq = json.questions.find((x) => x.number === spec.number);
  if (!jq) continue;
  const jopt = jq.options[spec.pos - 1];
  if (!jopt) continue;
  if (jopt.text === spec.text) continue;
  jopt.text = applyOptionFix(jopt.text, spec);
  jOpt++;
}
if (jStem || jOpt) {
  writeFileSync(jsonPath, JSON.stringify(json, null, 1) + "\n", "utf8");
  console.log(`questions.json: ${jStem} stem(s) + ${jOpt} option(s) updated`);
}

const { data: keys } = await sb
  .from("question_keys")
  .select("question_id,correct_answer")
  .in("question_id", qs.map((q) => q.id));
const keyMap = new Map(keys.map((k) => [k.question_id, k.correct_answer]));
for (const spec of [...STEMS, ...OPTIONS]) {
  const q = qs.find((x) => x.number === spec.number);
  console.log(`Q${spec.number} key (must stay untouched): ${keyMap.get(q.id)}`);
}
process.exit(0);