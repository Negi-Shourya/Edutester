# Next session: continue NEET solutions (start NEET 2020)

## Standing motive

Fill `question_keys.solution` for every NEET paper 2016–2026 with step-by-step
solutions. Rule A is in force (user chose): physics/derivation decides every
answer; DB keys get corrected with audit log; questions table NEVER touched.

## Done

- NEET 2018: 180/180 solutions live, validated, seeded. Dispute log:
  `scripts/key-disputes-neet-2018.json`. Commits 419063c + 66ac153 pushed.
- NEET 2019: 179/180 live. Q146 HELD (stem/options mismatch, needs stem fix).
  Dispute log: `scripts/key-disputes-neet-2019.json`.
- Process: `SOLUTION_PROCESS.md`. Tooling: `check-solutions.mjs`,
  `seed-solutions.mjs`, `apply-key-corrections.mjs`, `_pdftext.mjs`.
- Result-screen Explanation block built (`NtaResultScreen.tsx`).
- Chapter auto-classification shipped (question-chapter-auto.json, 44% coverage).

## Next: NEET 2020

1. Pull work file: 180 questions + options + keys →
   `scripts/work-neet-2020.json` (same dump shape as 2018/2019 scripts).
2. Solve in ~15-question batches per SOLUTION_PROCESS.md.
3. Triple-check each answer: derivation × DB key × independent key.
   - 2020 keys come from the Aakash booklet (user instruction: deliberately NOT
     cross-checked against the official key — do NOT "correct" 2020 keys to
     match other sources).
   - Source PDF: `neet/Ques&Ans_NEET2020.pdf`. Figures: `neet-out/2020/`.
4. Validate → seed → verify counts. User spot-checks each batch.

## Open items (not blockers)

- NEET 2019 Q146 stem fix (DB stem asks greenhouse protocols; options/key are
  Rio Earth Summit). Needs user-approved stem replacement.
- `reneet-2026` (file exists, not in DB): user has not confirmed scope.
- NEET 2016: 1 solution missing. NEET 2017: 14 missing.
- 2021–2026 papers: zero solution coverage yet.
