# Next session: NEET solutions upkeep (2021–2026 normalized; 2026 stays solution-free)

## Standing motive

Fill `question_keys.solution` for every NEET paper 2016–2026 with step-by-step
solutions. Rule A is in force (user chose): physics/derivation decides every
answer; DB keys get corrected with audit log; questions table NEVER touched.
Solution column ONLY is ever written (`seed-solutions.mjs`).

## Done

- NEET 2018: 180/180 solutions live, validated, seeded. Dispute log:
  `scripts/key-disputes-neet-2018.json`. Commits 419063c + 66ac153 pushed.
  Elaborated rewrite (2026 depth, ~326 chars avg) seeded 2026-09-04; work-file
  keys were stale (125 pre-correction) so every ending was re-verified against
  live DB keys before seeding.
- NEET 2019: 179/180 live. Q146 HELD (stem/options mismatch, needs stem fix).
  Dispute log: `scripts/key-disputes-neet-2019.json`. Elaborated rewrite
  (2026 depth, ~350 chars avg) seeded 2026-09-04.
- NEET 2020: 180/180 solutions live, validated, seeded. Dispute log: `scripts/key-disputes-neet-2020.json`. Elaborated rewrite (2026 depth, ~353 chars avg) seeded 2026-09-04.
- NEET 2021: 180/180 solutions live, validated, seeded. Dispute log: `scripts/key-disputes-neet-2021.json`. Elaborated rewrite to 2026 short-line style seeded 2026-09-05 (4.9 lines avg; zero key disputes raised, keys untouched).
- NEET 2022: 180/180 solutions live, validated, seeded. Dispute log: `scripts/key-disputes-neet-2022.json` (Q39, Q83, Q85, Q158, Q161, Q173 corrected).
- NEET 2023: 180/180 solutions live, validated, seeded. Q6 retained as NTA Bonus (`key: null`, solution ends `→ (Bonus)`). Zero key disputes.
- NEET 2024: 180/180 solutions live, validated, seeded. Q23 dual key `A,C` ends `→ (A) or (C)`. Zero key disputes.
- NEET 2025: 180/180 solutions live, validated, seeded. Q63 dual key `A,B` ends `→ (A) or (B)`. Zero key disputes.
- Re-NEET 2026 (`reneet-2026`, paper id 59): 180/180 solutions live, validated, seeded. Q26 NTA Bonus ends `→ (Bonus)`. Q38 dual key `B,C` ends `→ (B) or (C)`. Zero key disputes (`scripts/key-disputes-reneet-2026.json`).
- Process: `SOLUTION_PROCESS.md` (format rules §4 — raw TeX, no `$`, no author
  numbering/bullets, real newlines; workflow is clean → check → seed).
  Tooling: `clean-neet-solutions.mjs`, `check-solutions.mjs`,
  `seed-solutions.mjs`, `apply-key-corrections.mjs`, `dump-work.mjs`, `inspect-batch.mjs`.
- Result-screen Explanation block (`NtaResultScreen.tsx`): `SolutionSteps`
  renders plain paragraphs with a green answer highlight (number badges
  removed per user instruction); residual author markers stripped per line.
- Display-normalization pass (this session): NEET 2021–2025 + Re-NEET 2026
  solutions cleaned of `$`/`$$`, literal `\n`, author numbering/bullets and
  reseeded — 180/180 live each, 0 dirty rows; KaTeX harness 0 errors across
  all solution files. Renderer hardened (`src/lib/mathText.ts`: dollar
  strip, literal-newline fix, `\left…\right` spans, nesting-aware fractions).
- NEET 2026 (`neet-2026`, paper id 60): 180/180 solutions live, validated,
  cleaned, seeded 2026-09-04. 2 keys corrected with second sources (Q57 C→B,
  Q62 D→A; `scripts/key-disputes-neet-2026.json`). Prior solution-free hold
  lifted by the user.

## Next: remaining solution work

- NEET 2020 / 2019 / 2018: live solutions already scan clean (2019 has
  179/180 — one question without a solution). Re-verify end to end only if
  touched. Note: `scripts/solutions-neet-2019.json` has a pre-existing
  last-line issue (qid 20337 doesn't end with the answer letter), so the
  cleaner refuses to rewrite it — file-level only, live DB unaffected.
- NEET 2017: 180/180 solutions live in 2026 style (full rewrite seeded
  2026-09-05; avg ~229 chars). 92 keys corrected total: 9 in the first pass
  (Q4 C→B polaroids + 8 bio) plus 83 in the full-paper audit against the
  Career Point Code-Y solved paper (value-matched, internet-verified for
  Q4/Q134/Q179); log: `scripts/key-disputes-neet-2017.json` (one reverted
  mis-application caught and repaired mid-pass: Q36/Q44/Q81). Source of
  truth: `scripts/solutions-neet-2017.json`. Q19 dual key (B, C), Q33
  all-award bonus (A, B, C, D).
- NEET 2016: 180/180 solutions live in 2026 style (full rewrite seeded
  2026-09-05; avg ~226 chars; old `<PAGE_NN>` markers gone). 8 keys corrected
  with Career Point Code-Q second source (Q37 D→C, Q42 D→A, Q53 C→B,
  Q54 D→A, Q62 A→B, Q64 A→B, Q131 C→D, Q139 B→C);
  log: `scripts/key-disputes-neet-2016.json`. Source of truth:
  `scripts/solutions-neet-2016.json`. Multi-award keys: Q70 (A,B,C,D),
  Q85 (C, D), Q149 (A, B, C, D).

## Open items (not blockers)

- NEET 2019 Q146 stem fix (DB stem asks greenhouse protocols; options/key are
  Rio Earth Summit). Needs user-approved stem replacement.

