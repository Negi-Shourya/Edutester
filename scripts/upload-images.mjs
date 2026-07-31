#!/usr/bin/env node
/**
 * Uploads extracted question images to Supabase Storage.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (or env var). Run:
 *   node scripts/upload-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

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

const supabase = createClient(url, key, { auth: { persistSession: false } });
const ROOT = new URL("../question_images/", import.meta.url).pathname;
const BUCKET = "question-images";

const folders = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let uploaded = 0;
let failed = 0;

for (const folder of folders) {
  const dir = join(ROOT, folder);
  const files = readdirSync(dir).filter((f) => !f.startsWith(".")).sort();
  for (const file of files) {
    const data = readFileSync(join(dir, file));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${folder}/${file}`, data, {
        upsert: true,
        contentType: file.endsWith(".png") ? "image/png" : "image/jpeg",
      });
    if (error) {
      console.error(`FAIL ${folder}/${file}: ${error.message}`);
      failed++;
    } else {
      uploaded++;
    }
  }
}

console.log(`Uploaded ${uploaded} files to ${BUCKET} (${failed} failed)`);
if (failed === 0) {
  console.log(
    `Sample URL: ${url}/storage/v1/object/public/${BUCKET}/${folders[0]}/${
      basename(readdirSync(join(ROOT, folders[0])).filter((f) => !f.startsWith("."))[0])
    }`
  );
}
