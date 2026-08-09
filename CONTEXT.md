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

## NEET Section

### Data (Supabase)
- Paper row: `key = 'neet-2025'` (NTA-style test interface, 200 questions)
- Tables: `papers`, `questions`, `question_options`, `question_keys`, `question_images`
- Question text/options stored as text with LaTeX-style math markup (see Rendering)
- Figures stored in Supabase Storage, referenced by `figure_url` on questions/options
- Answer keys patched and verified against the official NEET 2025 answer key
- Total content: 875 questions across 9 papers (NEET 2025 = 200)

### Source & extraction pipeline (`scripts/`)
- Official PDF: `neet/2025 Neet.pdf` (watermarked, ~12 MB)
- Extract: `extract_neet_2025.py`, `extract-questions.mjs`, `extract_paper_images.py`,
  `reclip_diagrams.py` → figures; `seed-neet-2025.mjs` → seed DB
- Fix/cleanup: `fix_neet_2025.py`, `cleanup_neet_2025(_v2).py`, `final_cleanup.py`,
  `fix_match_list_questions.py`, `fix-neet-2025-{match-questions,q46-q148,q90-q92,subscripts}.mjs`,
  `patch-neet-2025-{answers,images}.mjs`, `cleanup-neet-2025-uncurated-images.mjs`,
  `generate-figure-url-migration.mjs`, `upload-images.mjs`
- Debug tools: `_dump-pdf.mjs`, `_dump_subs.py`, `_find-subs.mjs`, `_check-db.mjs`,
  `glyphdump.py`/`glyphx.py`/`recover*.py`/`render_regions*.py` (PDF vector drawing analysis)
- Figure assets: `neet/neet images/` (raw PDF screenshots), `question_images/neet-2025-images/`
  (curated, uploaded to Storage)

### Rendering (src/components)
- `VectorText.tsx`: renders DB markup via KaTeX — `\vec{X}` arrows, `\frac{n}{d}` fractions,
  `\sqrt{}`, `\theta`-style commands, `_{…}`/`^{…}` sub/superscripts (also `_X`/`^X` single-char),
  unicode sub/sup chars (₀₁₂…, θ₀) and degree/en-dash chars pass through as text
- `FormattedQuestionText.tsx`: match-the-following questions (newline rows `A. x -> I. y` or
  `A. x  I. y` → List-I/II table) and Statement I/II questions
- `QuestionDiagram.tsx` + `NtaQuestionPanel.tsx`: show `figure_url` images

### Known quirks from PDF extraction
- Vector text has no reliable sub/superscripts — mojibake signs (╧ ┬ ■ and friends) mean bad
  extraction; verify against the PDF page (glyph/vector dump) before fixing
- Watermark junk to strip: `■■ PW Web/App - http...`
- Unicode subscripts (θ₀, v₀, T₁, NH₃) are legitimate content — leave as-is

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
