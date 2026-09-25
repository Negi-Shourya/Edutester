import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function envFromFile(key) {
  if (process.env[key]) return process.env[key];
  try {
    const lines = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/);
    const line = lines.find((l) => l.startsWith(key + '='));
    return line ? line.slice(key.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const supabase = createClient(envFromFile('SUPABASE_URL'), envFromFile('SUPABASE_SERVICE_ROLE_KEY'));

async function run() {
  const { data: papers, error: pErr } = await supabase.from('papers').select('id, key').order('key');
  if (pErr) throw pErr;

  console.log(`Found ${papers.length} papers in DB`);

  // We are specifically auditing JEE papers (both 2026 and 2025)
  const jeePapers = papers.filter(p => !p.key.startsWith('neet'));
  console.log(`Found ${jeePapers.length} JEE papers in DB`);

  let totalQuestions = 0;
  let singleLineCount = 0;
  let multiLineCount = 0;
  let missingCount = 0;

  for (const p of jeePapers) {
    const { data: qs, error: qErr } = await supabase
      .from('questions')
      .select('id')
      .eq('paper_id', p.id);
    if (qErr) throw qErr;

    const qids = qs.map(q => q.id);
    const { data: keys, error: kErr } = await supabase
      .from('question_keys')
      .select('question_id, solution')
      .in('question_id', qids);
    if (kErr) throw kErr;

    let pSingle = 0, pMulti = 0, pMissing = 0;
    for (const qk of keys) {
      if (!qk.solution || !qk.solution.trim()) {
        pMissing++;
      } else if (qk.solution.includes('\n')) {
        pMulti++;
      } else {
        pSingle++;
      }
    }
    totalQuestions += keys.length;
    singleLineCount += pSingle;
    multiLineCount += pMulti;
    missingCount += pMissing;

    if (pSingle > 0 || pMissing > 0) {
      console.log(`Paper ${p.key}: multi=${pMulti}, single=${pSingle}, missing=${pMissing}`);
    }
  }

  console.log('\n================ JEE AUDIT SUMMARY ================');
  console.log(`Total JEE papers checked: ${jeePapers.length}`);
  console.log(`Total questions checked : ${totalQuestions}`);
  console.log(`Multi-line solutions    : ${multiLineCount}`);
  console.log(`Single-line solutions   : ${singleLineCount}`);
  console.log(`Missing solutions       : ${missingCount}`);
  console.log('===================================================\n');

  // Verify chapter map
  const mapData = JSON.parse(fs.readFileSync('public/custom/jee-chapter-map.json', 'utf8'));
  const mapKeys = Object.keys(mapData);
  console.log(`Chapter map total entries: ${mapKeys.length}`);
}

run().catch(console.error);
