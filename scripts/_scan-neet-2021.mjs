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
const { data } = await sb
  .from("questions")
  .select("id,number,text")
  .eq("paper_id", 56)
  .order("number");

const issues = [];
for (const q of data) {
  const t = q.text || "";
  if (!t || t.length < 10) issues.push([q.number, "EMPTY", t]);
  if (/\\frac\{\\frac/.test(t)) issues.push([q.number, "NESTED-FRAC", t.slice(-140)]);
  if (/is\s*,\s*$/.test(t)) issues.push([q.number, "MISSING-VALUE", t.slice(-140)]);
  if (/\\\\/.test(t)) issues.push([q.number, "DOUBLE-BACKSLASH", t.slice(-140)]);
  if (/\ufffd/.test(t)) issues.push([q.number, "REPLACEMENT-CHAR", t.slice(-140)]);
}
console.log("total", data.length, "issues", issues.length);
for (const i of issues) console.log(JSON.stringify(i));

const { data: opts } = await sb
  .from("question_options")
  .select("question_id,label,text")
  .in("question_id", data.map((q) => q.id));
const optIssues = [];
for (const o of opts) {
  const t = o.text || "";
  if (/\\frac\{\\frac/.test(t)) optIssues.push([o.question_id, o.label, "NESTED-FRAC", t.slice(-140)]);
  if (/\\\\/.test(t)) optIssues.push([o.question_id, o.label, "DOUBLE-BACKSLASH", t.slice(-140)]);
  if (!t && !o.figure_url) optIssues.push([o.question_id, o.label, "EMPTY", ""]);
}
console.log("option issues:", optIssues.length);
for (const i of optIssues) console.log(JSON.stringify(i));
process.exit(0);
