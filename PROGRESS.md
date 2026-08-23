# Progress

## Phase 1 — UI Complete ✅

### Pages (routes)
- `/` — Home (hero, features, how-it-works, CTA)
- `/pricing` — Pricing (4 plans, comparison table, FAQ)
- `/dashboard` — Dashboard (stats, recent tests, weak areas)
- `/chapter-tests` — Chapter tests (filter by subject, search)
- `/paper-tests` — Paper tests (filter by date, free trial paper)
- `/test` — NTA-like test interface (timer, palette, controls, results)
- `/login`, `/signup` — Auth forms (email + Google OAuth)
- `/admin` — Admin dashboard (users, purchases, visitors)
- `/profile` — Profile (account details, active/past subscriptions)

### Key Components
- Navbar, Footer, PricingCard, TestCard, FeatureCard, PaywallModal, ScrollToTop
- NtaHeader, NtaQuestionPanel, NtaQuestionPalette, NtaQuestionPaperModal,
  NtaInstructionsModal, NtaSubmitModal, NtaResultScreen
- VectorText (vec/sub/superscript markup renderer), FormattedQuestionText
  (match-the-following & statement renderers)

## Phase 2 — Auth & Backend ✅

- Supabase (project `gvsgromfsqvywawauzfi`): email/password + Google OAuth
- JWT sessions via GoTrue PKCE flow; access token auto-refreshes (~60 min)
- Remember-me: localStorage (persists) vs sessionStorage; ~30-day refresh token
- ProtectedRoute gating for `/dashboard`, tests, `/admin`, `/profile`

## Phase 3 — Payments & Subscriptions ✅

- Razorpay Edge Functions (`razorpay-create-order`, `razorpay-verify`) deployed
- `subscriptions` table + RLS; access checked live at test start
- Free trial: 1 chapter test (`ch-phy-1`) + 1 paper (`02-apr-morning`)
- Paywall modal on locked tests; locked screen on direct paper URL access
- Pricing page shows the user's plan as "Active" (no re-buy); click reveals
  upgrade-to-next-plan option; active plan refreshed after purchase

## Phase 4 — Admin ✅

- Admin dashboard with SECURITY DEFINER RPCs (`admin_get_users`,
  `admin_get_purchases`, `admin_stats`); gated to approved admin emails
- `page_views` tracking on every route

## Phase 5 — Real User Dashboard ✅

- `attempts` table (`20260801120000_create_attempts.sql`): aggregates +
  section breakdown + per-question outcomes; RLS (users select/insert own)
- Result pushed to DB once on test submission (persisted `syncedToDb` flag
  prevents duplicate rows on refresh); failures stay local and are backfilled
  on the next Dashboard visit (idempotent per paper)
- Dashboard now uses real data: tests taken, avg/best score, time practiced,
  subject-wise score/accuracy bars, score trend chart, full test history with
  per-subject chips, and focus areas from weakest subjects

## Phase 6 — NEET Section ✅

- NEET 2025 paper added (200 Qs, 4 sections: Physics/Chemistry/Botany/Zoology), NTA-style
  interface, from the official PDF (`neet/2025 Neet.pdf`)
- Extraction pipeline in `scripts/`: PDF → text + figures → DB seed → patch answers/images;
  figures curated and uploaded to Supabase Storage (`figure_url` per question/option)
- Math markup in DB rendered via KaTeX (`VectorText`): `\vec{}`, `\frac{n}{d}`, `\sqrt{}`,
  `_{…}`/`^{…}`, `\theta` etc.; unicode sub/sup chars and Greek pass through as text
- Match-the-following (List-I/II table) and Statement I/II questions rendered by
  `FormattedQuestionText`
