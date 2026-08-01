-- Subscriptions created server-side after Razorpay payment verification.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  plan_name text not null,
  amount int not null, -- paise
  status text not null default 'active', -- active | expired
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_ends_at_idx on public.subscriptions (ends_at);

alter table public.subscriptions enable row level security;

-- Users can read their own subscriptions; writes happen via service role only.
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
