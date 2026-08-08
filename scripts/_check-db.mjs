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
const { data: papers, error: perr } = await sb
  .from("papers")
  .select("id,key,title,year")
  .eq("key", "neet-2025");
console.log("papers:", JSON.stringify({ data: papers, error: perr?.message }, null, 1));
if (papers?.length) {
  const { data: q } = await sb
    .from("questions")
    .select("id,number,text,figure_url")
    .eq("paper_id", papers[0].id)
    .order("number")
    .limit(3);
  console.log("sample questions:", JSON.stringify(q, null, 1));
  const { count } = await sb.from("questions").select("id", { count: "exact", head: true }).eq("paper_id", papers[0].id);
  console.log("question count:", count);
}
process.exit(0);