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

- 875 questions across 9 papers in Supabase (physics/chem/maths/botany/zoology sections)
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
- [ ] Scan the older papers in the DB for the same PDF-extraction mojibake
      (reuse the neet-2025 char-scan approach) and fix them
- [ ] Add more papers as they become available (e.g. JEE Main 2025)