- Debugged mojibake from PDF extraction (last pass, 18 questions): Q5, Q11, Q14, Q20, Q29,
  Q40, Q44, Q51, Q55, Q59, Q68, Q69, Q73, Q86, Q87, Q88, Q152, Q179
  - Fixed sub/superscripts (F_A/F_B, K_{a1}, O_{2}…), Greek letters (π, θ, ⇌, ∆H), degree
    signs (°), stacked fractions (`\frac{100}{12}`), mangled stems (Q20, Q59), match-list
    formatting (Q69), watermark junk (`■■ PW Web/App - http…`), option minus signs (Q55)
  - Verified against the PDF (incl. vector drawings for Q44's √ signs) and web sources
    (Q14 fraction, Q40 diode biasing); answer keys untouched (e.g. Q14→C, Q40→B, Q59→D)
  - Full-paper char scan: 34 distinct non-ASCII chars, all legitimate — zero mojibake left
- Kept fix scripts: `fix-neet-2025-subscripts.mjs`, `fix-neet-2025-q46-q148.mjs`,
  `fix-neet-2025-q90-q92.mjs`, `fix-neet-2025-match-questions.mjs`,
  `patch-neet-2025-answers.mjs`, `patch-neet-2025-images.mjs`,
  `cleanup-neet-2025-uncurated-images.mjs`
- Commits (pushed to origin/main): `8372ad6` added neet section → `0464a8d` neet 2025
  questions + katex rendering → `45ef184` redid neet 2025 (katex markup, clean screenshots,
  reseed) → `5cd90b5` debugged the Neet section
- NEET 2024 (T3): curated all 50 chemistry questions (Q51–100) — fixed blank stems/options,
  sub/superscripts (H₂O, MnO₄⁻, CO₃²⁻…), mojibake (`scripts/patch-neet-2024-questions.mjs`)
- NEET 2024: merged Botany + Zoology into a single Biology section (100 Qs)
  (`scripts/merge-neet-2024-biology-sections.mjs`); cleaned Q101 option D, Q151 option D
  (scrape junk), Q198 statement II (stray ■■■)
- NEET 2023 (T3): extracted from the Chapter & Topicwise booklet (`neet/2023 Neet.pdf`,
  38 pages, 200 Qs) with `scripts/extract_neet_2023.py` + `scripts/seed-neet-2023.mjs`
  - Booklet is two-column with per-domain numbering (bio 1-100, phy 1-50, chem 1-50);
    extractor assigns chars to columns by the detected gutter, splits side-by-side
    options, rebuilds stacked fractions (incl. option fractions like `3v/4`),
    skips chapter-title headers (Roboto font), clips vector figures and
    formula-heavy questions as block images
  - Biology kept as a single section (100 Qs) — no Botany/Zoology split; questions
    remapped to 1-200 (phy 1-50, chem 51-100, bio 101-200)
  - No solutions stored (answer key only, per product decision); physics Q8
    (radius of gyration) was dropped by NTA — bonus, stored with an empty key so
    the scoring engine awards full marks to anyone who attempted it
  - 199/200 answer keys, 200 questions/800 options verified in Supabase (paper
    id 40, sections Physics/Chemistry/Biology)
  - **NEET 2023 figure swap (done)**: replaced the 102 auto-extracted figure
    images with 64 user-curated ones from `neet/Neet 2023 images/{Physics,Chemistry,Biology}/`
    (`scripts/replace-neet-2023-images.mjs`). New files sanitized to
    `q<N>.png` / `q<N>_opt_<x>.png` in the remapped 1-200 numbering
    (phy 1-50, chem 51-100, bio 101-200); `figure_url` rewired for 47 question +
    66 option rows (paper 40 only); all 102 old images deleted. Audit
    (`scripts/_check-neet-2023-storage.mjs`): 64 objects, 64 referenced,
    0 missing, 0 orphans. Notes: Q84 (chem Q34) has option images but no stem
    image; Q100 opt1 has no image.
  - **NEET 2023 text fixes — Physics Q1-50 (done)**: rebuilt 5 fully-blank
    questions from the booklet (Q28, Q40, Q41, Q46, Q50), filled blank options
    (Q3, Q10, Q30, Q48, Q19, Q16), restored truncated words (Q24 "occurs is:",
    Q27 "3 × 10⁸", Q38 "u/3", Q9 "(G = gravitational constant):", Q39 fraction
    placement), stripped diagram-label junk from stems (Q18, Q19, Q20, Q44,
    Q45, Q47) via `scripts/patch-neet-2023-physics.mjs` (idempotent + self-verifying).
    Key findings: √ radicals on Q45/Q46/Q30 and Q39's option A are **vector-drawn
    in the PDF** (invisible to text extraction) — confirmed via drawing-level dumps
    (`_check_vectors.py`, `_check_vectors39.py`, `_dump_chars.py`); Q39 option A
    is √T (not a duplicate of B); Q40 options carry leading minus signs
    (−π²/16, π²/8, −π²/8, π²/16). Answer keys untouched; fixes verified against
    them (Q40→A, Q46→D, Q45→C, Q39→C).
  - **NEET 2023 text fixes — Chemistry Q51-100 (done)**: rebuilt blank match-table
    questions Q63 + Q94 (List-I/II tables + 4 answer options each), blank option
    Q91 (1/12, 1/2, 1/3, 1/4), corrected garbled Q53 option B (n_m = 2l + 1),
    rebuilt Q81's four reaction options with clean `\xrightarrow{…}` conditions,
    Q51 condition moved above the arrow (`\xrightarrow{1200K}`), stripped
    structure-label junk (Q89, Q98), fixed Q68/Q70 "Reason R:" typos, cleaned
    Q100 option A (HC ≡ C⁻Na⁺); image-based options kept their figures and got
    garbled text cleared (Q58, Q77, Q79, Q80, Q82, Q84, Q98, Q99, Q97) via
    `scripts/patch-neet-2023-chem.mjs` (idempotent + self-verifying). All 64
    figure URLs HEAD-checked 200 OK (`_check-figure-urls.mjs`). Keys untouched
    (Q53→B, Q63→D, Q91→D, Q94→C, Q81→D, Q100→B).
  - **NEET 2023 text fixes — Biology Q101-200 (done)**: rebuilt all 20
    blank questions (clip-rendered by the extractor) from the booklet pages
    1-11: 18 Match List-I/List-II tables (Q140, Q141, Q142, Q144, Q149,
    Q152, Q158, Q161, Q163, Q164, Q165, Q171, Q175, Q178, Q179, Q183,
    Q189, Q200), restored
    Q160 "Vital capacity of lung is ________." (+ its IRV/ERV options,
    en-dash verified at char level), restored Q172's stem (image-based
    pedigree-symbol options kept, same convention as physics Q50), and
    cleaned Q198 coding-strand sequence (removed wrap spaces, fixed the
    mis-extracted trailing "3?" → 3’ prime). List tables use the same
    "List-I / List-II + A. x  I. y" format as chem Q63/Q94 that
    FormattedQuestionText renders into NTA tables; header captions
    (Interaction / Cells / Type of Joint …) kept from the booklet. Every
    option set re-checked against the stored key (Q140→D, Q141→B, Q142→D,
    Q144→A, Q149→C, Q152→D, Q158→D, Q160→A, Q161→B, Q163→C, Q164→B,
    Q165→B, Q171→C, Q172→C, Q175→C, Q178→B, Q179→B, Q183→B, Q189→D,
    Q200→B). via `scripts/patch-neet-2023-bio.mjs` (idempotent +
    self-verifying). Keys untouched; no blank rows remain (Q172 options
    carry figures). New debug tools: `_dump-neet-2023-bio.mjs`,
    `_dump-neet-2023-bio-keys.mjs`, `_dump_neet_2023_pages.py` (any page
    range — e.g. `python scripts/_dump_neet_2023_pages.py 1 11` for the
    bio pages).
