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

const rebuildTable = (header, rows) => (t) => {
  const i = t.indexOf(header);
  if (i < 0) return t;
  return t.slice(0, i) + "\n" + rows + TABLE_SUFFIX;
};

const LIST_HEADER = "| List-I | List-II |";
const LIST_ROWS_HEADER = "\n| List-I | List-II |\n|---|---|";
const COL_HEADER = "| Column-I | Column-II |";
const COL_ROWS_HEADER = "\n| Column-I | Column-II |\n|---|---|";

const LIST_GUARD = /^Match List - I with List - II\. \n\| List-I \|/;
const COL_GUARD = /^Match Column - I with Column - II\. \n\| Column-I \|/;

const STEMS = [
  {
    number: 104,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Cells with active cell division capacity | (i) Vascular tissues |",
        "| (b) Tissue having all cells similar in structure and function | (ii) Meristematic tissue |",
        "| (c) Tissue having different types of cells | (iii) Sclereids |",
        "| (d) Dead cells with highly thickened walls and narrow lumen | (iv) Simple tissue |",
      ].join("\n")
    ),
  },
  {
    number: 114,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Protoplast fusion | (i) Totipotency |",
        "| (b) Plant tissue culture | (ii) Pomato |",
        "| (c) Meristem culture | (iii) Somaclones |",
        "| (d) Micropropagation | (iv) Virus free plants |",
      ].join("\n")
    ),
  },
  {
    number: 116,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Lenticels | (i) Phellogen |",
        "| (b) Cork cambium | (ii) Suberin deposition |",
        "| (c) Secondary cortex | (iii) Exchange of gases |",
        "| (d) Cork | (iv) Phelloderm |",
      ].join("\n")
    ),
  },
  {
    number: 127,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Cohesion | (i) More attraction in liquid phase |",
        "| (b) Adhesion | (ii) Mutual attraction among water molecules |",
        "| (c) Surface tension | (iii) Water loss in liquid phase |",
        "| (d) Guttation | (iv) Attraction towards polar surfaces |",
      ].join("\n")
    ),
  },
  {
    number: 130,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Cristae | (i) Primary constriction in chromosome |",
        "| (b) Thylakoids | (ii) Disc-shaped sacs in Golgi apparatus |",
        "| (c) Centromere | (iii) Infoldings in mitochondria |",
        "| (d) Cisternae | (iv) Flattened membranous sacs in stroma of plastids |",
      ].join("\n")
    ),
  },
  {
    number: 143,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) S phase | (i) Proteins are synthesized |",
        "| (b) G_{2} phase | (ii) Inactive phase |",
        "| (c) Quiescent stage | (iii) Interval between mitosis and initiation of DNA replication |",
        "| (d) G_{1} phase | (iv) DNA replication |",
      ].join("\n")
    ),
  },
  {
    number: 147,
    guard: COL_GUARD,
    fix: rebuildTable(
      COL_ROWS_HEADER,
      [
        COL_HEADER,
        "|---|---|",
        "| (a) Nitrococcus | (i) Denitrification |",
        "| (b) Rhizobium | (ii) Conversion of ammonia to nitrite |",
        "| (c) Thiobacillus | (iii) Conversion of nitrite to nitrate |",
        "| (d) Nitrobacter | (iv) Conversion of atmospheric nitrogen to ammonia |",
      ].join("\n")
    ),
  },
  {
    number: 150,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Protein | (i) C=C double bonds |",
        "| (b) Unsaturated fatty acid | (ii) Phosphodiester bonds |",
        "| (c) Nucleic acid | (iii) Glycosidic bonds |",
        "| (d) Polysaccharide | (iv) Peptide bonds |",
      ].join("\n")
    ),
  },
  {
    number: 158,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Metamerism | (i) Coelenterata |",
        "| (b) Canal system | (ii) Ctenophora |",
        "| (c) Comb plates | (iii) Annelida |",
        "| (d) Cnidoblasts | (iv) Porifera |",
      ].join("\n")
    ),
  },
  {
    number: 163,
    guard: /^Match (List - I with List - II\.|the following :) \n\| List-I \|/,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Physalia | (i) Pearl oyster |",
        "| (b) Limulus | (ii) Portuguese Man of War |",
        "| (c) Ancylostoma | (iii) Living fossil |",
        "| (d) Pinctada | (iv) Hookworm |",
      ].join("\n")
    ),
  },
  {
    number: 182,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Aspergillus niger | (i) Acetic Acid |",
        "| (b) Acetobacter aceti | (ii) Lactic Acid |",
        "| (c) Clostridium butylicum | (iii) Citric Acid |",
        "| (d) Lactobacillus | (iv) Butyric Acid |",
      ].join("\n")
    ),
  },
  {
    number: 184,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Vaults | (i) Entry of sperm through Cervix is blocked |",
        "| (b) IUDs | (ii) Removal of Vas deferens |",
        "| (c) Vasectomy | (iii) Phagocytosis of sperms within the Uterus |",
        "| (d) Tubectomy | (iv) Removal of fallopian tube |",
      ].join("\n")
    ),
  },
  {
    number: 190,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Allen's Rule | (i) Kangaroo rat |",
        "| (b) Physiological adaptation | (ii) Desert lizard |",
        "| (c) Behavioural adaptation | (iii) Marine fish at depth |",
        "| (d) Biochemical adaptation | (iv) Polar seal |",
      ].join("\n")
    ),
  },
  {
    number: 191,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Filariasis | (i) Haemophilus influenzae |",
        "| (b) Amoebiasis | (ii) Trichophyton |",
        "| (c) Pneumonia | (iii) Wuchereria bancrofti |",
        "| (d) Ringworm | (iv) Entamoeba histolytica |",
      ].join("\n")
    ),
  },
  {
    number: 194,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Scapula | (i) Cartilaginous joints |",
        "| (b) Cranium | (ii) Flat bone |",
        "| (c) Sternum | (iii) Fibrous joints |",
        "| (d) Vertebral column | (iv) Triangular flat bone |",
      ].join("\n")
    ),
  },
  {
    number: 197,
    guard: LIST_GUARD,
    fix: rebuildTable(
      LIST_ROWS_HEADER,
      [
        LIST_HEADER,
        "|---|---|",
        "| (a) Adaptive radiation | (i) Selection of resistant varieties due to excessive use of herbicides and pesticides |",
        "| (b) Convergent evolution | (ii) Bones of forelimbs in Man and Whale |",
        "| (c) Divergent evolution | (iii) Wings of Butterfly and Bird |",
        "| (d) Evolution by anthropogenic action | (iv) Darwin Finches |",
      ].join("\n")
    ),
  },
  {
    number: 140,
    guard: /Nt=Noert/,
    fix: (t) => t.replace("Nt=Noert", "N_{t} = N_{o} e^{rt}"),
  },
  {
    number: 142,
    guard: /pBR_\{3\}22/,
    fix: (t) => t.replace("pBR_{3}22", "pBR322"),
  },
];

