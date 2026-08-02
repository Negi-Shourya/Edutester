-- Attempt results created client-side when a user submits a test.
-- Stores per-attempt aggregates (no raw question text) plus a compact
-- per-question outcome map for future answer-review and weak-area analysis.
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  paper_key text not null,
  test_type text not null default 'paper', -- paper | chapter
  title text not null,
  total_score int not null,
  max_score int not null,
  correct int not null default 0,
  incorrect int not null default 0,
  unattempted int not null default 0,
  accuracy int not null default 0, -- 0-100
  time_spent int not null default 0, -- seconds
  -- [{ "section": "Physics", "score": 58, "max_score": 100, "correct": 14,
  --    "incorrect": 3, "unattempted": 8, "accuracy": 82 }, ...]
  section_breakdown jsonb not null default '[]'::jsonb,
  -- { "<question_id>": "correct" | "incorrect" | "unattempted", ... }
  question_outcomes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_id_idx on public.attempts (user_id);
create index if not exists attempts_user_created_idx on public.attempts (user_id, created_at desc);

alter table public.attempts enable row level security;

-- Users can read and insert their own attempts. Deletes/updates are not
-- exposed (retakes create a new row; cleanup via service role only).
create policy "attempts_select_own"
  on public.attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "attempts_insert_own"
  on public.attempts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
