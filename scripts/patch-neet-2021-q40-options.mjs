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

const OPTIONS_NEW = [
  { position: 1, text: "\\frac{1}{2} kg" },
  { position: 2, text: "\\frac{1}{3} kg" },
  { position: 3, text: "\\frac{1}{6} kg" },
  { position: 4, text: "\\frac{1}{12} kg" },
];

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: qs, error: qerr } = await sb
  .from("questions")
  .select("id,number")
  .eq("paper_id", 56)
  .eq("number", 40);
if (qerr) throw new Error(`select failed: ${qerr.message}`);
const q = qs[0];

const { data: opts, error: oerr } = await sb
  .from("question_options")
  .select("id,position,text")
  .eq("question_id", q.id)
  .order("position");
if (oerr) throw new Error(`options select failed: ${oerr.message}`);

let changed = 0;
for (let i = 0; i < 4; i++) {
  const row = opts[i];
  const want = OPTIONS_NEW[i].text;
  if (row.text === want) {
    console.log(`pos ${row.position}: already correct`);
    continue;
  }
  if (row.text !== "kg") {
    throw new Error(`pos ${row.position}: unexpected current text "${row.text}"`);
  }
  const { error: uerr } = await sb
    .from("question_options")
    .update({ text: want })
    .eq("id", row.id);
  if (uerr) throw new Error(`pos ${row.position} update failed: ${uerr.message}`);
  changed++;
  console.log(`pos ${row.position}: fixed`);
}
console.log(`DB: ${changed} option(s) updated`);

const jsonPath = new URL("../neet-out/2021/questions.json", import.meta.url);
const json = JSON.parse(readFileSync(jsonPath, "utf8"));
const jq = json.questions.find((x) => x.number === 40);
if (jq) {
  let jChanged = 0;
  for (let i = 0; i < 4; i++) {
    const want = OPTIONS_NEW[i].text;
    if (jq.options[i].text !== want) {
      if (jq.options[i].text !== "kg") {
        throw new Error(`questions.json pos ${i + 1}: unexpected "${jq.options[i].text}"`);
      }
      jq.options[i].text = want;
      jChanged++;
    }
  }
  if (jChanged) {
    writeFileSync(jsonPath, JSON.stringify(json, null, 1) + "\n", "utf8");
    console.log(`questions.json: ${jChanged} option(s) updated`);
  }
}

const { data: keys } = await sb.from("question_keys").select("correct_answer").eq("question_id", q.id);
console.log("answer key (must stay untouched):", JSON.stringify(keys));
process.exit(0);
