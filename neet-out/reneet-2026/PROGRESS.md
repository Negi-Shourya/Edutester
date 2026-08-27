# Re-NEET (UG) 2026 — Paper Addition Progress

**Last updated:** 2026-08-26
**Work folder:** `neet-out/reneet-2026/`
**Status:** ✅ **complete and live on localhost.** All 180 questions transcribed, seeded as
**paper id 59** (`key = reneet-2026`), and published to `public/papers/reneet-2026.json`.
Not yet deployed to production — see section 8.

---

## 1. What the user asked for

- Add the Re-NEET (UG) 2026 paper to the Edutester site, "the way we did with our previous papers".
- **Do NOT add the full solutions** to the website — questions, options and answer key only.
- Use KaTeX for difficult symbols and for match-the-following questions, following the pattern
  already used by the earlier papers.
- The answer key is trusted as supplied. Do **not** cross-check it against official NEET materials.
- Don't get confused by the regular NEET 2026 materials — this is the *re*-exam.
- The PDF has a PW watermark (a background element). Extract images anyway and **check every
  extracted image by eye** rather than trusting MuPDF.
- Time budget: under ~3 hours.
- Stopping condition: don't stop until Re-NEET 2026 is visible on localhost. ✅ met.

## 2. Source files

| File | What it is |
|---|---|
| `neet/reneet 2026.pdf` | The question paper. 22 pages, PDF 1.7, creator `pdf-lib`. |
| `neet/Reneet 2026 answer key.pdf` | NTA provisional answer key, 4 pages (booklet codes 50/60/70/80). |

### Question paper facts (from the cover, page 0)

- Title on every page header: `Re-NEET (UG)-2026 [Code – 50]` / `ENGLISH`
- Test Booklet Code **50**, `|| DATE: 21-06-2026 ||`
- 180 MCQs, **3 hours 15 minutes** (195 min), +4 / −1, maximum marks 720
- **Every page is a single full-page JPEG** (878×1356 pt, ~100 DPI) with **zero extractable text**.
  There is no text layer at all, so the paper had to be transcribed visually, page by page.
- Pages 1–21 hold Q1–Q180. There are **no solutions and no answer key inside this PDF**.
- The PW watermark is a large faint grey logo burned into each scan (not a separate layer).

### Answer key

- Our paper is **Code 50** → **page 1** of the key PDF (the other three pages are codes 60/70/80 and
  must be ignored).
- Parsed cleanly: **180/180 entries**, no gaps. Saved to `neet-out/reneet-2026/answer-key-code50.json`.
- Two special entries:
  - **Q26 = `Drop`** → stored as `answers: []` (precedent: NEET 2022 Q16/Q83/Q114, NEET 2023 Q6).
  - **Q38 = `2, 3`** → stored as `answers: ["2","3"]` → seeder joins to `B,C`
    (precedent: NEET 2024 Q23 = `1+3`).
- Taken as supplied, per the user's instruction. **Not** cross-checked against NTA sources.

## 3. Earlier finding — the first PDF was a mislabelled duplicate

The originally supplied `neet/Neet 2026.pdf` (since deleted) was **not** a 2026 paper. It was
**NEET (UG) 2025 Code 45, DATE 04-05-2025** — content-identical to the already-seeded paper id 38:
180/180 question stems matched and 180/180 answer keys matched, including Q63's genuine dual answer
`(1,2)` → `A,B`. It was not seeded, which avoided creating a duplicate paper. The user then supplied
`reneet 2026.pdf` as the real target.

## 4. Pre-existing defects found in other papers (found, NOT fixed — out of scope)

Recorded here so they aren't lost:

1. **NEET 2025 Q41 fractions collapsed.** The stacked two-column fractions were flattened, leaving
   `\frac{43}{34}` glued to the stem, options A/C/D empty and option B holding a bogus
   `\frac{23}{32}`. True options are 4/3, 3/4, 2/3, 3/2; the stored answer B should read 3/4.
2. **Match-the-following not using the pipe-table pattern.** 0 of 17 match questions in `neet-2025`
   use it (for comparison: 2020 = 16/16, 2021 = 19/20, 2024 = 0/34).
3. **`NtaHeader.tsx:142` hardcodes `B.E./B.Tech. (Paper 1)`** in the candidate-info strip. That is a
   JEE label and it shows on *every* NEET paper, `neet-2025` included — so it is pre-existing and
   site-wide, not something this paper introduced. Left alone deliberately; changing the shared
   header is a product decision.

The user answered "[No preference]" on fixing NEET 2024's match tables, so 2024 is out of scope.

## 5. Conventions this paper follows

Verified by reading the code and grepping the existing papers.

### Output schema (`neet-out/<key>/questions.json`, matching `neet-out/2020/questions.json`)

```
{ key, title, fullTitle, examDate, durationMinutes, questionCount, questions: [...] }
```

