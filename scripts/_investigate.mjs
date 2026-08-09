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
const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2025").single();
const { data: sections } = await sb.from("sections").select("id,name").eq("paper_id", paper.id);
const secName = new Map(sections.map((s) => [s.id, s.name]));

const { data: questions } = await sb
  .from("questions")
  .select("id,number,section_id,text")
  .eq("paper_id", paper.id);
const { data: opts } = await sb
  .from("question_options")
  .select("question_id,position,text,figure_url")
  .in("question_id", questions.map((q) => q.id));

// 1. options with images
const withImg = opts.filter((o) => o.figure_url);
console.log(`== options with figure_url: ${withImg.length} ==`);
for (const o of withImg) {
  const q = questions.find((x) => x.id === o.question_id);
  console.log(`Q${q.number} ${secName.get(q.section_id)} opt${o.position}: ${o.figure_url} text=${JSON.stringify((o.text ?? "").slice(0, 80))}`);
}

// 2. questions with images
const qImg = questions.filter((q) => q.image_url || q.block_url);
console.log(`\n== questions with images: ${qImg.length} ==`);
for (const q of qImg) {
  console.log(`Q${q.number} ${secName.get(q.section_id)}: ${q.text.slice(0, 90)}`);
}

// 3. match questions
console.log(`\n== match-the-following (stem contains 'Match List') ==`);
for (const q of questions.filter((x) => /match list/i.test(x.text))) {
  console.log(`Q${q.number} ${secName.get(q.section_id)}: ${JSON.stringify(q.text)}`);
  for (const o of opts.filter((x) => x.question_id === q.id).sort((a, b) => a.position - b.position)) {
    console.log(`   (${o.position}) ${JSON.stringify(o.text)}`);
  }
  console.log();
}
