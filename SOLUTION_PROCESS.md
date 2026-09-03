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

Format rules (enforced by `check-solutions.mjs`):

- Steps separated by `\n`; KaTeX markup (`\frac{}{}`, `_{}`, `^{}`, `\times`,
  `\rightarrow`) for math; plain text otherwise.
- No HTML tags, balanced `{}` braces.
- **Last line ends with the answer in parentheses**, e.g. `→ (C)`. Dual-award
  keys (`"A,B"`) end `(A, B)` — the validator accepts this form.
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

### 6. Validate → seed → verify

```bash
node scripts/check-solutions.mjs <paper>   # letters, braces, no HTML
node scripts/apply-key-corrections.mjs 62,66,69   # correct_answer ONLY
node scripts/seed-solutions.mjs <paper>    # solution column ONLY
```

The seed script ends with a DB count check (`DONE: n/180`). Re-run the
validator after any key change.

### 7. Spot-check gate

Nothing is "done" until the user spot-checks the batch. Keep batches small
enough to review (one subject block at a time is ideal).

## Revert procedure

If keys must ever go back: for each `key-corrected` log entry, set
`correct_answer` back to `entry.key`. The log preserves every original.

## File inventory (per paper)

| File | Committed? | Purpose |
|---|---|---|
| `scripts/work-<paper>.json` | No (regenerable) | Working dump |
| `scripts/solutions-<paper>.json` | Yes | Solution texts, source of truth |
| `scripts/key-disputes-<paper>.json` | Yes | Key audit log |
| `neet/*.pdf` | Case-by-case | Source papers + key tables |

## Shared tooling

- `scripts/check-solutions.mjs <paper>` — validator
- `scripts/seed-solutions.mjs <paper>` — solution seeder
- `scripts/apply-key-corrections.mjs [n,...]` — key fixer (correct_answer only)
- `scripts/_pdftext.mjs "<file>" [from] [to]` — PDF text dump

## 2018 scorecard (reference)

- 180 questions, 8 with stem figures. PDF key table provisional with ~40 errors.
- Keys corrected: 46+ (see log). Solutions shipped with full triple-check.
- Known traps: Q13/Q14 numbering swapped vs PDF; Q8/Q22/Q23/Q43 option orders
  differ between sources (compare values, not letters); Q65 dual-correct.
