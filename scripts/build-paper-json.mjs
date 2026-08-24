#!/usr/bin/env node
/**
 * Publishes each paper's questions as a static JSON file under public/papers/.
 *
 * Starting a test used to require a nested papers → questions → question_options
 * join on every load, which measured ~530 ms of Supabase server time per test
 * start — the single most expensive thing the site does, and it happens in a
 * burst when a batch of students begin together. The content is immutable once
 * seeded, so it is published as a file the CDN can serve instead. The database
 * query stays in place as a fallback (see src/data/questions.ts), so a missing
 * or stale file costs latency, never a broken exam.
 *
 * SAFETY: this reads with the ANON key and the same select the browser uses, so
 * the output can only ever contain what an anonymous visitor could already
 * fetch. Answer keys live in `question_keys`, which is revoked from anon, and
 * so cannot end up in a published file even by mistake. Do not "upgrade" this
 * to the service-role key.
 *
 * Run:  node scripts/build-paper-json.mjs [paperKey ...]
 *       (no arguments = every paper in the database)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

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
// The same publishable key src/lib/supabase.ts hands the browser.
const anonKey =
  envFromFile("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  envFromFile("VITE_SUPABASE_ANON_KEY") ??
  envFromFile("SUPABASE_ANON_KEY");
if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

// Must stay character-for-character identical to `questionSelect` in
// src/data/questions.ts, or the static file and the fallback diverge.
const questionSelect = `
  id, number, type, text, marks, negative_marks, position,
  sections ( name ),
  subsections ( name ),
  question_options ( position, label, text, figure_url ),
  figure_url
`;

const paperSelect = `id, key, title, full_title, exam_date, session, exam_type, is_trial, duration_minutes, questions(${questionSelect})`;

const outDir = fileURLToPath(new URL("../public/papers/", import.meta.url));

// Any column whose name hints at an answer must never reach a published file.
// This is a backstop for the anon-key guarantee above, not a substitute for it.
const FORBIDDEN_KEYS = /^(correct_answer|correctAnswer|solution|answer|answer_key|key_answer)$/i;

function assertNoAnswerData(node, path = "$") {
  if (Array.isArray(node)) {
    node.forEach((v, i) => assertNoAnswerData(v, `${path}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (FORBIDDEN_KEYS.test(k)) {
        throw new Error(`Refusing to publish: answer-like field "${k}" at ${path}`);
      }
      assertNoAnswerData(v, `${path}.${k}`);
    }
  }
}

async function listPaperKeys() {
  const { data, error } = await supabase.from("papers").select("key").order("id");
  if (error) throw new Error(`Failed to list papers: ${error.message}`);
  return (data ?? []).map((p) => p.key);
}

async function buildPaper(paperKey) {
  const { data, error } = await supabase
    .from("papers")
    .select(paperSelect)
    .eq("key", paperKey)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load paper "${paperKey}": ${error?.message ?? "not found"}`);
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error(`Refusing to publish "${paperKey}": it has no questions`);
  }

  assertNoAnswerData(data);

  // Compact, and with stable key order, so re-running produces a byte-identical
  // file when nothing changed and git shows no diff.
  const json = JSON.stringify(sortKeysDeep(data));
  writeFileSync(join(outDir, `${paperKey}.json`), json);

  return {
    key: paperKey,
    questions: data.questions.length,
    options: data.questions.reduce((n, q) => n + (q.question_options?.length ?? 0), 0),
    bytes: Buffer.byteLength(json),
    gzipped: gzipSync(json).length,
  };
}

// PostgREST does not promise a column order, and JSON.stringify follows
// insertion order, so keys are sorted to keep the output deterministic.
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

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const keys = requested.length > 0 ? requested : await listPaperKeys();
if (keys.length === 0) {
  console.error("No papers found.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const before = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith(".json")) : [];

const rows = [];
for (const key of keys) {
  rows.push(await buildPaper(key));
  process.stdout.write(".");
}
process.stdout.write("\n");

let totalBytes = 0;
let totalGzip = 0;
for (const r of rows) {
  totalBytes += r.bytes;
  totalGzip += r.gzipped;
  console.log(
    `  ${r.key.padEnd(24)} ${String(r.questions).padStart(4)} questions  ` +
      `${String(r.options).padStart(4)} options  ` +
      `${(r.bytes / 1024).toFixed(0).padStart(5)} KB  ` +
      `(${(r.gzipped / 1024).toFixed(0)} KB gzipped)`
  );
}
console.log(
  `\n${rows.length} paper(s) written to public/papers/ — ` +
    `${(totalBytes / 1024 / 1024).toFixed(2)} MB raw, ${(totalGzip / 1024 / 1024).toFixed(2)} MB gzipped`
);

// Files left behind by a paper that has since been renamed or removed would go
// on being served, so they are called out rather than silently kept.
if (requested.length === 0) {
  const expected = new Set(keys.map((k) => `${k}.json`));
  const orphans = before.filter((f) => !expected.has(f));
  if (orphans.length > 0) {
    console.log(`\nStale files (no matching paper in the database): ${orphans.join(", ")}`);
    console.log("Delete them if the papers are really gone.");
  }
}
