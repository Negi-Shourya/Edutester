# JEE Solutions Process

How step-by-step solutions are produced, verified, and shipped for each JEE Main paper.
Follow it exactly for every JEE paper.

## Goal

Every question gets a step-by-step solution (skipping trivial steps), shown
post-submit in the Explanation block of `NtaResultScreen`. Solutions live in
`question_keys.solution` and render through `VectorText` (KaTeX-aware).

## Iron guardrails

1. **NEVER touch the `questions` table.** No stems, options, figures, ordering.
2. Only two columns are ever written, both in `question_keys`:
   - `solution` (the explanation text)
   - `correct_answer` (single letters / numbers, and ONLY via the key-correction policy)
3. Every solution's final answer must equal the DB key — enforced by the
   validator, no exceptions.
4. **NEVER touch NEET content** (papers, questions, keys, images, storage,
   seed scripts for `neet-*`) — see `rules.md`.
5. **NEVER push to GitHub** until explicitly told to — see `rules.md`.

## Per-paper workflow

### 1. Pull the work file

Dump questions + options + keys from Supabase (`papers` → `questions`
+`question_options`, `sections`) joined with `question_keys` by `question_id`,
ordered by `position`. Keep as a temp dump (e.g. `full02.txt`) for solving.

### 2. Solve in batches (~25 questions: Math / Physics / Chemistry)

- Physics/Chemistry numericals: derive fully, compute to the exact option value.
- Figure questions (`figure_url` on question or option): VIEW the image
  before solving. Option-only figures live on `question_options.figure_url`.
- Cross-check each derivation against the DB option TEXT (not position).

### 3. Triple-check every answer

For each question, three sources must agree:

1. **Your derivation** → a value/statement.
2. **DB option text** → which letter holds that value (match TEXT, not position).
3. **Independent key** → NTA official key / candidate response sheet / coaching
   keys (Allen / Vedantu / Matrix / PW) / published solutions.

If derivation disagrees with the DB key: web-search the question, compare
VALUES never bare letters (option orders differ between sources). If still
convinced the key is wrong, flag it in `scripts/key-disputes-<paper>.json`
and keep the solution's last line matching the CURRENT DB key until the
correction is approved and applied via `apply-key-corrections.mjs`.

### 4. Write solutions

Append to `scripts/solutions-<paper>.json` as `{ "<question_id>": "<text>" }`.

Format rules (enforced by `clean-neet-solutions.mjs` + `check-solutions.mjs`
+ the KaTeX render check):

- Steps separated by real `\n` newlines — **one idea per line**, never a wall
  of text. The result screen renders each `\n`-separated line as its own
  plain paragraph with spacing (`SolutionSteps` in `NtaResultScreen.tsx`).
- **Flexible length:** use as many or as few lines as the question needs
  (typically 2–6). Not restricted to 3 lines — factual recall may take 2,
  long derivations may take 6+. One idea per line still applies.
- **Mathematics runs bigger** (explicit user instruction): full derivations,
  5–9 lines — state the theorem/formula, set up, manipulate, substitute,
  compute, conclude. Physics/Chemistry stay at the flexible 2–6 scale.
- **No author numbering or bullets, ever** (explicit user instruction):
  no `Step 1:`, `1.`, `1)`, `1).`, `(1)`, `1:`, `•`, `- `, `**bold**` at line
  starts. The renderer strips these defensively, but files must be clean at
  source — always run the cleaner before check/seed.
- **Raw TeX only — no `$`/`$$` delimiters** (explicit user instruction).
  The renderer works on raw TeX; dollars leak as text and chop formulas
  into invalid fragments (`\frac` alone, `\left` alone).
- Real newlines, never literal `\n` (backslash + n). A literal `\n` before
  a word is tokenized as a TeX command and renders as a red KaTeX error.
  (Genuine `\n*` commands — `\neq \ne \nabla \ni \notin \nexists \nu`,
  plus negations like `\nmid \nleq` — are preserved by the cleaner. This was
  once broken: the lookahead matched full names after the `n` was already
  consumed, silently eating real commands. Fixed; regression-tested.)
