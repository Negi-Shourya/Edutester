#!/usr/bin/env node
/**
 * Read-only: dump NEET 2023 Biology questions (numbers 101-200) with
 * full stem + options from Supabase, flagging blank/missing text.
 *
 * Run:  node scripts/_dump-neet-2023-bio.mjs
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

const { data: papers } = await sb.from("papers").select("id,key").eq("key", "neet-2023");
const paper = papers?.[0];
if (!paper) {
  console.error("paper not found");
  process.exit(1);
}

const { data: qs } = await sb
  .from("questions")
  .select("id,number,text,figure_url")
  .eq("paper_id", paper.id)
  .order("number");

const bio = qs.filter((q) => q.number >= 101 && q.number <= 200);
const ids = bio.map((q) => q.id);
const { data: opts } = await sb
  .from("question_options")
  .select("question_id,position,label,text,figure_url")
  .in("question_id", ids)
  .order("position");

const optsByQ = new Map();
for (const o of opts) {
  if (!optsByQ.has(o.question_id)) optsByQ.set(o.question_id, []);
  optsByQ.get(o.question_id).push(o);
}

let flagCount = 0;
for (const q of bio) {
  const olist = optsByQ.get(q.id) ?? [];
  const blankOpts = olist.filter((o) => !o.text || !o.text.trim());
  const truncated = !q.text || q.text.trim().length < 30 || /[|]\s*$/.test(q.text);
  const flag = blankOpts.length || truncated;
  if (flag) flagCount++;
  console.log(`\n===== Q${q.number}${flag ? "  ⚠️  PROBLEM" : ""} =====`);
  console.log(`STEM: ${q.text}`);
  for (const o of olist) {
    const fig = o.figure_url ? ` [FIG:${o.figure_url.split("/").pop()}]` : "";
    console.log(`  ${o.label}. ${o.text || "«BLANK»"}${fig}`);
  }
}
console.log(`\nFlagged questions: ${flagCount} / ${bio.length}`);
process.exit(0);
