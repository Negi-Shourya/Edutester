import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync("D:\\Github Repo\\Edutester\\.env", "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const url = envFromFile("VITE_SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2025").single();

// Look at all question text + options for the NEET 2025 paper
const { data: qs } = await supabase
  .from("questions")
  .select("id, number, text")
  .eq("paper_id", paper.id)
  .order("number");
const ids = qs.map((q) => q.id);
const { data: opts } = await supabase
  .from("question_options")
  .select("question_id, position, text")
  .in("question_id", ids)
  .order("question_id");

// candidate patterns for plain-text subscripts: letter followed by digit(s) that should be subscript
// e.g. VB, VA (letters as subscripts), CH2, H2O, CO2, Na2, O3 etc.
const reLetter = /\b([A-Z])([A-Z])\b/g; // two-uppercase-letter tokens like VB, VA
const reDigitSub = /\b([A-Za-z]+)([0-9])(?!\s*[a-zA-Z^{]|\s*\.\s*[0-9]|\s*\)|\s*[-–+→]|\s*\^|\s*\})/g;
// simpler: [A-Z][a-z]?[0-9]+ sequences like H2O, CO2, CH2O3, N2, O2, SO4, Fe2O3, MgCl2

const found = [];
for (const q of qs) {
  const text = q.text || "";
  const matches = [];
  const dig = text.matchAll(/\b([A-Z][a-z]?[0-9]+[A-Za-z0-9]*)\b/g);
  for (const m of dig) matches.push("digit:" + m[1]);
  const two = text.matchAll(/\b([A-Z]{2})(?=[\s,.;:?–-]|$)/g);
  for (const m of two) matches.push("twoUpper:" + m[1]);
  if (matches.length) found.push({ number: q.number, matches: [...new Set(matches)].slice(0, 8) });
}
console.log("questions with potential plain subscripts in TEXT:");
for (const f of found) console.log(`  Q${f.number}: ${f.matches.join(", ")}`);

const foundOpts = {};
for (const o of opts) {
  if (!o.text) continue;
  const matches = [];
  const dig = o.text.matchAll(/\b([A-Z][a-z]?[0-9]+[A-Za-z0-9]*)\b/g);
  for (const m of dig) matches.push("digit:" + m[1]);
  const two = o.text.matchAll(/\b([A-Z]{2})(?=[\s,.;:?–-]|$)/g);
  for (const m of two) matches.push("twoUpper:" + m[1]);
  if (matches.length) {
    if (!foundOpts[o.question_id]) foundOpts[o.question_id] = new Set();
    matches.forEach((m) => foundOpts[o.question_id].add(m));
  }
}
const qByNum = new Map(qs.map((q) => [q.id, q.number]));
console.log("\nquestions with potential plain subscripts in OPTIONS:");
for (const [qid, ms] of Object.entries(foundOpts)) {
  console.log(`  Q${qByNum.get(Number(qid))}: ${[...ms].join(", ")}`);
}
