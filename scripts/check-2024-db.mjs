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
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY ?? env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2024").maybeSingle();
const { data: dbqs } = await sb
  .from("questions")
  .select("number, text, question_options(position, text)")
  .eq("paper_id", paper.id)
  .order("number");

const json = JSON.parse(readFileSync("neet-out/2024/questions.json", "utf8"));
const byNum = new Map(json.questions.map((q) => [q.number, q]));

for (const dq of dbqs) {
  const jq = byNum.get(dq.number);
  if (!jq) continue;
  const dbT = (dq.text ?? "").replace(/\s+/g, " ").trim();
  const jT = (jq.text ?? "").replace(/\s+/g, " ").trim();
  if (dbT !== jT) {
    console.log(`Q${dq.number} stem DB vs JSON differ:`);
    console.log("  DB :", JSON.stringify(dbT.slice(0, 160)));
    console.log("  JSON:", JSON.stringify(jT.slice(0, 160)));
  }
}
