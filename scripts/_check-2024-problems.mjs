import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const sb = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const WANT = new Set([6, 7, 11, 15, 16, 21, 24, 29, 30, 31, 33, 36, 39, 42, 46, 48, 49, 50]);

const { data: paper } = await sb
  .from("papers")
  .select("id")
  .eq("key", "neet-2024")
  .maybeSingle();
console.log("paper:", paper?.id);

const { data: qs } = await sb
  .from("questions")
  .select("id, number, text, figure_url")
  .eq("paper_id", paper.id)
  .order("number");

const ids = qs.map((q) => q.id);
const { data: opts } = await sb
  .from("question_options")
  .select("question_id, position, label, text, figure_url")
  .in("question_id", ids)
  .order("position");
const { data: keys } = await sb
  .from("question_keys")
  .select("question_id, correct_answer, solution")
  .in("question_id", ids);

const optByQ = new Map();
for (const o of opts ?? []) {
  if (!optByQ.has(o.question_id)) optByQ.set(o.question_id, []);
  optByQ.get(o.question_id).push(o);
}
const keyByQ = new Map((keys ?? []).map((k) => [k.question_id, k]));

for (const q of qs) {
  if (!WANT.has(q.number)) continue;
  const o = optByQ.get(q.id) ?? [];
  const k = keyByQ.get(q.id);
  console.log(`=== Q${q.number} ===`);
  console.log("  text:", JSON.stringify(q.text ?? ""));
  console.log("  figure_url:", JSON.stringify(q.figure_url));
  for (const op of o) {
    console.log(
      `  opt[${op.position}] ${op.label}:`,
      JSON.stringify(op.text ?? ""),
      "fig:",
      op.figure_url ? "Y" : "-"
    );
  }
  console.log("  key:", JSON.stringify(k?.correct_answer ?? null), "| sol:", JSON.stringify((k?.solution ?? "").slice(0, 80)));
}
