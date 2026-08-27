# Context

## Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide icons
- **Routing**: React Router v7

## Project Structure
```
src/
├── components/   # Reusable UI (Navbar, Footer, PricingCard, etc.)
├── pages/        # Route-level components
├── data/         # Mock data (pricing, chapters, papers)
├── types/        # TypeScript interfaces
├── App.tsx       # Route definitions
└── main.tsx      # Entry point with BrowserRouter
```

## Pricing
| Plan | Price | ₹/mo |
|------|-------|------|
| 1M   | ₹19  | 19   |
| 3M   | ₹50  | 16.7 |
| 6M   | ₹94  | 15.7 |
| 1Y   | ₹159 | 13.3 |

## NTA Interface
- Question palette: green (answered), red (not answered), purple (marked), gray (not visited)
- Controls: Save & Next, Mark for Review & Next, Clear Response
- 3-hour countdown timer with low-time warning
- 3 sections: Physics, Chemistry, Mathematics (JEE); NEET 2025 uses 4: Physics, Chemistry, Botany, Zoology

## JEE Main Section

### Data (Supabase)
- Papers 1–9 = JEE Main 2026 (keys `02-apr-morning` … `08-apr-evening`), 675 questions
  (75/paper: 60 MCQ + 15 numerical), seeded from `scripts/extract-questions.mjs` (src/data/papers
  TS modules no longer exist — consumed into Supabase)
- Auditor's note: all 675 questions verified clean — KaTeX/vector markup on every math-bearing
  stem/option, zero mojibake/HTML math, 75/75 keys+solutions per paper (see PROGRESS.md)

## NEET Section

### Data (Supabase)
- Paper rows: `key = 'neet-2025'` (NTA-style test interface, 200 questions),
  `'neet-2024'`, `'neet-2023'` (single Biology section), `'neet-2022'`,
  `'neet-2021'`, `'neet-2020'`, `'neet-2019'`
- Tables: `papers`, `questions`, `question_options`, `question_keys`, `question_images`
- Question text/options stored as text with LaTeX-style math markup (see Rendering)
- Figures stored in Supabase Storage, referenced by `figure_url` on questions/options
- Answer keys patched and verified against the official NEET answer keys — except
  NEET 2020, whose key comes from the Aakash booklet and is deliberately **not**
  cross-checked against the official key (explicit user instruction)
- Total content: 1935 questions across 16 papers (9 JEE Main 2026 × 75 = 675;
  NEET 2025, 2024, 2023, 2022, 2021, 2020, 2019 × 180 each = 1260). The older NEET
  papers were trimmed from 200 to 180 questions (5 Physics + 5 Chemistry + 10
  Biology per paper, mostly questions on the NMC rationalized-syllabus deleted
  topics) to match NEET 2025's layout — see
  `scripts/remove-neet-deleted-syllabus.mjs`

### Source & extraction pipeline (`scripts/`)
- Official PDF: `neet/2025 Neet.pdf` (watermarked, ~12 MB), `neet/2024 Neet.pdf`,
  `neet/2023 Neet.pdf` (Chapter & Topicwise booklet, 38 pages)
- Extract: `extract_neet_2025.py`, `extract-questions.mjs`, `extract_paper_images.py`,
  `reclip_diagrams.py` → figures; `seed-neet-2025.mjs` → seed DB
- 2023: `extract_neet_2023.py` (two-column booklet; booklet numbers 1-50 per domain
  remapped to 1-200: phy 1-50, chem 51-100, bio 101-200; answers pulled from the
  solution page ranges only — no solutions stored; physics Q8 was dropped by NTA,
  stored with an empty key so the scoring engine awards full marks), `seed-neet-2023.mjs`
- 2020: `neet/Ques&Ans_NEET2020.pdf` (Aakash "Questions & Answers" booklet, Test
  Booklet Code G3, 21 pages) → `extract_neet_2020.py` → `neet-out/2020/questions.json`
  + `neet-out/2020/images/` → `seed-neet-2020.mjs` (`--force` to re-seed).
  Single self-contained extractor — no patch scripts; re-run it and re-seed instead.
  - Watermark: the Aakash grey is painted in **two colour spaces** — DeviceRGB
    `0.901961 0.905882 0.909804 rg/RG` on pages 11-15 and DeviceCMYK
    `0 0 0 .102 k/K` on the rest. `clean_doc()` rewrites both to white in the
    content streams (120 operators) *before* any figure is clipped, and `scrub()`
    whitens residual pixels ≥212 in each rendered clip (form XObjects / soft masks)
  - Booklet order is Biology 1-90, Physics 91-135, Chemistry 136-180; `site_number()`
    remaps to the site's Physics 1-45, Chemistry 46-90, Biology 91-180. The seeder
    sorts by site number, which is what fixes the section order
  - Answers come from the booklet's own `Answer (n)` lines; no official-key check
  - Debug: `_dump2020.py <page0based> [ymin ymax] [--col=L|R] [--draw]` (char/drawing
    dump), `extract_neet_2020.py --debug <page…>` (rebuilt lines per column),
    `_render-check-2020.mts` (parses every stem/option through KaTeX — 900 fields)
- Fix/cleanup: `fix_neet_2025.py`, `cleanup_neet_2025(_v2).py`, `final_cleanup.py`,
  `fix_match_list_questions.py`, `fix-neet-2025-{match-questions,q46-q148,q90-q92,subscripts}.mjs`,
  `patch-neet-2025-{answers,images}.mjs`, `cleanup-neet-2025-uncurated-images.mjs`,
  `generate-figure-url-migration.mjs`, `upload-images.mjs`, `merge-neet-2024-biology-sections.mjs`
