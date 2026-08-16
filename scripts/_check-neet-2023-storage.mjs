#!/usr/bin/env node
/**
 * Read-only inspection of NEET 2023 figure images in Supabase.
 * Lists all objects in question-images/neet-2023/ and counts how many
 * questions/options reference them via figure_url.
 *
 * Run:  node scripts/_check-neet-2023-storage.mjs
 */
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

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "question-images";
const PREFIX = "neet-2023";

// 1) List all storage objects under the prefix
const objects = [];
let token;
try {
  do {
    const { data: page, error } = await sb.storage
      .from(BUCKET)
      .list(PREFIX, { limit: 200, offset: objects.length, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    if (!page || page.length === 0) break;
    objects.push(...page.map((o) => o.name));
  } while (objects.length % 200 === 0 && objects.length > 0);
} catch (e) {
  console.error("storage list error:", e.message);
}
console.log(`\n[1] Storage objects in ${BUCKET}/${PREFIX}: ${objects.length}`);
console.log(objects.join("\n"));

// 2) DB references
const { data: papers } = await sb
  .from("papers")
  .select("id,key,title")
  .eq("key", "neet-2023");
const paper = papers?.[0];
if (!paper) {
  console.error("NEET 2023 paper not found in DB");
  process.exit(1);
}
console.log(`\n[2] Paper: ${paper.title} (id=${paper.id})`);

const { data: qRefs } = await sb
  .from("questions")
  .select("id,number,figure_url")
  .eq("paper_id", paper.id);
const qWithFigs = (qRefs ?? []).filter((q) => q.figure_url?.length);
const { data: oRefs } = await sb
  .from("question_options")
  .select("question_id,position,figure_url")
  .in(
    "question_id",
    qRefs.map((q) => q.id)
  );

// All referenced URLs (questions + options), then extract file names
const urlSet = new Set();
for (const q of qWithFigs) for (const u of q.figure_url) urlSet.add(u);
for (const o of oRefs ?? []) if (o.figure_url) urlSet.add(o.figure_url);

const referenced = new Set();
for (const u of urlSet) {
  const m = u.match(/\/neet-2023\/([^/]+)$/);
  if (m) referenced.add(m[1]);
}

const stored = new Set(objects);
const missing = [...referenced].filter((f) => !stored.has(f));
const orphaned = objects.filter((f) => !referenced.has(f));

console.log(`\n[3] Questions referencing figures: ${qWithFigs.length} / ${qRefs.length}`);
console.log(`    Distinct referenced files: ${referenced.size}`);
console.log(`    Missing from storage: ${missing.length}${missing.length ? "\n    " + missing.join("\n    ") : ""}`);
console.log(`    Stored but unreferenced (orphans): ${orphaned.length}${orphaned.length ? "\n    " + orphaned.join("\n    ") : ""}`);
process.exit(0);
