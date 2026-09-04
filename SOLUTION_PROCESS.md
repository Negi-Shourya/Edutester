# NEET Solutions Process (established on NEET 2018)

How step-by-step solutions are produced, verified, and shipped for each paper.
Follow it exactly for every remaining NEET paper (2016, 2017, 2019–2026).

## Goal

Every question gets a step-by-step solution (skipping trivial steps), shown
post-submit in the Explanation block of `NtaResultScreen`. Solutions live in
`question_keys.solution` and render through `VectorText` (KaTeX-aware).

## Iron guardrails

1. **NEVER touch the `questions` table.** No stems, options, figures, ordering.
2. Only two columns are ever written, both in `question_keys`:
   - `solution` (the explanation text)
   - `correct_answer` (single letters, and ONLY via the key-correction policy)
3. Every solution's final letter must equal the DB key — enforced by the
   validator, no exceptions.

## Per-paper workflow

### 1. Pull the work file

Dump questions + options + keys into `scripts/work-<paper>.json`:

```js
// { id, number, section, text, options[{label,text}], key, hasSolution, hasFigure }
```

Source: `papers` → `questions` (+`question_options`, `sections`) joined with
`question_keys` by `question_id`, ordered by `number`.

### 2. Solve in batches (~15 questions)

- Physics/Chemistry numericals: derive fully, compute to the exact option value.
- Figure questions (`hasFigure`): download `figure_url` images and VIEW them
  before solving. Option-only figures live on `question_options.figure_url`.
- Biology: factual recall; still verify against the key.

### 3. Triple-check every answer (the 2018 lesson)

For each question, three sources must agree:

1. **Your derivation** → a value/statement.
2. **DB option text** → which letter holds that value (match TEXT, not position).
3. **Independent key** → the PDF key table in `neet/`, or a coaching key
   (Aakash/Vedantu Code-AA PDFs), or published solutions.

Causes of mismatch seen in 2018 and how to resolve them:

| Symptom | Likely cause | Resolution |
|---|---|---|
| Key letter points at wrong option text | Bad/provisional key table | Physics decides; correct the key; log it |
| PDF table disagrees with derivation AND coaching keys | Provisional-key error (the 20/05/18 table had ~40) | Physics + coaching consensus wins |
| Two sources disagree on ambiguous wording (Q2 harmonics, Q50 HOF, Q65 dual-correct) | Genuine ambiguity | Pick the most defensible, note it in the log |
| Option orders differ between sources (Q22/Q23, Q43) | Booklet/order permutation | Compare VALUES, never bare letters |

### 4. Write solutions

Append to `scripts/solutions-<paper>.json` as `{ "<question_id>": "<text>" }`.

Format rules (enforced by `clean-neet-solutions.mjs` + `check-solutions.mjs`):

- Steps separated by real `\n` newlines — **one idea per line**, never a wall
  of text. The result screen renders each `\n`-separated line as its own
  plain paragraph with spacing (`SolutionSteps` in `NtaResultScreen.tsx`).
  There are NO number badges and NO author numbering in the display — what
  you put on one line is what the student reads as one paragraph.
- **No author numbering or bullets, ever** (explicit user instruction):
  no `Step 1:`, `1.`, `1)`, `1).`, `(1)`, `1:`, `•`, `- `, `**bold**` at line
  starts. The renderer strips these defensively, but files must be clean at
  source — always run the cleaner before check/seed.
- **Raw TeX only — no `$`/`$$` delimiters** (explicit user instruction).
  `$…$` was the cause of the visible dollar signs + KaTeX failures across
  NEET 2022–2026: the renderer works on raw TeX, so dollars leak as text
  and chop formulas into invalid fragments (`\frac` alone, `\left` alone).
- Real newlines, never literal `\n` (backslash + n). A literal `\n` before
  a word is tokenized as a TeX command and renders as a red KaTeX error.
  (Genuine commands are preserved: `\neq \ne \nabla \ni \notin \nexists \nu`.)
- Ion/electron charges braced: `\text{Cl}^{-}`, `e^{-}` — never `^-`.
  A dangling `^-` breaks the X/Y → `\frac` pass and the fraction operand.
- `S_N1` / `S_N2`, never `\text{S}_\text{N}1` (invalid KaTeX).
- No `\char"XXXX` escapes for glyphs KaTeX has no font for (⚥ rendered
  blank) — name them in words instead, e.g. `\text{(bisexual)}`.
- Physics/Chemistry numericals: one step each for principle → substitution →
  computation → final value + answer (typically 3–5 lines).
- Biology/factual: 1–3 lines max; if the explanation runs longer than ~2
  clauses, split it with `\n` instead of one long sentence.
- KaTeX markup (`\frac{}{}`, `_{}`, `^{}`, `\times`,
  `\rightarrow`) for math; plain text otherwise.
