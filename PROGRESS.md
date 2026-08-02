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

## Content & Rendering

- 675 questions across 8 papers in Supabase (physics/chem/maths sections)
- NTA-style rendering: vector arrows (`\vec{}`), sub/superscript markup
  (`_{...}`, `_X`, `^{...}`, `^X`) and unicode sub/sup chars → real
  `<sub>`/`<sup>` elements (font-safe)

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
- [ ] Add more papers as they become available