- **NEET 2020 (done)**: extracted from the Aakash "Questions & Answers" booklet
  (`neet/Ques&Ans_NEET2020.pdf`, Test Booklet Code G3, 21 pages, 13/09/2020) with
  `scripts/extract_neet_2020.py` → `neet-out/2020/` → `scripts/seed-neet-2020.mjs`.
  180 questions, sections Physics 1-45 / Chemistry 46-90 / Biology 91-180,
  720 options, 180 keys, `is_trial: false` (locked, like 2021/2022)
  - **Watermark removed before any image was clipped** (user requirement): the
    Aakash grey is painted in two colour spaces — DeviceRGB
    `0.901961 0.905882 0.909804 rg/RG` (pages 11-15) and DeviceCMYK `0 0 0 .102 k/K`
    (the rest). `clean_doc()` repaints 120 operators white in the content streams,
    and `scrub()` whitens leftover pixels ≥212 in each clip (form XObjects / soft
    masks). Audited after extraction: ≤0.6% of pixels per image fall in the
    200-250 grey band and they are all antialiasing on black line art — no
    watermark fill survives
  - **Answer key taken verbatim from the booklet's `Answer (n)` lines and NOT
    cross-checked against the official NTA key** (explicit user instruction).
    180/180 keyed, distribution A 45 / B 51 / C 37 / D 47
  - KaTeX markup for maths: stacked fractions rebuilt from the drawn bars
    (`\frac{}{}`), radicals (`\sqrt{}`), Symbol-font Greek (`\pi`, `\rho`,
    `\varepsilon`, `\Delta`, `\Omega`), `\ominus`, `\rightleftharpoons`,
    `\hat{}`, and `_{…}`/`^{…}` from glyph geometry. All 900 fields
    (180 stems + 720 options) parse clean through KaTeX
    (`scripts/_render-check-2020.mts`)
  - Booklet order is Biology 1-90, Physics 91-135, Chemistry 136-180; remapped to
    the site's Physics/Chemistry/Biology numbering and sorted by site number in
    the seeder
  - 28 images: 4 stem figures (Q3, 21, 22, 85) and 24 option figures
    (Q21, 43, 69, 85, 89, 90 × 4). An option that is half markup, half picture is
    clipped whole and its text blanked, because the site renders an option's
    figure only when its text is empty
  - 18 match questions emitted as markdown `| left | right |` tables with wrapped
    cells joined, column headers kept from the booklet (Q62 "Name"/"IUPAC Official
    Name", Q71 "Oxide"/"Nature") and the trailing "Select the correct option…"
    line kept as a footer; the `(a) (b) (c) (d)` strip above the answer options is
    dropped as decoration, and the option strings are reshaped from "(iii) (ii) (i)
    (iv)" to "(a) - (iii), (b) - (ii), (c) - (i), (d) - (iv)"
  - `FormattedQuestionText.tsx` fixes (shared by ALL papers, so re-checked against
    the existing match questions): markdown tables recognised as match tables
    whatever the columns are called, optional hyphen in the List/Column header
    regexes, bare marker strips skipped, and — the important one — a line matching
    no pattern is now kept as the title or footer instead of being silently
    dropped, which had been deleting text like Q62's "Identify the incorrect match."
  - Text-extraction bugs found and fixed in the extractor (not patched in the DB):
    a fraction's numerator reach is now measured per bar instead of a fixed 19pt
    window, which had pulled the "a"/"s" out of "phase" (Q18) and "oin"/"t" out of
    "point" (Q17) into `\frac{}` numerators; a LaTeX command's trailing space is
    dropped before a closing bracket (`(\rho )` → `(\rho)`, Q43); and the stem
    breaks its line where >18pt of white space says a figure was lifted out of the
    flow (Q22, previously "…is given below The values of resistance…")
  - Verified in the DB: paper id 58, `pos === number`, labels A-D everywhere, no
    blank stems or options, 0 options carrying both text and a figure, 28 storage
    objects under `question-images/neet-2020/`, keys identical to the extracted
    JSON. Rendering verified through the real `FormattedQuestionText` /
    `VectorText` / `QuestionDiagram` components for all 180 questions: 0 KaTeX
    errors, 0 blank options, no leftover markup, all 28 images load

## Phase 7 — Results screen perf + submission latency (shared by ALL papers)

- `NtaResultScreen`: question-wise answer key with infinite scroll — 10 fully-expanded
  cards at a time, an IntersectionObserver sentinel loads the next 10 as the user reaches
  the 10th (no button, DOM stays small); subject dropdown + separate All/Attempted/
  Unattempted pill filters with counts; detailed solutions removed (answer key only);
  memoized `SolutionCard`, O(1) `Map<id, QuestionState>` lookups — "All Subjects" kept
- `score-attempt` edge fn: paper load + log insert + housekeeping run in parallel
  (one round trip), unused `question_options` payload dropped from the select,
  `x-warmup` keep-warm ping (returns 204 before auth) — needs
  `supabase functions deploy score-attempt` to take effect
- Client: `submitAttempt` uses local `getSession()` instead of a network
  `getUser()`; TestInterface pings the edge fn every 2 min during an exam
  (cold-start insurance); applies to every existing/future paper (JEE + NEET)
- `PaperTests` Retake/Attempt label: now falls back to the user's attempts
  rows in the DB (`getAttempts`, authoritative) when the localStorage
  result payload is missing — a scored submission always has a DB row, so
  "Retake" + score survive tab switches (NEET ↔ JEE) and refreshes even if
  the local payload was never persisted

## Content & Rendering

- JEE Main 2026 papers (papers 1–9, keys `02-apr-*` … `08-apr-evening`): all 675 questions
  (75/paper: 60 MCQ + 15 numerical) audited against the KaTeX pipeline — verified clean:
  - Math markup (unicode sub/superscripts, Greek, √, `\vec{}`, `_{}/^{}`, `[[matrix]]`) present
    in every question that contains math; zero mojibake, zero HTML-embedded math, zero leftover
    placeholders across stems + options in all 9 papers
  - "No-math" questions are genuinely text-only (statement/match-list/figure-based)
  - 75/75 answer keys + solutions present per paper
  - Rendering path confirmed: every paper flows through `VectorText`/`FormattedQuestionText`
    (NtaQuestionPanel, NtaQuestionPaperModal, NtaResultScreen) — no bypass
- 1755 questions across 15 papers in Supabase (9 JEE Main 2026 × 75 = 675;
  NEET 2025 / 2024 / 2023 / 2022 / 2021 / 2020 × 180 = 1080; physics/chem/maths/
  botany/zoology sections; 2021 and 2022 split into Botany+Zoology, 2020/2023/2024/
  2025 biology as a single section). NEET 2022/2023/2024 were trimmed 200 → 180 (5
  Physics + 5 Chemistry + 10 Biology per paper, preferring NMC deleted-syllabus
  topics) via `scripts/remove-neet-deleted-syllabus.mjs`
- NTA-style rendering: vector arrows (`\vec{}`), sub/superscript markup
  (`_{...}`, `_X`, `^{...}`, `^X`) and unicode sub/sup chars → real
  `<sub>`/`<sup>` elements (font-safe); fractions/commands via KaTeX

## Marketing/Copy (latest polish)

- Core offerings only: NTA interface, previous year papers, test series, support
- Removed: cancel-anytime claim, analytics/AI/mock/1-on-1 features, phone,
  location in footer (email only: edutester4u@gmail.com)
- FAQ updated (5 Q&As), linked from footer (`/pricing#faq`); JEE Main syllabus
  PDF linked in footer resources
- Homepage CTAs: "Get Started Free" → `/signup` (new) or `/paper-tests`
  (signed-in); "Start Testing" → `/paper-tests` (scrolls to top on nav)
- Test interface shows the logged-in user's name + roll no. `123456`
- Attempt progress persisted locally (`edutester_attempt_<paperKey>`) — answers,
  timer, current question, submitted state; reopening a paper resumes the test
- Submitted papers/chapter tests show the user's score on the test list
  (`useAttemptScore` hook + `src/lib/scoring.ts`, matches result screen marking)
- Login/signup are Google-only (email/password forms removed); redesigned with
  gradient backdrop, brand card, and trust bullets so the single option
  doesn't look plain

## Todo
- [ ] Merge/credit durations when upgrading to a higher plan (currently a new
      subscription starts alongside the existing one)
- [ ] Chapter-level weak-area analysis (requires chapter metadata on questions)
- [ ] Auto-generate PDF performance reports (optional)
- [ ] Scan the NEET papers in the DB for PDF-extraction mojibake and fix them
      (JEE Main 2026 audited and clean — see Content & Rendering; NEET 2023
      all sections fixed (Physics, Chemistry, Biology); NEET 2024/2025
      already debugged; NEET 2020 extracted clean and KaTeX-checked end to end;
      NEET 2021/2022 not yet audited)
- [ ] Add more papers as they become available (e.g. JEE Main 2025)
