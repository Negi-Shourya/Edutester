#!/usr/bin/env node
/**
 * Checks that every file in public/papers/ still matches what the database
 * returns for the same query.
 *
 * src/data/questions.ts prefers the published file and falls back to the
 * database, feeding both through the same mapping code. So the two paths are
 * interchangeable exactly as long as the raw rows agree — which is what this
 * verifies. Run it after re-seeding or patching a paper; a mismatch means
 * public/papers/ is stale and scripts/build-paper-json.mjs needs re-running.
 *
 * Reads with the anon key, the same as the browser and the build script.
 *
 * Run:  node scripts/verify-paper-json.mjs [paperKey ...]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  for (const name of ["../.env", "../env"]) {
    try {
      const line = readFileSync(new URL(name, import.meta.url), "utf8")
        .split("\n")
        .find((l) => l.trim().startsWith(`${key}=`));
      if (line) return line.slice(line.indexOf("=") + 1).trim();
    } catch {
      // next candidate
    }
  }
  return undefined;
}

const url = envFromFile("VITE_SUPABASE_URL") ?? envFromFile("SUPABASE_URL");
const anonKey =
  envFromFile("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  envFromFile("VITE_SUPABASE_ANON_KEY") ??
  envFromFile("SUPABASE_ANON_KEY");
if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const questionSelect = `
  id, number, type, text, marks, negative_marks, position,
  sections ( name ),
  subsections ( name ),
  question_options ( position, label, text, figure_url ),
  figure_url
`;
const paperSelect = `id, key, title, full_title, exam_date, session, exam_type, is_trial, duration_minutes, questions(${questionSelect})`;

const outDir = fileURLToPath(new URL("../public/papers/", import.meta.url));

function sortKeysDeep(node) {
  if (Array.isArray(node)) return node.map(sortKeysDeep);
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.keys(node)
        .sort()
        .map((k) => [k, sortKeysDeep(node[k])])
    );
  }
  return node;
}

// PostgREST does not guarantee row order within an embedded array, and the app
// sorts questions and options itself, so both sides are put in a canonical
// order before comparing. Otherwise this would report false mismatches.
function canonical(row) {
  const questions = [...(row.questions ?? [])]
    .map((q) => ({
      ...q,
      question_options: [...(q.question_options ?? [])].sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.id - b.id);
  return JSON.stringify(sortKeysDeep({ ...row, questions }));
}

// Reports the first differing path rather than dumping two 100 KB blobs.
function firstDifference(a, b, path = "$") {
  if (a === b) return null;
  if (typeof a !== typeof b || a === null || b === null) {
    return `${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${path}: length ${a.length} !== ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = firstDifference(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  if (typeof a === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const d = firstDifference(a[k], b[k], `${path}.${k}`);
      if (d) return d;
    }
    return null;
  }
  return `${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
}

if (!existsSync(outDir)) {
  console.error("public/papers/ does not exist — run scripts/build-paper-json.mjs first.");
  process.exit(1);
}

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const keys =
  requested.length > 0
    ? requested
    : readdirSync(outDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => basename(f, ".json"));

if (keys.length === 0) {
  console.error("No published papers found in public/papers/.");
  process.exit(1);
}

let failures = 0;

for (const key of keys) {
  const file = join(outDir, `${key}.json`);
  if (!existsSync(file)) {
    console.log(`FAIL ${key} — no published file`);
    failures++;
    continue;
  }

  const published = JSON.parse(readFileSync(file, "utf8"));
  const { data, error } = await supabase.from("papers").select(paperSelect).eq("key", key).single();

  if (error || !data) {
    console.log(`FAIL ${key} — database query failed: ${error?.message ?? "not found"}`);
    failures++;
    continue;
  }

  if (canonical(published) === canonical(data)) {
    console.log(
      `OK   ${key.padEnd(20)} ${String(published.questions.length).padStart(4)} questions match`
    );
  } else {
    const diff = firstDifference(
      JSON.parse(canonical(published)),
      JSON.parse(canonical(data))
    );
    console.log(`FAIL ${key} — first difference: ${diff}`);
    failures++;
  }
}

console.log(
  failures === 0
    ? `\nAll ${keys.length} published paper(s) match the database.`
    : `\n${failures} of ${keys.length} paper(s) do NOT match — re-run scripts/build-paper-json.mjs`
);
process.exitCode = failures === 0 ? 0 : 1;
