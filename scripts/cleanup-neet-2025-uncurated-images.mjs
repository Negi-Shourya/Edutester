#!/usr/bin/env node
/**
 * Deletes every NEET 2025 image from Supabase Storage that is NOT in the
 * curated neet/neet images folder, and clears the corresponding DB references.
 *
 * The curated folder is the source of truth: only question/option figures
 * whose file exists in neet/neet images stay in storage (folder
 * neet-2025-images/). Everything under the old automated neet-2025/ folder
 * is removed and DB figure_url references to it are cleared.
 *
 * Run:  node scripts/cleanup-neet-2025-uncurated-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync(new URL("../.env", import.meta.url), "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const url = envFromFile("VITE_SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const BUCKET = "question-images";
const CURATED_DIR = join(__dirname, "..", "neet", "neet images");
const curated = new Set(readdirSync(CURATED_DIR).filter((f) => f.endsWith(".png")));

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // 1. List every storage folder under the bucket, keep only NEET-related ones
  const { data: folders, error: fErr } = await supabase.storage.from(BUCKET).list("", { limit: 500 });
  if (fErr) throw fErr;
  const neetFolders = (folders || []).map((f) => f.name).filter((n) => n.toLowerCase().includes("neet"));

  // 2. For each folder, find objects whose file name is not in the curated folder
  const toDelete = [];
  const folderObjects = {};
  for (const folder of neetFolders) {
    const { data: objs } = await supabase.storage.from(BUCKET).list(folder, { limit: 500 });
    folderObjects[folder] = (objs || []).map((o) => o.name);
    for (const name of folderObjects[folder]) {
      if (!curated.has(name)) toDelete.push(`${folder}/${name}`);
    }
  }

  console.log(`Curated neet images folder: ${curated.size} files`);
  for (const folder of neetFolders) {
    const keep = folderObjects[folder].filter((n) => curated.has(n));
    console.log(`  storage ${folder}/: ${folderObjects[folder].length} object(s) -> ${keep.length} kept, ${folderObjects[folder].length - keep.length} to delete`);
  }

  // 3. Delete the non-curated objects
  if (toDelete.length === 0) {
    console.log("Nothing to delete from storage.");
  } else {
    const CHUNK = 100;
    let deleted = 0;
    for (let i = 0; i < toDelete.length; i += CHUNK) {
      const { error } = await supabase.storage.from(BUCKET).remove(toDelete.slice(i, i + CHUNK));
      if (error) throw error;
      deleted += Math.min(CHUNK, toDelete.length - i);
    }
    console.log(`Storage: deleted ${deleted} object(s)`);
  }

  // 4. Clear DB references to the deleted objects
  const { data: paper } = await supabase.from("papers").select("id").eq("key", "neet-2025").single();
  if (!paper) throw new Error("neet-2025 paper not found");
  const { data: qs } = await supabase.from("questions").select("id, number, figure_url").eq("paper_id", paper.id);
  const ids = qs.map((q) => q.id);
  const { data: opts } = await supabase.from("question_options").select("id, question_id, position, figure_url").in("question_id", ids);

  const qById = new Map(qs.map((q) => [q.id, q]));
  const deleteSet = new Set(toDelete.map((p) => p.split("/").pop()));

  let qCleared = 0;
  for (const q of qs) {
    const urls = q.figure_url || [];
    const remaining = urls.filter((u) => !deleteSet.has(decodeURIComponent(u.split("/").pop())));
    if (remaining.length !== urls.length) {
      await supabase.from("questions").update({ figure_url: remaining }).eq("id", q.id);
      console.log(`  Q${q.number}: stem figure_url cleared`);
      qCleared++;
    }
  }

  let oCleared = 0;
  for (const o of opts) {
    if (!o.figure_url) continue;
    if (!deleteSet.has(decodeURIComponent(o.figure_url.split("/").pop()))) continue;
    await supabase.from("question_options").update({ figure_url: null }).eq("id", o.id);
    console.log(`  Q${qById.get(o.question_id).number} opt ${o.position}: option figure_url cleared`);
    oCleared++;
  }

  console.log(`DB: cleared ${qCleared} stem reference(s), ${oCleared} option reference(s)`);
  console.log("\nDone.");
}

await main();
