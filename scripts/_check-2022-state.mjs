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

// 1. All papers
const { data: papers, error: perr } = await sb
  .from("papers")
  .select("id, key, title, year, exam_type");
if (perr) console.log("papers error:", perr.message);
console.log("ALL PAPERS:", JSON.stringify(papers, null, 1));

// 2. Any 2022-related paper rows
const { data: p22 } = await sb
  .from("papers")
  .select("id, key, title, year, exam_type")
  .eq("year", 2022);
console.log("PAPERS year=2022:", JSON.stringify(p22, null, 1));

// 3. Storage: top-level folders + neet-2022 contents
const { data: topLevel, error: ltErr } = await sb.storage
  .from("question-images")
  .list("", { limit: 1000 });
console.log("storage top-level error:", ltErr?.message);
console.log(
  "storage top-level folders:",
  JSON.stringify((topLevel ?? []).map((f) => f.name), null, 1)
);

for (const folder of ["neet-2022", "2022"]) {
  const { data: files, error: ferr } = await sb.storage
    .from("question-images")
    .list(folder, { limit: 10000 });
  console.log(
    `storage "${folder}/": error=${ferr?.message} count=${files?.length ?? 0}`
  );
  if (files?.length) console.log("  first 10:", files.slice(0, 10).map((f) => f.name).join(", "));
}
process.exit(0);
