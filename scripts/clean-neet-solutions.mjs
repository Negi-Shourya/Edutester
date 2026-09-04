// Normalizes scripts/solutions-<paper>.json so seeded solutions render
// cleanly through VectorText + SolutionSteps:
//   1. literal "\n" (backslash + n, from double-escaped JSON — the whole of
//      NEET 2022, part of 2023) → real newline. Real TeX commands
//      (\neq \ne \nabla \ni \notin \nexists \nu) are preserved.
//   2. $…$ / $$…$$ delimiters → inner content (the renderer works on raw
//      TeX, not dollars); stray $ dropped. Special-case ($=\!=) → (=!=).
//   3. per-line author numbering/bullets ("Step 1:", "1.", "1)", "•", "-",
//      "*") and markdown **bold** → removed (the result screen numbers
//      steps itself with circles).
// Usage: node scripts/clean-neet-solutions.mjs [neet-2022 neet-2023 ...]
// Defaults to the six affected papers. Rewrites files in place (git
// tracks them, so `git checkout --` restores). Prints a verification
// report; exits 1 if anything suspicious remains.
// The solution column ONLY is ever seeded (see seed-solutions.mjs).
import { readFileSync, writeFileSync } from 'node:fs';

const DEFAULT_PAPERS = ['neet-2022', 'neet-2023', 'neet-2024', 'neet-2025', 'neet-2026', 'reneet-2026'];
const papers = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_PAPERS;

// Literal backslash-n → newline, unless a real TeX command (\neq \ne
// \nabla \ni \notin \nexists \nu — the \nu in "h\nu" stays, while the
// break in "\nununennium" converts since commands never continue +letter).
const LITERAL_N_RE = /\\n(?!(?:neq|ne|nabla|ni|notin|nexists|nu)(?![a-zA-Z]))/g;
const LITERAL_N_TEST = /\\n(?!(?:neq|ne|nabla|ni|notin|nexists|nu)(?![a-zA-Z]))/;

function cleanLine(line) {
  let s = line.trim().replace(/\*\*/g, '');
  // "- **Step 1:** …" nests markers: loop until stable (max 3 passes).
  // Number forms: "1.", "1)", "1).", "(1)", "(1).", "1:" — the decimal
  // guard keeps "0.1 → (C)" and "2.5 M" untouched.
  for (let i = 0; i < 3; i++) {
    const before = s;
    s = s.replace(/^Step\s*\d+\s*[:.)\]-]\s*/i, '');
    s = s.replace(/^(?!\d+\.\d)\(?\d{1,2}[.)][.)]?(?=\s|$)\s*/, '');
    s = s.replace(/^(?!\d+\.\d)\d{1,2}\s*:\s*/, '');
    s = s.replace(/^[•\-*]\s+/, '');
    s = s.trim();
    if (s === before) break;
  }
  return s;
}

function cleanSolution(raw) {
  let out = raw;
  // Pedigree symbol mangled with an escaped dollar (neet-2023 Q14545).
  out = out.replace(/\(\$=\!=\)/g, '(=!=)');
  // Dangling ion/electron charges: "}^{-}"/"}^{+}" instead of "}^-"/"}^+"
  // (the tokenizer merges "X^-" into "X^{-}" anyway, but the braced form
  // also survives the X/Y → \frac{X}{Y} pass as a whole operand).
  out = out
    .replace(/\}\^-/g, '}^{-}')
    .replace(/\}\^\+/g, '}^{+}' )
    .replace(/\be\^-/g, 'e^{-}')
    // Broken SN1/SN2 markup ("\text{S}_\text{N}1" → KaTeX error).
    .replace(/\\text\{S\}_\\text\{N\}/g, 'S_N')
    // \char"26A5 (bisexual floral symbol ⚥) has no KaTeX glyph → blank.
    // The sentence already says "bisexual", so name it in words.
    .replace(/\\text\{\\char"26A5\}/g, '\\text{(bisexual)}');
  out = out.replace(LITERAL_N_RE, '\n');
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, '$1');
  out = out.replace(/\$([^$\n]+?)\$/g, '$1');
  out = out.replace(/\$/g, '');
  out = out
    .split('\n')
    .map(cleanLine)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return out;
}

let failed = false;
for (const paper of papers) {
  const url = new URL(`./solutions-${paper}.json`, import.meta.url);
  let solutions;
  try {
    solutions = JSON.parse(readFileSync(url, 'utf8'));
  } catch {
    console.log(`=== ${paper}: no solutions-${paper}.json, skipping`);
    continue;
  }
  const stats = { n: 0, changed: 0, literalN: 0, dollars: 0, markers: 0 };
  for (const [qid, sol] of Object.entries(solutions)) {
    stats.n++;
    if (LITERAL_N_TEST.test(sol)) stats.literalN++;
    if (sol.includes('$')) stats.dollars++;
    if (/(^|\n)\s*(Step\s*\d+|\d+[.)]\s|[•\-*]\s)|\*\*/.test(sol)) stats.markers++;
    const cleaned = cleanSolution(sol);
    if (cleaned !== sol) {
      stats.changed++;
      solutions[qid] = cleaned;
    }
  }
  // Verify the result.
  const problems = [];
  for (const [qid, sol] of Object.entries(solutions)) {
    if (!sol || sol.trim().length < 10) problems.push(`Qid ${qid}: empty/too short`);
    if (sol.includes('$')) problems.push(`Qid ${qid}: leftover $`);
    if (sol.includes('**')) problems.push(`Qid ${qid}: leftover **`);
    if (LITERAL_N_TEST.test(sol)) problems.push(`Qid ${qid}: leftover literal \\n`);
    if (/(^|\n)\s*Step\s*\d+\s*[:.)\]-]/i.test(sol)) problems.push(`Qid ${qid}: leftover Step N`);
    if (/^[•]|\n[•]/m.test(sol)) problems.push(`Qid ${qid}: leftover •`);
    let depth = 0;
    for (const ch of sol) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth < 0) break;
    }
    if (depth !== 0) problems.push(`Qid ${qid}: unbalanced braces`);
    const lines = sol.trim().split('\n').filter((l) => l.trim());
    const last = lines[lines.length - 1];
    if (!/\([A-D]\)\s*$/.test(last) && !last.endsWith('(Bonus)')) {
      problems.push(`Qid ${qid}: last line must end with (A)/(B)/(C)/(D): ${last.slice(0, 60)}`);
    }
  }
  console.log(`=== ${paper}: ${stats.n} solutions, ${stats.changed} changed ` +
    `(literalN~${stats.literalN}, dollar~${stats.dollars}, markers~${stats.markers})`);
  if (problems.length > 0) {
    failed = true;
    for (const p of problems.slice(0, 15)) console.log(`  PROBLEM ${p}`);
    if (problems.length > 15) console.log(`  ... +${problems.length - 15} more`);
  } else if (stats.changed > 0) {
    writeFileSync(url, JSON.stringify(solutions, null, 2) + '\n');
    console.log(`  OK: wrote solutions-${paper}.json`);
  } else {
    console.log(`  OK: no changes needed`);
  }
}
process.exit(failed ? 1 : 0);
