-- Per-user rate-limit log for the razorpay edge functions.
--
-- One row per invocation of a protected edge function
-- (razorpay-create-order, razorpay-verify) so we can cap how often a single
-- account may call them. Same hardening as scoring_calls: RLS on, no
-- policies, and an explicit revoke (Supabase's default privileges would
-- otherwise open new public tables to anon/authenticated).

create table if not exists public.function_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  route text not null,
  created_at timestamptz not null default now()
);

create index if not exists function_calls_user_route_time_idx
  on public.function_calls (user_id, route, created_at desc);

alter table public.function_calls enable row level security;

revoke all on table public.function_calls from anon, authenticated;