const OPTIONS = [
  { number: 111, pos: 3, guard: /2, 4-D/, text: "2,4-D" },
  { number: 135, pos: 4, guard: /Section - B \(Biology : Botany\)$/, text: "Phosphoglyceric acid" },
  {
    number: 137,
    pos: 1,
    guard: /39 end of hnRNA/,
    text: "In capping, methyl guanosine triphosphate is added to the 3\u2032 end of hnRNA.",
  },
  {
    number: 139,
    pos: 1,
    guard: /Large colorless empty - Subsidiary cells cells/,
    text: "Large colorless empty cells in the epidermis of grass leaves - Subsidiary cells",
  },
  {
    number: 139,
    pos: 2,
    guard: /vascular - Conjunctive bundles are surrounded tissue/,
    text: "In dicot leaves, vascular bundles are surrounded by large thick-walled cells - Conjunctive tissue",
  },
  {
    number: 139,
    pos: 3,
    guard: /medullary rays - Interfascicular that form part of cambium cambial ring/,
    text: "Cells of medullary rays that form part of cambium - Interfascicular cambium",
  },
  {
    number: 139,
    pos: 4,
    guard: /parenchyma cells - Spongy rupturing the epidermis/,
    text: "Loose parenchyma cells rupturing the epidermis and forming a lens-shaped opening in bark - Spongy parenchyma",
  },
  { number: 150, pos: 4, guard: /Section - A \(Biology : Zoology\)$/, text: "(iv) (iii) (i) (ii)" },
  { number: 161, pos: 1, guard: /pO_\{2\}=10\^\{4\}/, text: "pO_{2}=104 and pCO_{2}=40" },
  { number: 170, pos: 4, guard: /10\^\{0\}%/, text: "100%" },
  {
    number: 185,
    pos: 4,
    guard: /Section - B \(Biology : Zoology\)$/,
    text: "T : 20 ; G : 25 ; C : 25",
  },
  {
    number: 200,
    pos: 4,
    guard: /- o 0 o -/,
    text: "(b) and (c) are correct",
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
