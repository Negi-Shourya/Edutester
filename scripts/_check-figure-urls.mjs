#!/usr/bin/env node
/**
 * Read-only: verify every NEET 2023 figure_url (questions + options)
 * resolves via HTTP HEAD. Reports broken URLs.
 * Run:  node scripts/_check-figure-urls.mjs
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

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: paper } = await sb.from("papers").select("id").eq("key", "neet-2023").single();
const { data: qs } = await sb.from("questions").select("id,number,figure_url").eq("paper_id", paper.id);
const { data: opts } = await sb
  .from("question_options")
  .select("question_id,position,figure_url")
  .in("question_id", qs.map((q) => q.id));

const urls = new Set();
for (const q of qs) for (const u of q.figure_url ?? []) urls.add(u);
for (const o of opts) if (o.figure_url) urls.add(o.figure_url);

let ok = 0;
const broken = [];
const CHUNK = 12;
const list = [...urls];
for (let i = 0; i < list.length; i += CHUNK) {
  await Promise.all(
    list.slice(i, i + CHUNK).map(async (u) => {
      try {
        const r = await fetch(u, { method: "HEAD" });
        if (r.ok) ok++;
        else broken.push(`${r.status} ${u.split("/").pop()}`);
      } catch (e) {
        broken.push(`ERR ${u.split("/").pop()}`);
      }
    })
  );
}

console.log(`Checked ${urls.size} unique figure URLs: ${ok} OK, ${broken.length} broken`);
for (const b of broken) console.log("  BROKEN: " + b);
process.exit(0);
