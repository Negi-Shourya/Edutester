-- Affiliates / YouTubers Referral Tracking & Admin Reporting
-- 1. Table: public.affiliates (creators, referral codes, commission % and contact/UPI info)
-- 2. Table: public.user_referrals (links registered user accounts to referring affiliate)
-- 3. Extend public.subscriptions with affiliate_id
-- 4. Secure RPCs for attribution recording and admin dashboard reporting

-- ---------------------------------------------------------------------------
-- 1. Table: public.affiliates
-- ---------------------------------------------------------------------------
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  commission_percent numeric not null default 20.0 check (commission_percent >= 0 and commission_percent <= 100),
  upi_id text,
  channel_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliates_code_idx on public.affiliates (lower(code));
create index if not exists affiliates_is_active_idx on public.affiliates (is_active);

alter table public.affiliates enable row level security;

-- Only admins can read/write directly to public.affiliates
drop policy if exists affiliates_admin_policy on public.affiliates;
create policy affiliates_admin_policy
  on public.affiliates
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Table: public.user_referrals
-- ---------------------------------------------------------------------------
create table if not exists public.user_referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  referral_code text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_referrals_user_id_idx on public.user_referrals (user_id);
create index if not exists user_referrals_affiliate_id_idx on public.user_referrals (affiliate_id);

alter table public.user_referrals enable row level security;

drop policy if exists user_referrals_select on public.user_referrals;
create policy user_referrals_select
  on public.user_referrals
  for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists user_referrals_insert on public.user_referrals;
create policy user_referrals_insert
  on public.user_referrals
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Extend public.subscriptions with affiliate_id
-- ---------------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists affiliate_id uuid references public.affiliates (id) on delete set null;

create index if not exists subscriptions_affiliate_id_idx on public.subscriptions (affiliate_id);

-- ---------------------------------------------------------------------------
-- 4. Attribution RPC: Record user referral upon signup/login
-- ---------------------------------------------------------------------------
create or replace function public.record_user_referral(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_affiliate_id uuid;
  v_clean_code text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  if p_code is null or trim(p_code) = '' then
    return false;
  end if;

  v_clean_code := lower(trim(p_code));

  -- If user is already attributed to any affiliate, do not overwrite
  if exists (select 1 from public.user_referrals where user_id = v_user_id) then
    return false;
  end if;

  -- Look up active affiliate
  select id into v_affiliate_id
  from public.affiliates
  where lower(code) = v_clean_code and is_active = true
  limit 1;

  if v_affiliate_id is null then
    return false;
  end if;

  insert into public.user_referrals (user_id, affiliate_id, referral_code)
  values (v_user_id, v_affiliate_id, v_clean_code)
  on conflict (user_id) do nothing;

  return true;
end;
$$;

grant execute on function public.record_user_referral(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Admin RPC: Get all affiliates with summary metrics
-- ---------------------------------------------------------------------------
create or replace function public.admin_get_affiliates()
returns table (
  id uuid,
  name text,
  code text,
  commission_percent numeric,
  upi_id text,
  channel_url text,
  notes text,
  is_active boolean,
  created_at timestamptz,
  referred_users_count bigint,
  paid_subscriptions_count bigint,
  total_revenue_paise bigint,
  calculated_payout_paise bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    a.name,
    a.code,
    a.commission_percent,
    a.upi_id,
    a.channel_url,
    a.notes,
    a.is_active,
    a.created_at,
    coalesce(count(distinct ur.user_id), 0)::bigint as referred_users_count,
    coalesce(count(distinct s.id) filter (where s.status = 'active'), 0)::bigint as paid_subscriptions_count,
    coalesce(sum(s.amount) filter (where s.status = 'active'), 0)::bigint as total_revenue_paise,
    coalesce(round(sum(s.amount * (a.commission_percent / 100.0)) filter (where s.status = 'active')), 0)::bigint as calculated_payout_paise
  from public.affiliates a
  left join public.user_referrals ur on ur.affiliate_id = a.id
  left join public.subscriptions s on s.user_id = ur.user_id
  where public.is_admin()
  group by a.id, a.name, a.code, a.commission_percent, a.upi_id, a.channel_url, a.notes, a.is_active, a.created_at
  order by a.created_at desc;
$$;

grant execute on function public.admin_get_affiliates() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Admin RPC: Get drill-down users and subscriptions for a specific affiliate
-- ---------------------------------------------------------------------------
create or replace function public.admin_get_affiliate_details(p_affiliate_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text,
  referred_at timestamptz,
  has_purchased boolean,
  subscriptions_count bigint,
  total_spent_paise bigint,
  latest_plan_name text,
  latest_purchase_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ur.user_id,
    u.email::text,
    (u.raw_user_meta_data ->> 'full_name')::text as full_name,
    ur.created_at as referred_at,
    coalesce(count(s.id) filter (where s.status = 'active') > 0, false) as has_purchased,
    coalesce(count(s.id) filter (where s.status = 'active'), 0)::bigint as subscriptions_count,
    coalesce(sum(s.amount) filter (where s.status = 'active'), 0)::bigint as total_spent_paise,
    (
      select sub.plan_name
      from public.subscriptions sub
      where sub.user_id = ur.user_id and sub.status = 'active'
      order by sub.created_at desc
      limit 1
    ) as latest_plan_name,
    (
      select max(sub.created_at)
      from public.subscriptions sub
      where sub.user_id = ur.user_id and sub.status = 'active'
    ) as latest_purchase_at
  from public.user_referrals ur
  join auth.users u on u.id = ur.user_id
  left join public.subscriptions s on s.user_id = ur.user_id
  where public.is_admin() and ur.affiliate_id = p_affiliate_id
  group by ur.user_id, u.email, u.raw_user_meta_data, ur.created_at
  order by ur.created_at desc;
$$;

grant execute on function public.admin_get_affiliate_details(uuid) to authenticated;
