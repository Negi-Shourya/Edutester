#!/usr/bin/env node
/**
 * Read-only: dump NEET 2023 Biology answer keys (Q101-200).
 * Run:  node scripts/_dump-neet-2023-bio-keys.mjs
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

const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2023").single();
const { data: qs } = await sb.from("questions").select("id,number").eq("paper_id", paper.id).order("number");
const bio = qs.filter((q) => q.number >= 101 && q.number <= 200);
const { data: keys } = await sb
  .from("question_keys")
  .select("question_id,correct_answer")
  .in("question_id", bio.map((q) => q.id));
const m = new Map(qs.map((q) => [q.id, q.number]));
keys
  .sort((a, b) => m.get(a.question_id) - m.get(b.question_id))
  .forEach((k) => console.log(`Q${m.get(k.question_id)}: ${k.correct_answer || "(empty)"}`));
process.exit(0);
