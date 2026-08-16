#!/usr/bin/env node
/**
 * Assemble the final NEET 2022 questions.json for seeding.
 *
 * Sources:
 *  - neet-out/2022/questions_raw.json  : collegedunia scan OCR — figures,
 *    option images, option labels/order, printed answer key.
 *  - neet-out/2022/s1_full.json        : Aakash Code-S1 clean text — stems,
 *    option text, answer key (same 200 questions, different order).
 *  - neet-out/2022/_q2s1_map.json      : our option-based match (200/200).
 *
 * The 2022 paper's own option ORDER is preserved; text comes from the clean
 * S1 source; the answer key is resolved from S1 (translated to 2022 option
 * numbering by content), with the scan's printed key used to cross-check.
 *
 * Known NTA resolutions baked in:
 *  - Q17  (photoelectric, stopping potentials Vs/2 & Vs): NTA declared BONUS
 *        (challenged) -> empty answer key (scoring awards marks to all).
 *  - Q54  (IUPAC name of element 119): answer line missing in S1 -> 3 (ununennium).
 *  - Q82  (95% pure CaCO3): scan printed 9.50 g but the correct value is
 *        1.32 g (option 4) — verified against official answer key.
 *  - Q93  (emf of cell): NA -> empty.
 *  - Q128 (vascular bundles): NA -> empty.
 *  - Q180 (taxonomic categories): S1 key "3*" -> 3.
 *
 * Run: node scripts/assemble-neet-2022.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "neet-out/2022";
const raw = JSON.parse(readFileSync(join(DIR, "questions_raw.json"), "utf8")).questions;
const s1 = JSON.parse(readFileSync(join(DIR, "s1_full.json"), "utf8")).questions;
const map = JSON.parse(readFileSync(join(DIR, "_q2s1_map.json"), "utf8"));

const s1ByN = new Map(s1.map((q) => [q.number, q]));
const rawByN = new Map(raw.map((q) => [q.number, q]));

// NTA resolutions (2022 question number -> answer list; [] = bonus/NA)
const FIXED_ANSWERS = {
  17: [],
  54: [3],
  82: [4],
  93: [],
  128: [],
  180: [3],
};

const norm = (t) => (t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ---------- option text matching: 2022 option -> best S1 option ----------
function matchS1Option(ourOpts, s1Opts) {
  // ourOpts: [{label,text,image}] in 2022 order; s1Opts: [{label,text}]
  const used = new Set();
  const out = [];
  for (const o of ourOpts) {
    if (o.image) {
      out.push({ ...o, text: "" });
      continue;
    }
    let bestIdx = -1;
    let bestScore = -1;
    const oTok = new Set(norm(o.text).split(" "));
    s1Opts.forEach((so, i) => {
      if (used.has(i)) return;
      const sTok = new Set(norm(so.text).split(" "));
      const inter = [...oTok].filter((t) => sTok.has(t)).length;
      const union = new Set([...oTok, ...sTok]).size;
      const score = union === 0 ? 0 : inter / union;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });
    if (bestIdx >= 0) {
      used.add(bestIdx);
      out.push({ ...o, text: s1Opts[bestIdx].text });
    } else {
      out.push({ ...o, text: o.text ?? "" });
    }
  }
  return out;
}

// ---------- match-list table formatting (2024 convention) ----------
function formatMatchText(text) {
  // S1 run-on: "Match List-I with List-II List-I (X) List-II (Y) (a) A1 (i) R1 (b) A2 (ii) R2 ... Choose the correct answer ..."
  const m = text.match(/^(.*?List-II\s*\([^)]*\))(.*?)(Choose the correct.*)$/i);
  if (!m) return text;
  const head = m[1].replace(/\s+/g, " ").trim();
  const body = m[2];
  const tail = m[3].replace(/\s+/g, " ").trim();

  const tokens = [];
  const re = /\(([a-eA-E])\)\s*([^()]*(?:\([^()]*\)[^()]*)*?)(?=\([a-eA-E]\)\s|\([ivxIVX]+\)\s|$)/g;
  let last = "";
  // simpler: walk the body with two alternates
  const parts = body.match(/\(([a-eA-E])\)\s*([^(]*)|\(([ivxIVX]+)\)\s*([^(]*)/gi);
  const items = [];
  if (parts) {
    for (const p of parts) {
      const lm = p.match(/\(([a-eA-E])\)\s*(.*)/i);
      const rm = p.match(/\(([ivxIVX]+)\)\s*(.*)/i);
      if (lm) items.push({ kind: "L", key: lm[1].toUpperCase(), txt: lm[2].trim() });
      else if (rm) items.push({ kind: "R", key: rm[1].toLowerCase(), txt: rm[2].trim() });
    }
  }
  if (items.length === 0) return text;

  const rows = [];
  let cur = null;
  for (const it of items) {
    if (it.kind === "L") {
      cur = { L: it, R: null };
      rows.push(cur);
    } else if (cur) {
      cur.R = it;
    }
  }
  const lines = [head.replace(/\s+List-I/, ".\nList-I")];
  for (const r of rows) {
    lines.push(`${r.L.key}. ${r.L.txt}  ${r.R ? r.R.key + ". " + r.R.txt : ""}`.trimEnd());
  }
  lines.push(tail);
  return lines.join("\n");
}

// ---------- translate S1 answer to 2022 numbering by content ----------
function translateAnswer(s1q, s1ans, ourOpts) {
  const s1Opts = s1q.options;
  const target = s1Opts[Number(s1ans) - 1];
  if (!target) return null;
  const tNorm = norm(target.text);
  if (!tNorm) return null;
  for (let i = 0; i < ourOpts.length; i++) {
    if (ourOpts[i].image) continue;
    if (norm(ourOpts[i].text) === tNorm) return i + 1;
  }
  // fuzzy fallback
  let best = -1;
  let bestScore = 0;
  const tTok = new Set(tNorm.split(" "));
  ourOpts.forEach((o, i) => {
    if (o.image) return;
    const sTok = new Set(norm(o.text).split(" "));
    const inter = [...tTok].filter((x) => sTok.has(x)).length;
    const union = new Set([...tTok, ...sTok]).size;
    const score = union ? inter / union : 0;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return bestScore >= 0.55 ? best + 1 : null;
}

// ---------- build ----------
const out = [];
const report = [];
let ansMissing = 0;

for (const q of raw) {
  const s1q = s1ByN.get(map[q.number]?.s1_q);
  if (!s1q) {
    report.push(`Q${q.number}: NO S1 MATCH`);
    continue;
  }

  // option text from S1, order/images from the 2022 paper
  const options = matchS1Option(q.options, s1q.options);

  // answer: fixed resolutions first
  let answers;
  if (q.number in FIXED_ANSWERS) {
    answers = FIXED_ANSWERS[q.number];
  } else {
    const translated = translateAnswer(s1q, s1q.answers, options);
    if (translated === null) {
      answers = q.answers ?? [];
      ansMissing++;
      report.push(`Q${q.number}: could not translate S1 ans=${s1q.answers} (kept raw ${JSON.stringify(q.answers)})`);
    } else {
      answers = [translated];
      const rawAns = q.answers ?? [];
      if (rawAns.length && rawAns[0] !== translated) {
        report.push(`Q${q.number}: raw ${rawAns[0]} vs S1 ${translated} — using S1`);
      }
    }
  }

  // match-list tables render nicely in the 2024 format
  let text = s1q.text.trim();
  if (/Match\s+List/i.test(text)) text = formatMatchText(text);
  text = text.replace(/\s+/g, " ").replace(/ - \d+ - NEET.*$/, "").trim();

  out.push({
    section: q.section,
    number: q.number,
    text,
    options: options.map((o) => ({
      label: o.label,
      text: o.text?.trim() ?? "",
      figure: o.image ?? null,
    })),
    answers,
    images: q.images ?? [],
  });
}

out.sort((a, b) => a.number - b.number);

const final = {
  key: "neet-2022",
  title: "NEET (UG) 2022",
  fullTitle: "NEET (UG) 2022 - National Eligibility cum Entrance Test",
  examDate: "2022-07-17",
  durationMinutes: 200,
  questionCount: out.length,
  questions: out,
};

writeFileSync(join(DIR, "questions.json"), JSON.stringify(final, null, 1) + "\n", "utf8");

// stats
const emptyStems = out.filter((q) => !q.text.trim()).length;
const emptyAns = out.filter((q) => !q.answers.length).length;
const imgOpts = out.filter((q) => q.options.some((o) => o.figure)).length;
console.log(`wrote ${out.length} questions -> ${DIR}/questions.json`);
console.log(`empty stems: ${emptyStems}, empty answers: ${emptyAns}, questions with image options: ${imgOpts}`);
console.log(`\n--- report (${report.length} items) ---`);
for (const r of report) console.log(r);
