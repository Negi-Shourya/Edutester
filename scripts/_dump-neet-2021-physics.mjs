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

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data: qs } = await sb
  .from("questions")
  .select("id,number,text,figure_url")
  .eq("paper_id", 56)
  .gte("number", 1)
  .lte("number", 50)
  .order("number");
const { data: opts } = await sb
  .from("question_options")
  .select("question_id,position,text,figure_url")
  .in("question_id", qs.map((q) => q.id));
const { data: keys } = await sb
  .from("question_keys")
  .select("question_id,correct_answer")
  .in("question_id", qs.map((q) => q.id));

const keyByQ = new Map(keys.map((k) => [k.question_id, k.correct_answer]));
for (const q of qs) {
  console.log(`=== Q${q.number} [key ${keyByQ.get(q.id) ?? "?"}] ${q.figure_url?.join(",") ? "FIG:" + q.figure_url.join(",") : ""} ===`);
  console.log(q.text);
  for (const o of opts.filter((x) => x.question_id === q.id).sort((a, b) => a.position - b.position)) {
    console.log(`  ${["A", "B", "C", "D"][o.position - 1]}: ${o.text || (o.figure_url ? `[FIG] ${o.figure_url}` : "")}`);
  }
}
process.exit(0);
