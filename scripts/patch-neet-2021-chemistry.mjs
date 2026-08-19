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

const TABLE_SUFFIX = "\nChoose the correct answer from the options given below.";

const STEMS = [
  {
    number: 60,
    guard: /4\.2 kJ mol\u22121/,
    fix: (t) =>
      t
        .replace("\u22124.2 kJ mol\u22121", "\u22124.2 kJ mol^{-1}")
        .replace("9.6 kJ mol\u22121", "9.6 kJ mol^{-1}"),
  },
  {
    number: 67,
    guard: /C_\{6\}H_\{1\}2O_\{6\}/,
    fix: (t) =>
      t
        .replaceAll("_{1}2", "_{12}")
        .replaceAll("_{2}2", "_{22}")
        .replaceAll("_{1}1", "_{11}"),
  },
  {
    number: 69,
    guard: /S cm_\{2\} mol\u22121/,
    fix: (t) => t.replaceAll("S cm_{2} mol\u22121", "S cm^{2} mol^{-1}"),
  },
  { number: 71, guard: /ms\u22121/, fix: (t) => t.replaceAll("ms\u22121", "ms^{-1}") },
  {
    number: 74,
    guard: /pKb/,
    fix: (t) => t.replaceAll("pKb", "pK_{b}").replaceAll("pKa", "pK_{a}"),
  },
  {
    number: 77,
    guard: /Trigonal bipyramidal Choose/,
    fix: (t) => {
      const i = t.indexOf("\n| List-I |");
      if (i < 0) return t;
      return (
        t.slice(0, i) +
        "\n| List-I | List-II |\n|---|---|\n| (a) PCl_{5} | (i) Square pyramidal |\n| (b) SF_{6} | (ii) Trigonal planar |\n| (c) BrF_{5} | (iii) Octahedral |\n| (d) BF_{3} | (iv) Trigonal bipyramidal |" +
        TABLE_SUFFIX
      );
    },
  },
  {
    number: 80,
    guard: /Acetone \(i\) C_\{2\}/,
    fix: (t) =>
      t.replace(
        "Acetone (i) C_{2} H(5 iiM) HgB_{2} Or,, dHr+y Ether \u2192 Product",
        "Acetone \\xrightarrow[\\text{(ii) H}_{2}\\text{O, H}^{+}]{\\text{(i) C}_{2}\\text{H}_{5}\\text{MgBr, dry Ether}} Product"
      ),
  },
  {
    number: 81,
    guard: /right option\. \u2206$/,
    fix: (t) => t.replace(/ \u2206$/, ""),
  },
  {
    number: 86,
    guard: /Acid rain 2SO/,
    fix: (t) => {
      const i = t.indexOf("\n| List-I |");
      if (i < 0) return t;
      return (
        t.slice(0, i) +
        "\n| List-I | List-II |\n|---|---|\n| (a) 2SO_{2}(g)+O_{2}(g) \u2192 2SO_{3}(g) | (i) Acid rain |\n| (b) HOCl(g) \\xrightarrow{h\\nu} OH+Cl | (ii) Smog |\n| (c) CaCO_{3}+H_{2}SO_{4} \u2192 CaSO_{4}+H_{2}O+CO_{2} | (iii) Ozone depletion |\n| (d) NO_{2}(g) \\xrightarrow{h\\nu} NO(g)+O(g) | (iv) Tropospheric pollution |" +
        TABLE_SUFFIX
      );
    },
  },
  {
    number: 87,
    guard: /NaOHHea,t/,
    fix: (t) =>
      t.replace(
        "CH_{3}CH_{2}COO\u2212Na+ NaOHHea,t + ? \u2192 CH_{3}CH_{3}+ Na_{2}CO_{3}.",
        "CH_{3}CH_{2}COO^{-}Na^{+} \\xrightarrow[Heat]{NaOH, + ?} CH_{3}CH_{3} + Na_{2}CO_{3}."
      ),
  },
  {
    number: 89,
    guard: /Fe\(CN\)6/,
    fix: (t) => {
      const i = t.indexOf("\n| List-I |");
      if (i < 0) return t;
      return (
        t.slice(0, i) +
        "\n| List-I | List-II |\n|---|---|\n| (a) [Fe(CN)_{6}]^{3-} | (i) 5.92 BM |\n| (b) [Fe(H_{2}O)_{6}]^{3+} | (ii) 0 BM |\n| (c) [Fe(CN)_{6}]^{4-} | (iii) 4.90 BM |\n| (d) [Fe(H_{2}O)_{6}]^{2+} | (iv) 1.73 BM |" +
        TABLE_SUFFIX
      );
    },
  },
  {
    number: 92,
    guard: /08C/,
    fix: (t) =>
      t.replaceAll("08C", "0\u00B0C").replaceAll("mol\u22121K\u22121", "mol^{-1}K^{-1}"),
  },
  {
    number: 95,
    guard: /458C/,
    fix: (t) => t.replaceAll("458C", "45\u00B0C"),
  },
  {
    number: 96,
    guard: /\u039B/,
    fix: (t) =>
      t
        .replace("20 S cm_{2} mol\u22121", "20 S cm^{2} mol^{-1}")
        .replace(
          /\u039B\^.+?_\{H\}\+= 350 S cm\^\{2\} mol\^\{−1\} \u039B_\{C\}\^.+?\u2212= 50 S cm\^\{2\} mol\^\{−1\}/,
          "\\Lambda_{H^{+}}^{\\infty} = 350 S cm^{2} mol^{-1}, \\Lambda_{CH_{3}COO^{-}}^{\\infty} = 50 S cm^{2} mol^{-1}"
        ),
  },
  {
    number: 97,
    guard: /first T order/,
    fix: (t) =>
      t
        .replace("v/s of first T order", "v/s \\frac{1}{T} of first order")
        .replaceAll("JK\u22121mol\u22121", "JK^{-1}mol^{-1}"),
  },
  {
    number: 98,
    guard: /Haloform.*R'COOH/,
    fix: (t) => {
      const i = t.indexOf("\n| List-I |");
      if (i < 0) return t;
      return (
        t.slice(0, i) +
        "\n| List-I | List-II |\n|---|---|\n| (a) C_{6}H_{6} + CO + HCl \\xrightarrow{\\text{Anhyd. AlCl}_{3}\\text{/CuCl}} | (i) Hell-Volhard-Zelinsky reaction |\n| (b) R-CO-CH_{3} + NaOX \\xrightarrow{} | (ii) Gattermann-Koch reaction |\n| (c) R-CH_{2}-OH + R'COOH \\xrightarrow{\\text{Conc. H}_{2}\\text{SO}_{4}} | (iii) Haloform reaction |\n| (d) R-CH_{2}COOH \\xrightarrow[(ii)\\ H_{2}O]{(i)\\ X_{2}\\text{/Red P}} | (iv) Esterification |" +
        TABLE_SUFFIX
      );
    },
  },
];

