-- DPDPA 2023 (Digital Personal Data Protection Act, India) Compliance & Audit Trail
-- 1. Table for recording user consent history, versions, and affirmative declarations.
-- 2. Table for recording user entry times, login timestamps, and session access logs.
-- 3. Security Definer functions with search_path = '' and strict RLS policies.

-- ---------------------------------------------------------------------------
-- Table: public.user_consents
-- Verifiable consent records mandated under Section 6 of DPDPA 2023.
-- ---------------------------------------------------------------------------
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text,
  consent_type text not null default 'signup_dpdpa_consent',
  consent_version text not null default '2026-v1.0',
  consented_at timestamptz not null default now(),
  entry_time timestamptz not null default now(),
  exam_track text default 'jee',
  user_agent text,
  terms_accepted boolean not null default true,
  privacy_accepted boolean not null default true,
  age_declaration boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_consents_user_id_idx on public.user_consents (user_id);
create index if not exists user_consents_consented_at_idx on public.user_consents (consented_at desc);
create index if not exists user_consents_entry_time_idx on public.user_consents (entry_time desc);

alter table public.user_consents enable row level security;

drop policy if exists user_consents_select on public.user_consents;
create policy user_consents_select
  on public.user_consents
  for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists user_consents_insert on public.user_consents;
create policy user_consents_insert
  on public.user_consents
  for insert
  to authenticated, anon
  with check ((select auth.uid()) = user_id or (select auth.uid()) is null or public.is_admin());

-- Backfill pre-existing users so existing students are recognized as registered
insert into public.user_consents (
  user_id,
  email,
  consent_type,
  consent_version,
  consented_at,
  entry_time,
  exam_track,
  terms_accepted,
  privacy_accepted,
  age_declaration,
  metadata
)
select
  u.id,
  u.email::text,
  'legacy_registration',
  '2026-v1.0',
  u.created_at,
  coalesce(u.last_sign_in_at, u.created_at),
  'jee',
  true,
  true,
  true,
  '{"migrated": true}'::jsonb
from auth.users u
where not exists (
  select 1 from public.user_consents c where c.user_id = u.id
);

-- ---------------------------------------------------------------------------
-- Table: public.user_entry_logs
-- Records person entry times, login events, and access session timestamps.
-- ---------------------------------------------------------------------------
create table if not exists public.user_entry_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text,
  entry_type text not null default 'session_entry', -- 'signup', 'login', 'session_entry'
  entry_time timestamptz not null default now(),
  path text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_entry_logs_user_id_idx on public.user_entry_logs (user_id);
create index if not exists user_entry_logs_entry_time_idx on public.user_entry_logs (entry_time desc);

alter table public.user_entry_logs enable row level security;

drop policy if exists user_entry_logs_select on public.user_entry_logs;
create policy user_entry_logs_select
  on public.user_entry_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists user_entry_logs_insert on public.user_entry_logs;
