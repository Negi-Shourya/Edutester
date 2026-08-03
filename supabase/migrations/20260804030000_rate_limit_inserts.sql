-- Rate limiting for the two tables that accept inserts from the public API:
-- page_views and contact_messages. Without limits, scripted clients could
-- flood these tables (wasting DB size and the project's bandwidth).
--
-- Both limits run as BEFORE INSERT triggers. The trigger functions are
-- SECURITY DEFINER (they must count rows that RLS would hide from the
-- insertor) and are `returns trigger` — not directly callable via the API.

-- ---------------------------------------------------------------------------
-- page_views: only signed-in users may record a view, capped per user.
-- Anonymous inserts are no longer allowed at the RLS level (the main
-- flooding vector was scripted anon traffic with no account to trace).
-- ---------------------------------------------------------------------------
drop policy if exists page_views_insert on public.page_views;
create policy page_views_insert
  on public.page_views
  for insert
  to authenticated
  with check (true);

-- Per-user cap: 300 page views per rolling hour (a view every ~12s for an
-- hour straight is far beyond real browsing).
create or replace function public.limit_page_views()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  if (select auth.uid()) is null then
    return new; -- anon inserts are already blocked by the RLS policy
  end if;
  select count(*) into v_count
  from public.page_views
  where user_id = (select auth.uid())
    and created_at > now() - interval '1 hour';
  if v_count >= 300 then
    raise exception 'Page view limit reached. Please slow down.';
  end if;
  return new;
end;
$$;

drop trigger if exists page_views_rate_limit on public.page_views;
create trigger page_views_rate_limit
  before insert on public.page_views
  for each row execute function public.limit_page_views();

-- ---------------------------------------------------------------------------
-- contact_messages: cap per submitter email (3 per 24h) and globally
-- (50 per hour) to stop scripted spam through the contact form.
-- ---------------------------------------------------------------------------
create or replace function public.limit_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_per_email int;
  v_global int;
begin
  select count(*) into v_per_email
  from public.contact_messages
  where lower(email) = lower(new.email)
    and created_at > now() - interval '24 hours';
  if v_per_email >= 3 then
    raise exception 'Too many messages from this email. Please try again later.';
  end if;

  select count(*) into v_global
  from public.contact_messages
  where created_at > now() - interval '1 hour';
  if v_global >= 50 then
    raise exception 'Too many messages right now. Please try again later.';
  end if;

  return new;
end;
$$;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row execute function public.limit_contact_messages();