- No HTML tags, balanced `{}` braces.
- **Last line ends with the answer in parentheses**, e.g. `→ (C)`. Dual-award
  keys (`"A,B"`) end `(A, B)` — the validator accepts this form. The last
  line renders highlighted green as the answer step.
- Step-by-step but skip trivial algebra; name the principle first.

### 4b. Second-source rule (mandatory since 2019)

Never trust a single key column. For each paper, find an independent answer
source (`neet/*.pdf` key tables, embedded `Ans.` in solved-paper PDFs,
Aakash/Vedantu code-wise keys) and compare VALUES, never bare letters:
option orders differ between booklets (seen: Q22/Q23/Q43/Q64/Q133 in 2018,
Q47/Q48 in 2019). Extract the source's option text at its answer number and
match it to the DB option text before concluding anything.

### 5. Log every key correction

`scripts/key-disputes-<paper>.json`, one entry per change:

```json
{ "id": 22084, "number": 5, "key": "C", "mine": "B",
  "status": "key-corrected", "correctedTo": "B",
  "reason": "47 kΩ = Yellow-Violet-Orange-Silver; key read 74 kΩ" }
```

- `key` = the ORIGINAL letter (this makes every change one-command revertible).
- `reason` = the derivation in one line + source if internet-verified.
- The log is internal audit trail; students never see it.

### 6. Validate → clean → seed → verify

```bash
node scripts/clean-neet-solutions.mjs <paper>  # normalize + self-verify (idempotent)
node scripts/check-solutions.mjs <paper>   # letters, braces, no HTML
node scripts/apply-key-corrections.mjs 62,66,69   # correct_answer ONLY
node scripts/seed-solutions.mjs <paper>    # solution column ONLY
```

The cleaner rewrites `scripts/solutions-<paper>.json` in place (only when
something changed) and refuses to write while anything suspicious remains
(leftover `$`/`**`/literal `\n`/`Step N:`, unbalanced braces, last line not
naming the answer). The seed script ends with a DB count check
(`DONE: n/180`). Re-run the validator after any key change. The renderer
(`mathText.ts` + `SolutionSteps`) is hardened against all of §4 as
defense-in-depth, but files must be clean at source regardless.

### 7. Spot-check gate

Nothing is "done" until the user spot-checks the batch. Keep batches small
enough to review (one subject block at a time is ideal).

## Revert procedure

If keys must ever go back: for each `key-corrected` log entry, set
`correct_answer` back to `entry.key`. The log preserves every original.

## Standing user decisions (solutions — do not revisit without asking)

1. **Solution column ONLY.** `seed-solutions.mjs` writes
   `question_keys.solution` and nothing else; the `questions` table is NEVER
   touched (see guardrails).
2. **No numbering or badges in solutions.** No author-side `Step N:` / `1.` /
   bullets in the data files, and no number badges in the display — plain
   paragraphs + green final-answer highlight only.
3. **No `$` delimiters.** Raw TeX in solution files, always.
4. **neet-2026 seeded 180/180 on 2026-09-04** (prior solution-free hold lifted
   by the user on request). 2 keys corrected with second sources (Q57 C→B
   steam reforming, Q62 D→A dπ-pπ); log:
   `scripts/key-disputes-neet-2026.json`. Prior 30 drafts expanded to full
   paper in the same pass.

## File inventory (per paper)

| File | Committed? | Purpose |
|---|---|---|
| `scripts/work-<paper>.json` | No (regenerable) | Working dump |
| `scripts/solutions-<paper>.json` | Yes | Solution texts, source of truth |
| `scripts/key-disputes-<paper>.json` | Yes | Key audit log |
| `neet/*.pdf` | Case-by-case | Source papers + key tables |

## Shared tooling

- `scripts/clean-neet-solutions.mjs [papers...]` — normalizer + self-verifier
  (literal `\n` → real newlines, `$`/`$$` strip, numbering/bullet/`**`
  strip, ion-charge braces, `S_N`, `\char` fixes). Defaults to the six
  2022–2026 papers; skips missing files. Always run before check/seed.
- `scripts/check-solutions.mjs <paper>` — validator
- `scripts/seed-solutions.mjs <paper>` — solution seeder (solution column ONLY)
- `scripts/apply-key-corrections.mjs [n,...]` — key fixer (correct_answer only)
- `scripts/_pdftext.mjs "<file>" [from] [to]` — PDF text dump

## 2018 scorecard (reference)

- 180 questions, 8 with stem figures. PDF key table provisional with ~40 errors.
- Keys corrected: 46+ (see log). Solutions shipped with full triple-check.
- Known traps: Q13/Q14 numbering swapped vs PDF; Q8/Q22/Q23/Q43 option orders
  differ between sources (compare values, not letters); Q65 dual-correct.
