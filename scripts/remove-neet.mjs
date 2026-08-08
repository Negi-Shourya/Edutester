#!/usr/bin/env node
/**
 * Removes ALL NEET question papers and their images from Supabase.
 *
 * What it does:
 *   1. Fetches all papers with exam_type = 'neet' from the papers table.
 *   2. Deletes each paper — CASCADE on the foreign keys automatically removes
 *      the related rows in: sections, subsections, questions, question_options,
 *      question_keys, and question_diagrams.
 *   3. Removes all files in the question-images storage bucket that are
 *      prefixed with "neet-" (e.g. neet-2023/*, neet-2024/*, etc.).
 *
 * JEE data is NEVER touched — only rows/files where exam_type = 'neet'
 * or storage path starts with "neet-".
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (or env var). Run:
 *   node scripts/remove-neet.mjs
 *
 * Add --dry-run to preview what would be deleted without actually deleting.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

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

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const key = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const BUCKET = "question-images";

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ────────────────────────────────────────────────────────
// 1. Remove NEET papers (cascade handles all child tables)
// ────────────────────────────────────────────────────────
console.log("Fetching NEET papers…");
const { data: neetPapers, error: fetchError } = await supabase
  .from("papers")
  .select("id, key, title, exam_type")
  .eq("exam_type", "neet");

if (fetchError) {
  console.error(`Failed to fetch NEET papers: ${fetchError.message}`);
  process.exit(1);
}

if (!neetPapers || neetPapers.length === 0) {
  console.log("No NEET papers found in the database. Nothing to delete.");
} else {
  console.log(`Found ${neetPapers.length} NEET paper(s):`);
  for (const p of neetPapers) {
    console.log(`  • [id=${p.id}] ${p.key} — ${p.title}`);
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Skipping paper deletion.");
  } else {
    const paperIds = neetPapers.map((p) => p.id);
    const { error: delError } = await supabase
      .from("papers")
      .delete()
      .in("id", paperIds);

    if (delError) {
      console.error(`Failed to delete NEET papers: ${delError.message}`);
      process.exit(1);
    }
    console.log(`✅ Deleted ${neetPapers.length} NEET paper(s) and all related data.`);
  }
}

// ────────────────────────────────────────────────────────
// 2. Remove NEET images from storage (neet-* prefixes)
// ────────────────────────────────────────────────────────
console.log("\nScanning storage bucket for NEET images…");

// List top-level folders/files in the bucket
const { data: topLevel, error: listTopError } = await supabase.storage
  .from(BUCKET)
  .list("", { limit: 1000 });

if (listTopError) {
  console.error(`Failed to list bucket: ${listTopError.message}`);
  process.exit(1);
}

// Find all neet-* prefixed folders
const neetFolders = (topLevel ?? []).filter(
  (item) => item.name.startsWith("neet-") || item.name.startsWith("neet_")
);

if (neetFolders.length === 0) {
  console.log("No NEET image folders found in storage. Nothing to delete.");
} else {
  let totalDeleted = 0;

  for (const folder of neetFolders) {
    const prefix = folder.name;
    console.log(`  Listing files in "${prefix}/"…`);

    // List all files under this neet prefix
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 10000 });

    if (listError) {
      console.error(`  Failed to list "${prefix}": ${listError.message}`);
      continue;
    }

    if (!files || files.length === 0) {
      console.log(`  No files in "${prefix}/".`);
      continue;
    }

    const filePaths = files.map((f) => `${prefix}/${f.name}`);
    console.log(`  Found ${filePaths.length} file(s) in "${prefix}/".`);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would delete ${filePaths.length} file(s).`);
    } else {
      // Supabase storage.remove() accepts up to 1000 paths at a time
      const CHUNK = 1000;
      for (let i = 0; i < filePaths.length; i += CHUNK) {
        const batch = filePaths.slice(i, i + CHUNK);
        const { error: delError } = await supabase.storage
          .from(BUCKET)
          .remove(batch);

        if (delError) {
          console.error(`  Failed to delete batch: ${delError.message}`);
        } else {
          totalDeleted += batch.length;
        }
      }
    }
  }

  if (!DRY_RUN) {
    console.log(`✅ Deleted ${totalDeleted} NEET image(s) from storage.`);
  }
}

console.log("\n🎉 NEET cleanup complete. JEE data is untouched.");