create policy user_entry_logs_insert
  on public.user_entry_logs
  for insert
  to authenticated, anon
  with check ((select auth.uid()) = user_id or (select auth.uid()) is null or public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC: check_user_registered
-- Checks if the authenticated user has completed registration/consent.
-- Returns true if user already has a record in user_consents.
-- ---------------------------------------------------------------------------
create or replace function public.check_user_registered()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_exists boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('registered', false, 'error', 'Not authenticated');
  end if;

  select exists(
    select 1 from public.user_consents where user_id = v_uid
  ) into v_exists;

  return jsonb_build_object('registered', v_exists);
end;
$$;

grant execute on function public.check_user_registered() to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: record_user_consent
-- Idempotently records/updates affirmative consent and entry log for the caller.
-- ---------------------------------------------------------------------------
create or replace function public.record_user_consent(
  p_consent_type text default 'signup_dpdpa_consent',
  p_consent_version text default '2026-v1.0',
  p_exam_track text default 'jee',
  p_consented_at timestamptz default null,
  p_entry_time timestamptz default null,
  p_user_agent text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_email text;
  v_consent_id uuid;
  v_c_time timestamptz;
  v_e_time timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Not authenticated');
  end if;

  select email into v_email from auth.users where id = v_uid;

  v_c_time := coalesce(p_consented_at, now());
  v_e_time := coalesce(p_entry_time, now());

  insert into public.user_consents (
    user_id,
    email,
    consent_type,
    consent_version,
    consented_at,
    entry_time,
    exam_track,
    user_agent,
    terms_accepted,
    privacy_accepted,
    age_declaration,
    metadata
  ) values (
    v_uid,
    v_email,
    coalesce(p_consent_type, 'signup_dpdpa_consent'),
    coalesce(p_consent_version, '2026-v1.0'),
    v_c_time,
    v_e_time,
    coalesce(p_exam_track, 'jee'),
    p_user_agent,
    true,
    true,
    true,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_consent_id;

  -- Also log entry time
  insert into public.user_entry_logs (
    user_id,
    email,
    entry_type,
    entry_time,
    path,
    user_agent,
    metadata
  ) values (
    v_uid,
    v_email,
    'signup_consent',
    v_e_time,
    '/signup',
    p_user_agent,
    jsonb_build_object('consent_id', v_consent_id, 'version', coalesce(p_consent_version, '2026-v1.0'))
  );

  return jsonb_build_object('ok', true, 'id', v_consent_id);
end;
$$;

grant execute on function public.record_user_consent(text, text, text, timestamptz, timestamptz, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: record_user_entry
-- Logs user entry / sign-in timestamp for audit & session monitoring.
-- ---------------------------------------------------------------------------
create or replace function public.record_user_entry(
  p_entry_type text default 'session_entry',
  p_path text default null,
  p_user_agent text default null,
  p_entry_time timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_email text;
  v_log_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is not null then
    select email into v_email from auth.users where id = v_uid;
  end if;

  insert into public.user_entry_logs (
    user_id,
    email,
    entry_type,
    entry_time,
    path,
    user_agent,
    metadata
  ) values (
    v_uid,
    v_email,
    coalesce(p_entry_type, 'session_entry'),
    coalesce(p_entry_time, now()),
    p_path,
    p_user_agent,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_log_id;

  return jsonb_build_object('ok', true, 'id', v_log_id);
end;
$$;

grant execute on function public.record_user_entry(text, text, text, timestamptz, jsonb) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Admin functions for compliance verification and audit reporting
-- ---------------------------------------------------------------------------

-- Enhanced admin user list with consent info and entry times
create or replace function public.admin_get_users()
returns table (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  consent_version text,
  consented_at timestamptz,
  last_entry_time timestamptz
)
language sql
stable
set search_path = ''
security definer
as $$
  select
    u.id,
    u.email::text,
    u.raw_user_meta_data ->> 'full_name',
    u.created_at,
    u.last_sign_in_at,
    c.consent_version,
    c.consented_at,
    coalesce(e.last_entry, u.last_sign_in_at, u.created_at) as last_entry_time
  from auth.users u
  left join lateral (
    select consent_version, consented_at
    from public.user_consents
    where user_id = u.id
    order by consented_at desc
    limit 1
  ) c on true
  left join lateral (
    select entry_time as last_entry
    from public.user_entry_logs
    where user_id = u.id
    order by entry_time desc
    limit 1
  ) e on true
  where public.is_admin()
  order by u.created_at desc;
$$;

grant execute on function public.admin_get_users() to authenticated;

-- Admin function to fetch full consent audit logs
create or replace function public.admin_get_consents()
returns table (
  id uuid,
  user_id uuid,
  email text,
  consent_type text,
  consent_version text,
  consented_at timestamptz,
  entry_time timestamptz,
  exam_track text,
  user_agent text,
  terms_accepted boolean,
  privacy_accepted boolean,
  age_declaration boolean,
  created_at timestamptz
)
language sql
stable
set search_path = ''
security definer
as $$
  select
    id,
    user_id,
    email,
    consent_type,
    consent_version,
    consented_at,
    entry_time,
    exam_track,
    user_agent,
    terms_accepted,
    privacy_accepted,
    age_declaration,
    created_at
  from public.user_consents
  where public.is_admin()
  order by consented_at desc;
$$;

grant execute on function public.admin_get_consents() to authenticated;

-- Admin function to fetch user entry time logs
create or replace function public.admin_get_entry_logs(p_limit int default 100)
returns table (
  id uuid,
  user_id uuid,
  email text,
  entry_type text,
  entry_time timestamptz,
  path text,
  user_agent text,
  created_at timestamptz
)
language sql
stable
set search_path = ''
security definer
as $$
  select
    id,
    user_id,
    email,
    entry_type,
    entry_time,
    path,
    user_agent,
    created_at
  from public.user_entry_logs
  where public.is_admin()
  order by entry_time desc
  limit least(coalesce(p_limit, 100), 500);
$$;

grant execute on function public.admin_get_entry_logs(int) to authenticated;