- **Spaces around `+`, `-`, `=` in running math.** Without spaces the
  tokenizer merges scripts across operators (`t_1^2+t_2^2` renders as
  double-subscript garbage / wrong exponents). Always write
  `t_1^2 + t_2^2`, `k = t_1 + t_2`, never the unspaced form.
- Ion/electron charges braced: `\text{Cl}^{-}`, `e^{-}` — never `^-`.
- `S_N1` / `S_N2`, never `\text{S}_\text{N}1` (invalid KaTeX).
- No `\char"XXXX` escapes for glyphs KaTeX has no font for — name them in
  words instead, e.g. `\text{(bisexual)}`.
- KaTeX markup (`\frac{}{}`, `_{}`, `^{}`, `\times`, `\sqrt{}`,
  `\rightarrow`, `\vec{}`, `\hat{}`) for math; plain text otherwise.
- No HTML tags, balanced `{}` braces.
- **Last line ends with the answer in parentheses**, e.g. `→ (C)` for MCQ,
  `→ (120)` / `→ (-560)` for numericals (negative allowed). Dual-award keys
  (`"A,B"`) end `(A, B)`. The last line renders highlighted green.
- **No references/sources in the solution text** (explicit user instruction).
  Second sources are for verification only; students never see them.
- Step-by-step but skip trivial algebra; name the principle first.

### 5. Log every key correction

`scripts/key-disputes-<paper>.json`, one entry per change:

```json
{ "id": 22084, "number": 5, "key": "C", "mine": "B",
  "status": "key-corrected", "correctedTo": "B",
  "reason": "derivation in one line + source if internet-verified" }
```

- `key` = the ORIGINAL letter (this makes every change one-command revertible).
- `reason` = the derivation in one line + source if internet-verified.
- The log is internal audit trail; students never see it.

### 6. Validate → clean → seed → verify

```bash
node scripts/clean-neet-solutions.mjs <paper>  # normalize + self-verify (idempotent)
node scripts/check-solutions.mjs <paper>       # letters, braces, no HTML
node scripts/apply-key-corrections.mjs <paper> 62,66,69  # correct_answer ONLY (if disputes approved)
node scripts/seed-solutions.mjs <paper>        # solution column ONLY
```

The cleaner rewrites `scripts/solutions-<paper>.json` in place (only when
something changed) and refuses to write while anything suspicious remains.
The seed script ends with a DB count check (`DONE: n/75`). Re-run the
validator after any key change.

KaTeX gate (JEE papers): run the render check (template at
`scripts/_render-check-02apr-eve.mts` — copy per paper, point at the new
solutions file). Must report **0 KaTeX errors** before seeding.

DB gate: every solution multi-line, zero numbered lines, zero bad endings
(template at `scripts/_verify-02apr-eve.mjs`).

### 7. Spot-check gate

Nothing is "done" until the user spot-checks the batch. Keep batches small
enough to review (one subject block at a time is ideal).

## Revert procedure

If keys must ever go back: for each `key-corrected` log entry, set
`correct_answer` back to `entry.key`. The log preserves every original.

## File inventory (per paper)

| File | Committed? | Purpose |
|---|---|---|
| `scripts/solutions-<paper>.json` | Yes | Solution texts, source of truth |
| `scripts/key-disputes-<paper>.json` | Yes | Key audit log (only if disputes) |
| `scripts/_render-check-<paper>.mts` | Case-by-case | KaTeX verification harness |
| `scripts/_verify-<paper>.mjs` | Case-by-case | DB verification harness |

## Shared tooling

- `scripts/clean-neet-solutions.mjs <paper>` — normalizer + self-verifier
  (also used for JEE papers; accepts `02-apr-evening`-style keys; allows
  negative numerical answers since the 02-apr-evening pass).
- `scripts/check-solutions.mjs <paper>` — validator
- `scripts/seed-solutions.mjs <paper>` — solution seeder (solution column ONLY)
- `scripts/apply-key-corrections.mjs <paper> [n,...]` — key fixer (correct_answer only)