const OPTIONS = [
  { number: 55, pos: 1, guard: /^C_\{5\}H_\{1\}2$/, text: "C_{5}H_{12}" },
  { number: 55, pos: 4, guard: /^C_\{4\}H_\{1\}0O$/, text: "C_{4}H_{10}O" },
  { number: 64, pos: 1, guard: /^1208$/, text: "120^{\\circ}" },
  { number: 64, pos: 2, guard: /^1808$/, text: "180^{\\circ}" },
  { number: 64, pos: 3, guard: /^608$/, text: "60^{\\circ}" },
  { number: 64, pos: 4, guard: /^08$/, text: "0^{\\circ}" },
  { number: 69, pos: 1, guard: /S cm_\{2\}/, text: "201.28 S cm^{2} mol^{-1}" },
  { number: 69, pos: 2, guard: /S cm_\{2\}/, text: "390.71 S cm^{2} mol^{-1}" },
  { number: 69, pos: 3, guard: /S cm_\{2\}/, text: "698.28 S cm^{2} mol^{-1}" },
  { number: 69, pos: 4, guard: /S cm_\{2\}/, text: "540.48 S cm^{2} mol^{-1}" },
  {
    number: 81,
    pos: 1,
    guard: /2KCl\+3O_\{2\} \u2206$/,
    text: "2KClO_{3} \\xrightarrow{\\Delta} 2KCl+3O_{2}",
  },
  {
    number: 81,
    pos: 2,
    guard: /2Al \u2192 Al_\{2\}O_\{3\}/,
    text: "Cr_{2}O_{3}+2Al \\xrightarrow{\\Delta} Al_{2}O_{3}+2Cr",
  },
  {
    number: 81,
    pos: 4,
    guard: /\(NO_\{3\}\)2 \u2192/,
    text: "2Pb(NO_{3})_{2} \u2192 2PbO+4NO_{2}+O_{2}\u2191",
  },
  { number: 84, pos: 1, guard: /^Vitamin B_\{1\}2$/, text: "Vitamin B_{12}" },
  { number: 85, pos: 4, guard: /Section - B \(Chemistry\)$/, text: "Neutron (n)" },
  { number: 90, pos: 1, guard: /O_\{2\}\u2212/, text: "O^{2-}, F^{-}" },
  { number: 90, pos: 2, guard: /Mg_\{2\}\+/, text: "Na^{+}, Mg^{2+}" },
  { number: 90, pos: 3, guard: /Mn_\{2\}\+, Fe_\{3\}\+/, text: "Mn^{2+}, Fe^{3+}" },
  { number: 90, pos: 4, guard: /Fe_\{2\}\+, Mn_\{2\}\+/, text: "Fe^{2+}, Mn^{2+}" },
  {
    number: 94,
    pos: 1,
    guard: /Increasing acidic < HBr < HI strength/,
    text: "HF < HCl < HBr < HI : Increasing acidic strength",
  },
  {
    number: 94,
    pos: 2,
    guard: /pKa < H_\{2\}Se/,
    text: "H_{2}O < H_{2}S < H_{2}Se < H_{2}Te : Increasing pK_{a} values",
  },
  {
    number: 94,
    pos: 3,
    guard: /Increasing < AsH_\{3\}/,
    text: "NH_{3} < PH_{3} < AsH_{3} < SbH_{3} : Increasing acidic character",
  },
  {
    number: 94,
    pos: 4,
    guard: /Increasing < SnO_\{2\}/,
    text: "CO_{2} < SiO_{2} < SnO_{2} < PbO_{2} : Increasing oxidizing power",
  },
  {
    number: 96,
    pos: 1,
    guard: /10\u22124 mol L\u22121/,
    text: "1.75 \\times 10^{-4} mol L^{-1}",
  },
  {
    number: 96,
    pos: 2,
    guard: /10\u22124 mol L\u22121/,
    text: "2.50 \\times 10^{-4} mol L^{-1}",
  },
  {
    number: 96,
    pos: 3,
    guard: /10\u22125 mol L\u22121/,
    text: "1.75 \\times 10^{-5} mol L^{-1}",
  },
  {
    number: 96,
    pos: 4,
    guard: /10\u22125 mol L\u22121/,
    text: "2.50 \\times 10^{-5} mol L^{-1}",
  },
  { number: 97, pos: 1, guard: /kJ mol\u22121/, text: "41.5 kJ mol^{-1}" },
  { number: 97, pos: 2, guard: /kJ mol\u22121/, text: "83.0 kJ mol^{-1}" },
  { number: 97, pos: 3, guard: /kJ mol\u22121/, text: "166 kJ mol^{-1}" },
  { number: 97, pos: 4, guard: /kJ mol\u22121/, text: "\u221283 kJ mol^{-1}" },
  {
    number: 100,
    pos: 1,
    guard: /Stotal=0$/,
    text: "\\Delta U = 0, \\Delta S_{total} = 0",
  },
  {
    number: 100,
    pos: 2,
    guard: /^\u2206U \u2260 0/,
    text: "\\Delta U \\neq 0, \\Delta S_{total} \\neq 0",
  },
  {
    number: 100,
    pos: 3,
    guard: /Stotal \u2260 0$/,
    text: "\\Delta U = 0, \\Delta S_{total} \\neq 0",
  },
  {
    number: 100,
    pos: 4,
    guard: /Section - A \(Biology : Botany\)$/,
    text: "\\Delta U \\neq 0, \\Delta S_{total} = 0",
  },
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
