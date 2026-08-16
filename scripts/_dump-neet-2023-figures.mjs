#!/usr/bin/env node
/**
 * Read-only: dump every figure reference for NEET 2023 (paper 40)
 * across questions and options, so we can map replacement images.
 *
 * Run:  node scripts/_dump-neet-2023-figures.mjs
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

const { data: papers } = await sb
  .from("papers")
  .select("id,key")
  .eq("key", "neet-2023");
const paper = papers?.[0];
if (!paper) {
  console.error("paper not found");
  process.exit(1);
}

const { data: qs } = await sb
  .from("questions")
  .select("id,number,figure_url")
  .eq("paper_id", paper.id)
  .order("number");

console.log("=== QUESTIONS with figures ===");
for (const q of qs) {
  if (q.figure_url?.length) {
    const files = q.figure_url.map((u) => u.split("/neet-2023/").pop());
    console.log(`Q${q.number}: ${files.join(", ")}`);
  }
}

const qids = qs.map((q) => q.id);
const { data: opts } = await sb
  .from("question_options")
  .select("question_id,position,figure_url")
  .in("question_id", qids);
const byQ = new Map(qs.map((q) => [q.id, q.number]));
console.log("\n=== OPTIONS with figures ===");
for (const o of opts) {
  if (o.figure_url) {
    const file = o.figure_url.split("/neet-2023/").pop();
    console.log(`Q${byQ.get(o.question_id)} opt ${o.position}: ${file}`);
  }
}
process.exit(0);
