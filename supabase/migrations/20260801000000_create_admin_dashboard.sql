-- Admin dashboard support.
-- Admin emails (must match the JWT email claim of the signed-in user).
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select auth.jwt() ->> 'email' in ('negishourya1980@gmail.com', 'sumitx0608@gmail.com');
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Admin data access via SECURITY DEFINER functions (RLS on views is not
-- supported on this PostgreSQL version). Each function gates on is_admin().
-- ---------------------------------------------------------------------------

-- Registered users + login activity (admin only).
create or replace function public.admin_get_users()
returns table (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
stable
set search_path = ''
security definer
as $$
  select u.id, u.email::text, u.raw_user_meta_data ->> 'full_name', u.created_at, u.last_sign_in_at
  from auth.users u
  where public.is_admin()
  order by u.created_at desc;
$$;

grant execute on function public.admin_get_users() to authenticated;

-- Purchase history (admin only).
create or replace function public.admin_get_purchases()
returns table (
  id uuid,
  user_id uuid,
  email text,
  plan_id text,
  plan_name text,
  amount int,
  status text,
  razorpay_order_id text,
  razorpay_payment_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz
)
language sql
stable
set search_path = ''
security definer
as $$
  select s.id, s.user_id, u.email::text, s.plan_id, s.plan_name, s.amount, s.status,
         s.razorpay_order_id, s.razorpay_payment_id, s.starts_at, s.ends_at, s.created_at
  from public.subscriptions s
  left join auth.users u on u.id = s.user_id
  where public.is_admin()
  order by s.created_at desc;
$$;

grant execute on function public.admin_get_purchases() to authenticated;

-- Aggregate stats (admin only).
create or replace function public.admin_stats()
returns jsonb
language sql
stable
set search_path = ''
security definer
as $$
  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'logged_in', (select count(*) from auth.users where last_sign_in_at is not null),
    'active_7d', (select count(*) from auth.users where last_sign_in_at >= now() - interval '7 days'),
    'total_purchases', (select count(*) from public.subscriptions),
    'active_subs', (select count(*) from public.subscriptions where status = 'active' and ends_at > now()),
    'revenue', (select coalesce(sum(amount), 0) from public.subscriptions)
  )
  where public.is_admin();
$$;

grant execute on function public.admin_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Extend subscriptions RLS so admins can read all rows.
-- ---------------------------------------------------------------------------
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Visitor statistics.
-- Anyone can record a page view; only admins can read the log.
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;

drop policy if exists page_views_insert on public.page_views;
create policy page_views_insert
  on public.page_views
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists page_views_admin_select on public.page_views;
create policy page_views_admin_select
  on public.page_views
  for select
  using (public.is_admin());