Each question:

```
{ section, number, bookletNumber, text, options: [{label, text, figure?}],
  answers: [], solution, page, images: [] }
```

Metadata actually used:

| Field | Value |
|---|---|
| `key` | `reneet-2026` |
| `title` | `Re-NEET 2026` |
| `fullTitle` | `Re-NEET (UG) 2026` |
| `examDate` | `2026-06-21` |
| `durationMinutes` | `195` |
| `questionCount` | `180` |
| `exam_type` | `neet` |
| `is_trial` | `false` — locked. NEET 2025 stays the one free NEET paper. |

### Math markup — `src/lib/mathText.ts` (rendered by KaTeX via `src/components/VectorText.tsx`)

- **No `$…$` delimiters.** Math tokens are auto-detected: `\command`, `{group}`, `_{…}`, `^{…}`,
  and unicode sub/superscripts.
- `UNICODE_MATH` maps greek letters, `×`, `→`, `±` etc. to LaTeX, so `×` and `°` can be typed directly.
- `convertFractions()` rewrites `a/b` → `\frac{a}{b}`, but deliberately keeps the slash for
  `w/w`, `v/v`, `t₁/₂`, word-vs-nonword mixes, both-operands-chemical, and anything followed by `→`.
  Slashes **inside `{}` are left alone**, so `mol^{-3/2}` stays literal — which is what we want.
- Established spellings found in the existing papers (copy these):
  - Standard electrode potential: literal `E°`, and couples written with spaces: `Fe^{3+} / Fe`.
  - Reaction arrows with a label above: `\xrightarrow{k}`.
  - Statement questions normalise the hyphen away to **`Statement I:` / `Statement II:`** so
    `StatementQuestionRenderer` picks them up. Assertion-Reason keeps `Assertion A:` / `Reason R:`.
- ⚠️ **`\left(` / `\right)` cannot be used bare** in this markup. The tokenizer needs a brace group,
  so they must be written as `\tan^{-1}{\left(\frac{1}{5}\right)}` — the `{…}` wrapper is what makes
  the run get recognised as math at all. (An earlier draft of this file claimed they were fine bare;
  they are not.) Relatedly, `FUNC_NAMES` does not substitute `tan` when it is followed by `^`, so
  inverse trig has to be spelled `\tan`, not `tan`.

### Match-the-following / data tables — `src/components/FormattedQuestionText.tsx`

Markdown pipe table, label folded **into** the cell:

```
Match the following and identify the correct option.
| List-I | List-II |
|---|---|
| (a) CO(g) + H_{2}(g) | (i) Mg(HCO_{3})_{2} + Ca(HCO_{3})_{2} |
```

Parser behaviour worth knowing:

- Any two-column pipe table triggers the NTA table renderer, whatever the columns are called.
- A line starting with `match` becomes the bold title; `choose the correct…` / `choose the
  option…` / `options:` become the italic footer. Any other unmatched line becomes the title if it
  appears **before** the rows and joins the footer if it appears **after** them.
- Only two columns are supported — a four-column source table must be folded into two.

### Two parser fixes made for this paper (both done, both verified in-browser)

1. **Header row over-matching** — `ROW_LABEL_RE` only recognises `A–D` / `I–V` labels, so **every**
   leading row whose left cell wasn't such a label was swallowed as "the header", overwriting the
   previous one. Q43 (rows labelled `(P) (Q) (R) (S)`) lost its `(P)` row and Q52 (rows keyed by
   salt name — `AgBr`, `Zn(OH)_2`, `Hg_2Cl_2`) lost **all three** rows and fell back to raw pipe
   text. Fixed with a `headerSeen` flag so only the *first* markdown row can be a header
   (`FormattedQuestionText.tsx:87`). Traced against every existing paper: `| List-I | List-II |`,
   `| Name | IUPAC Official Name |` and header-less tables starting `| (a) … | (i) … |` all keep
   their previous behaviour. Confirmed on screen: Q43 keeps `(P)`–`(S)`, Q52 keeps all three rows.
2. **Table headers weren't going through KaTeX** — they were rendered as plain text, so Q52's
   column head `K_{sp} at 298 K` showed as literal markup. Both `<th>` cells now render through
   `<VectorText>` (`FormattedQuestionText.tsx:178-183`). Safe for existing papers: a scan of every
   `public/papers/*.json` found no other paper with math markup in a table's first row, and the
   tokenizer leaves math-free text (`List - I`, `Name`) untouched.

### One routing fix made for this paper

`examOfPaperKey()` in `src/lib/exam.ts` used a `startsWith('neet')` prefix test, so `reneet-2026`
fell through to `'jee'` and the paper rendered under the "JEE (Main) Computer Based Test (CBT)"
banner. Now `paperKey.includes('neet')`. Callers: `src/pages/TestInterface.tsx:693`,
`src/pages/Dashboard.tsx:125,129,135`.