- Debug tools: `_dump-pdf.mjs`, `_dump_subs.py`, `_find-subs.mjs`, `_check-db.mjs`,
  `glyphdump.py`/`glyphx.py`/`recover*.py`/`render_regions*.py` (PDF vector drawing analysis)
- Figure assets: `neet/neet images/` (raw PDF screenshots), `question_images/neet-2025-images/`
  (curated, uploaded to Storage)
- NEET 2023 figures: **user-curated** set in `neet/Neet 2023 images/{Physics,Chemistry,Biology}/`
  (booklet-numbered per subject, e.g. `Question 29.png`, `Question 34 option a.png`);
  uploaded to Storage as `question-images/neet-2023/q<N>.png` / `q<N>_opt_<x>.png` using the
  remapped 1-200 numbering (phy 1-50, chem 51-100, bio 101-200) — see
  `scripts/replace-neet-2023-images.mjs` (full swap: upload → rewire figure_url → delete old).
- NEET 2022 figures: **user-curated** set in `neet/Neet 2022 images/` (e.g. `Question 138.png`,
  `Question 6 option a.png`); uploaded to Storage as `question-images/neet-2022/q<N>.png` /
  `q<N>_opt_<x>.png` (1-200 numbering) — see `scripts/replace-neet-2022-images.mjs`
  (full swap: upload → rewire figure_url → delete old).
- Fix/cleanup (NEET 2023 text): `patch-neet-2023-physics.mjs`, `patch-neet-2023-chem.mjs`,
  `patch-neet-2023-bio.mjs` (idempotent + self-verifying; never touch answer keys).
  Biology pass rebuilt the 20 clip-rendered blank questions (18 Match List-I/II
  tables, Q160, Q172 stem, Q198 sequence cleanup) from booklet pages 1-11
- NEET 2023 debug tools: `_check-neet-2023-storage.mjs` (storage↔DB audit),
  `_dump-neet-2023-figures.mjs`, `_dump-neet-2023-physics.mjs`, `_dump-neet-2023-chem.mjs`,
  `_dump-neet-2023-bio.mjs`, `_dump-neet-2023-bio-keys.mjs` (DB dumps),
  `_dump-neet-2023-keys.mjs` (answer keys), `_check-figure-urls.mjs`
  (HEAD all figure URLs), `_dump_phy_pages.py`/`_dump_chem_pages.py`/
  `_dump_neet_2023_pages.py` (PDF text dump, any page range — e.g. bio
  pages 1-11), `_check_vectors.py`/`_check_vectors39.py`/`_dump_chars.py`/
  `_dump_chars39.py` (PDF drawing-level / char-position dump)

### Rendering (src/components)
- `VectorText.tsx`: renders DB markup via KaTeX — `\vec{X}` arrows, `\frac{n}{d}` fractions,
  `\sqrt{}`, `\theta`-style commands, `_{…}`/`^{…}` sub/superscripts (also `_X`/`^X` single-char),
  unicode sub/sup chars (₀₁₂…, θ₀) and degree/en-dash chars pass through as text
- Shared across ALL papers (JEE + NEET): stems/options/solutions in NtaQuestionPanel,
  NtaQuestionPaperModal, NtaResultScreen all render through VectorText/FormattedQuestionText
- `FormattedQuestionText.tsx`: match-the-following questions (newline rows `A. x -> I. y` or
  `A. x  I. y`, or a markdown `| left | right |` table → List-I/II table) and
  Statement I/II questions. A markdown table is treated as a match table whatever
  its columns are called (NEET 2020 Q62 heads them "Name" / "IUPAC Official Name"),
  the first row is the header unless it is labelled like a data row, a bare
  `(a) (b) (c) (d)` strip is dropped as decoration, and a line matching no pattern
  is kept as the title (before the rows) or appended to the footer (after them) —
  it used to be silently discarded, which deleted question text such as
  "Identify the incorrect match."
- `QuestionDiagram.tsx` + `NtaQuestionPanel.tsx`: show `figure_url` images

### Known quirks from PDF extraction
- Vector text has no reliable sub/superscripts — mojibake signs (╧ ┬ ■ and friends) mean bad
  extraction; verify against the PDF page (glyph/vector dump) before fixing
- **Vector-drawn symbols are invisible to text extraction** — √ radicals
  (Q45/Q46/Q30/Q39-a), leading minus signs (Q40's −π²/16), and ρ/ω glyphs only
  exist as PDF drawings. If an option looks like it duplicates another or lacks
  a radical, dump the drawing layer (`_check_vectors*.py`) before concluding
  it's wrong
- Watermark junk to strip: `■■ PW Web/App - http...`
- Unicode subscripts (θ₀, v₀, T₁, NH₃) are legitimate content — leave as-is
- A stacked fraction's numerator must be bounded by measurement, not a fixed
  window: a 19pt reach reaches the *previous text line*, and NEET 2020 page 13
  lost the "a" and "s" of "phase" and the "oin"/"t" of "point" into `\frac{}`
  numerators. `classify_bars()` now walks outwards from each bar and stops at the
  first gap too wide to be a script, unless a nested bar or radical bridges it
- An option that is part markup, part picture renders as neither — the site shows
  an option's figure only when its text is empty (`NtaQuestionPanel.tsx`). The 2020
  extractor grows the clip over the markup and blanks the text so the whole answer
  arrives as one image (graph/structure/truth-table options: Q21, 43, 69, 85, 89, 90)
- Stem figures always render *below* the whole stem (`QuestionDiagram` comes after
  `FormattedQuestionText`), so a sentence cannot continue across one. `join_stem()`
  breaks the line where >18pt of clear white space says a picture was lifted out of
  the flow (NEET 2020 Q22, otherwise "…is given below The values of resistance…")

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
