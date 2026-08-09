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
const { data: qs } = await supabase
  .from("questions")
  .select("id, number, text")
  .eq("paper_id", paper.id)
  .in("number", [5, 11, 14, 20, 29, 36, 40, 44, 51, 55, 59, 68, 69, 73, 74, 86, 87, 88, 145, 152])
  .order("number");
const ids = qs.map((q) => q.id);
const { data: opts } = await supabase
  .from("question_options")
  .select("question_id, position, label, text")
  .in("question_id", ids)
  .order("question_id");

const optByQ = new Map();
for (const o of opts) {
  if (!optByQ.has(o.question_id)) optByQ.set(o.question_id, []);
  optByQ.get(o.question_id).push(o);
}
for (const q of qs) {
  console.log("=== Q" + q.number + " ===");
  console.log(q.text);
  for (const o of optByQ.get(q.id) ?? []) {
    if (o.text) console.log(`  ${o.label}: ${o.text}`);
  }
  console.log();
}