### Seeder — `scripts/seed-reneet-2026.mjs` (modelled on `scripts/seed-neet-2020.mjs`)

- Credentials come from `.env`, falling back to a **dotless `env`** file
  (`VITE_SUPABASE_URL` / `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Never print or commit these.
  Both filenames are in `.gitignore`.
- Tables: `papers`, `sections`, `questions`, `question_options`, `question_keys`
  (**not** `answer_keys` — that guess cost time earlier).
- `question_keys.correct_answer` stores comma-joined **letters**; `LABEL_TO_LETTER = {1:A,2:B,3:C,4:D}`.
- Images upload to the `question-images` bucket under a per-paper folder; option figures live on the
  option row's `figure_url`, question figures on `questions.figure_url` (an array).
- `solution` is written as **`null` unconditionally**, not copied from the JSON — the user does not
  want solutions on the site, so there is nothing to leak even if the JSON later grows the field.
- Two deliberate differences from the 2020 seeder: no "every question must have a key" hard-fail
  (Q26 is a legitimate drop), and it *reports* the empty and multi-answer keys instead
  (`Dropped questions (empty key): 26` / `Multi-answer questions: 38`).
- Re-runnable with `--force`, which deletes the existing paper row first and prunes stale storage
  objects.
- **After seeding, `scripts/build-paper-json.mjs` must be re-run** or `public/papers/*.json` keeps
  serving stale questions. That script reads with the **anon** key on purpose so answer keys can
  never end up in the published JSON, and has an `assertNoAnswerData` name-based backstop.

### Environment gotcha

Windows console is cp1252 and throws `UnicodeEncodeError` on private-use glyphs. Prefix every Python
invocation with `PYTHONIOENCODING=utf-8` and write to UTF-8 files rather than stdout.

## 6. Transcription — complete

Per-page transcriptions live in `neet-out/reneet-2026/pages/pNN.json`, one file per PDF page.

| PDF page | Questions | Section | Figures |
|---|---|---|---|
| 1 | Q1–Q8 (8) | Physics | `q3_fig1`; Q8 → `q8_opt1..4` |
| 2 | Q9–Q13 (5) | Physics | `q9_fig1`, `q10_fig1`, `q11_fig1`; Q12 → `q12_opt1..4` |
| 3 | Q14–Q21 (8) | Physics | `q16_fig1`, `q21_fig1` |
| 4 | Q22–Q26 (5) | Physics | `q22_fig1`, `q23_fig1`; Q23 → `q23_opt1..4` |
| 5 | Q27–Q32 (6) | Physics | `q27_fig1`, `q29_fig1`, `q31_fig1`; Q32 → `q32_opt1..4` |
| 6 | Q33–Q38 (6) | Physics | `q33_fig1`, `q36_fig1`; Q35 → `q35_opt1..4` |
| 7 | Q39–Q45 (7) | Physics | `q39_fig1`, `q42_fig1`, `q44_fig1` |
| 8 | Q46–Q56 (11) | Chemistry | `q46_fig1`, `q48_fig1` |
| 9 | Q57–Q66 (10) | Chemistry | `q64_fig1` |
| 10 | Q67–Q74 (8) | Chemistry | `q69_fig1`, `q72_fig1`; Q72 → `q72_opt1..4` |
| 11 | Q75–Q81 (7) | Chemistry | `q76_fig1`, `q76_fig2`, `q77_fig1`, `q79_fig1` |
| 12 | Q82–Q90 (9) | Chemistry | `q82_fig1`; Q82 → `q82_opt1..4`; `q86_fig1`, `q88_fig1` |
| 13 | Q91–Q104 (14) | Biology | — |
| 14 | Q105–Q113 (9) | Biology | — |
| 15 | Q114–Q123 (10) | Biology | — |
| 16 | Q124–Q135 (12) | Biology | — |
| 17 | Q136–Q147 (12) | Biology | — |
| 18 | Q148–Q158 (11) | Biology | — |
| 19 | Q159–Q168 (10) | Biology | — |
| 20 | Q169–Q176 (8) | Biology | — |
| 21 | Q177–Q180 (4) | Biology | — |

**Section boundaries — all confirmed against the scans.** Physics Q1–Q45, Chemistry Q46–Q90,
Biology Q91–Q180 (45 / 45 / 90). Biology carries **no figures at all**; all 56 figures are in
Physics and Chemistry.

### Transcription notes worth keeping

- **Q19 contains a typo that is in the source PDF**, not a transcription slip:
  "mass of electron `\frac{1}{4\pi\epsilon_{0}} = 9×10^{-31} kg`". Verified with a 700-DPI crop.
  Transcribed faithfully. Its options 3 and 4 really are bare integers `225` / `275` — checked
  against the page-3 right-column crop after they looked like collapsed fractions. They are not.
- **Q8's four option figures each hold two graphs.** That is correct, not a cropping error: the
  question asks about photocurrent *I* **and** stopping potential |V|, so each option shows both.
- **Q43** is a four-column spectrum/applications table folded into two columns with `(P)…(S)` and
  `(I)…(IV)` labels inside the cells.
- **Q52** is a Salt / K_sp data table rendered through the same pipe-table path.
- **Q163 and Q176 are the same question**, word for word — the same Assertion-Reason item about
  lysozyme and cellulase, same four options, and the key gives option 1 for both. This is a genuine
  duplicate in the source booklet, transcribed faithfully rather than "fixed".

### Figure extraction — 56/56, all eyeballed

MuPDF can't help here (each page is one flat JPEG), so figures were cropped by hand with two
throwaway helpers in `.tmp2026/`:

- **`grid.py`** renders a page at native resolution with a labelled pixel grid overlaid, so a crop
  box can be read straight off the image. Column bands:
  `COLS = {"L":(80,1225), "R":(1235,2380), "A":(0,2439)}`.
- **`fig.py`** takes the crop, whitens the PW watermark (`>=205 → 255`), auto-trims to the ink
  bounding box (`PAD=14`, `INK=175`, `MAX_W=1100`) and prints `ink bbox native:`.
  **Diagnostic worth remembering:** if the printed bbox equals an edge you requested, the ink is
  touching that edge and the crop box must be extended in that direction — otherwise the figure is
  silently clipped.

Every one of the 56 crops was opened and checked by eye before being accepted, per the user's
instruction.

## 7. Verification performed

| Check | Result |
|---|---|
| Seeder run | paper **id 59**, 180 questions, 720 options, 180 keys, 56 images uploaded, 0 failures |
| `scripts/build-paper-json.mjs reneet-2026` | `public/papers/reneet-2026.json` published |
| `scripts/_render-check-reneet-2026.mts` | 900 math fields, **0 KaTeX parse errors** |
| Live 180-question browser sweep | `katexError: []`, `rawMarkup: []`, `emptyStem: []`, 56/56 figures loaded (`broken: []`) |
| Figure URLs | 56/56 return HTTP 200 from the `question-images` bucket |
| Answer keys vs `answer-key-code50.json` | 180 key rows, **0 mismatches**; Q26 empty; Q38 = `B,C` |
| Solutions | **0 non-null** in `questions.json` and 0 in `question_keys` — no solutions on the site ✔ |
| Table renderers | Q43 keeps `(P)`–`(S)`; Q52 keeps all three name-keyed rows; `K_{sp} at 298 K` renders as math |
| NTA banner | reads NEET, not JEE, after the `examOfPaperKey` fix |
| `npx tsc -b --noEmit` | exit 0 |
| `npm run lint` | no findings in either edited file (pre-existing errors in `scripts/_dump-pdf.mjs` and `scripts/patch-neet-2025-answers.mjs` are unrelated) |

**On localhost:** Re-NEET 2026 heads the NEET list on `/paper-tests`
("NEET (UG) 2026 / 21 Jun 2026 Sunday / 3h 15m / Re-NEET 2026 / Attempt") and opens at
`/test?paper=reneet-2026` with a 195-minute clock and PHYSICS 45 / CHEMISTRY 45 / BIOLOGY 90.

Two verification gotchas, in case this is repeated:

- The paper list lives at **`/paper-tests`**, not `/papers`, and it is behind `ProtectedRoute`.
- The first image sweep reported 51 "broken" figures; that was a false positive from a fixed 70 ms
  settle delay. Awaiting `img.onload` explicitly gave 56/56.
- A throwaway confirmed user + short subscription was used to get past the Google-only login (the
  pattern `scripts/route-test.mjs` already uses). **It has been deleted again**, along with its
  subscription row, the injected browser session and every scratch file that held a token.

## 8. Remaining work

Everything the user asked for is done. What is left is release, which was not requested:

1. **Deploy** — `public/papers/reneet-2026.json` and the two `src/` fixes are local only. Production
   still serves the old bundle and has no Re-NEET 2026 in its paper list until the Cloudflare
   Workers deploy runs. (The Supabase rows *are* live, since there is one project.)
2. **Commit** — the paper folder, `scripts/seed-reneet-2026.mjs`, `public/papers/reneet-2026.json`
   and the two `src/` edits are all still uncommitted. `.tmp2026/` is scratch and should not be
   committed; the two source PDFs under `neet/` are the user's call.
3. **Optional:** if Re-NEET 2026 should be the free NEET trial paper instead of NEET 2025, flip
   `is_trial` in the seeder and re-run with `--force`. Left as-is because it is a product decision.

Reminder: **no solutions on the site.**
