import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const OLD_STEM =
  "The velocity of a small ball of mass M and density d, when dropped in a container filled with glycerine becomes constant after some time. If the density d of glycerine is , then the viscous force acting on the ball will be : \\frac{\\frac{\\frac{Mg}{2}}{2}}{2}";
const NEW_STEM =
  "The velocity of a small ball of mass M and density d, when dropped in a container filled with glycerine becomes constant after some time. If the density of glycerine is \\frac{d}{2}, then the viscous force acting on the ball will be :";

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: qs, error: qerr } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", 56)
  .eq("number", 12);
if (qerr) throw new Error(`select failed: ${qerr.message}`);
if (!qs?.length) throw new Error("question 12 not found in paper 56");
const q = qs[0];

if (q.text === NEW_STEM) {
  console.log("DB stem already fixed — nothing to do");
} else if (q.text !== OLD_STEM) {
  throw new Error(`unexpected current stem:\n${q.text}`);
} else {
  const { error: uerr } = await sb
    .from("questions")
    .update({ text: NEW_STEM })
    .eq("id", q.id);
  if (uerr) throw new Error(`update failed: ${uerr.message}`);
  console.log("DB stem fixed for question 12 (id " + q.id + ")");
}

const jsonPath = new URL("../neet-out/2021/questions.json", import.meta.url);
const json = JSON.parse(readFileSync(jsonPath, "utf8"));
const jq = json.questions.find((x) => x.number === 12);
if (!jq) throw new Error("question 12 missing from questions.json");
if (jq.text === NEW_STEM) {
  console.log("questions.json stem already fixed — nothing to do");
} else if (jq.text !== OLD_STEM) {
  throw new Error(`unexpected questions.json stem:\n${jq.text}`);
} else {
  jq.text = NEW_STEM;
  writeFileSync(jsonPath, JSON.stringify(json, null, 1) + "\n", "utf8");
  console.log("questions.json stem fixed");
}

const { data: keys } = await sb
  .from("question_keys")
  .select("correct_answer")
  .eq("question_id", q.id);
console.log("answer key (must stay untouched):", JSON.stringify(keys));
process.exit(0);
