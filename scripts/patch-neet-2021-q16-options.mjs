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
  { position: 1, text: "\\frac{1}{2}\\varepsilon_{0}E^{2}" },
  { position: 2, text: "\\varepsilon_{0}EAd" },
  { position: 3, text: "\\frac{1}{2}\\varepsilon_{0}E^{2}Ad" },
  { position: 4, text: "\\frac{E^{2}Ad}{\\varepsilon_{0}}" },
];

const OPTIONS_OLD = [
  "2 ε 0E",
  "\\frac{1}{2}\\varepsilon_{0}E^{2}Ad",
  "2 \\varepsilon_{0} E Ad E Ad",
  "\\varepsilon_{0}",
];

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: qs, error: qerr } = await sb
  .from("questions")
  .select("id,number")
  .eq("paper_id", 56)
  .eq("number", 16);
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
  if (row.text !== OPTIONS_OLD[i]) {
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
const jq = json.questions.find((x) => x.number === 16);
if (jq) {
  let jChanged = 0;
  for (let i = 0; i < 4; i++) {
    const want = OPTIONS_NEW[i].text;
    if (jq.options[i].text !== want) {
      if (jq.options[i].text !== OPTIONS_OLD[i]) {
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
