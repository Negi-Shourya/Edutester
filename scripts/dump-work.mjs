// Dump questions + options + keys into scripts/work-<paper>.json
// Usage: node scripts/dump-work.mjs neet-2022
import { writeFileSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const lines = readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/);
    const line = lines.find((l) => l.startsWith(key + '='));
    return line ? line.slice(key.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const paperKey = process.argv[2] || 'neet-2022';
const sb = createClient(envFromFile('SUPABASE_URL'), envFromFile('SUPABASE_SERVICE_ROLE_KEY'));

const { data: paper, error: pErr } = await sb.from('papers').select('*').eq('key', paperKey).single();
if (pErr || !paper) {
  console.error('Paper not found:', paperKey, pErr?.message);
  process.exit(1);
}

const { data: qs, error: qErr } = await sb
  .from('questions')
  .select('id, number, text, figure_url, sections(name)')
  .eq('paper_id', paper.id)
  .order('number');

if (qErr || !qs) {
  console.error('Questions fetch error:', qErr?.message);
  process.exit(1);
}

const qids = qs.map((q) => q.id);

const { data: opts, error: oErr } = await sb
  .from('question_options')
  .select('question_id, label, text, figure_url, position')
  .in('question_id', qids)
  .order('position');

if (oErr) {
  console.error('Options fetch error:', oErr.message);
  process.exit(1);
}

const { data: keys, error: kErr } = await sb
  .from('question_keys')
  .select('question_id, correct_answer, solution')
  .in('question_id', qids);

if (kErr) {
  console.error('Keys fetch error:', kErr.message);
  process.exit(1);
}

const optsByQ = new Map();
for (const o of opts) {
  if (!optsByQ.has(o.question_id)) optsByQ.set(o.question_id, []);
  optsByQ.get(o.question_id).push(o);
}

const keyByQ = new Map();
for (const k of keys) {
  keyByQ.set(k.question_id, k);
}

const work = qs.map((q) => {
  const qOpts = optsByQ.get(q.id) || [];
  const k = keyByQ.get(q.id);
  const hasStemFig = Array.isArray(q.figure_url) ? q.figure_url.length > 0 : Boolean(q.figure_url);
  const hasOptFig = qOpts.some((o) => Boolean(o.figure_url));
  return {
    id: q.id,
    number: q.number,
    section: q.sections?.name || 'Unknown',
    text: q.text,
    figure_url: q.figure_url,
    options: qOpts.map((o) => ({
      label: o.label,
      text: o.text,
      figure_url: o.figure_url,
    })),
    key: k?.correct_answer || null,
    hasSolution: Boolean(k?.solution && k.solution.trim().length > 0),
    hasFigure: hasStemFig || hasOptFig,
  };
});

const outPath = new URL(`./work-${paperKey}.json`, import.meta.url);
writeFileSync(outPath, JSON.stringify(work, null, 1), 'utf8');
console.log(`Wrote ${work.length} questions to scripts/work-${paperKey}.json`);
console.log(`With figures: ${work.filter((w) => w.hasFigure).length}`);
console.log(`With existing solution: ${work.filter((w) => w.hasSolution).length}`);
