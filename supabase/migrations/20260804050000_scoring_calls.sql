-- Per-user rate-limit log for the score-attempt edge function.
--
-- One row per scoring invocation so we can cap how often a single account
-- may submit + receive that paper's answer keys. Service-role only: RLS on,
-- no policies, and an explicit revoke (Supabase's default privileges would
-- otherwise open new public tables to anon/authenticated).

create table if not exists public.scoring_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists scoring_calls_user_time_idx
  on public.scoring_calls (user_id, created_at desc);

alter table public.scoring_calls enable row level security;

revoke all on table public.scoring_calls from anon, authenticated;
