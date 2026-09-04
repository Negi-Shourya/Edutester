import fs from 'fs';

const start = parseInt(process.argv[2] || '31', 10);
const count = parseInt(process.argv[3] || '15', 10);
const rawArg = process.argv[4] || '2023';
const paperKey = rawArg.startsWith('neet-') || rawArg.startsWith('reneet-') ? rawArg : `neet-${rawArg}`;

const work = JSON.parse(fs.readFileSync(`scripts/work-${paperKey}.json`, 'utf8'));
const slice = work.slice(start - 1, start - 1 + count);

for (const q of slice) {
  console.log(`\n================ Q${q.number} (id: ${q.id}, DB key: ${q.key}) ================`);
  console.log(q.text);
  console.log('Options:');
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      console.log(`  (${opt.label}) ${opt.text}${opt.figure_url ? ' [Fig: ' + opt.figure_url + ']' : ''}`);
    }
  }
  if (q.figure_url && q.figure_url.length > 0) {
    console.log(`  [Figures: ${q.figure_url.join(', ')}]`);
  }
}
