-- Admin identity moves from a hardcoded email list (in code + in SQL) to
-- a database flag: auth.users.app_metadata.role = 'admin'.
--
-- Why: the email list was brittle (promote/demote required editing code and
-- redeploying) and the JWT email claim check was based on user-controlled
-- data being merely compared, not on an explicit grant. app_metadata is
-- server-controlled (users cannot edit it), and the check reads the users
-- table directly, so it is authoritative and always fresh.

-- 1. Flag the current administrators in app_metadata.
update auth.users
set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"', true)
where email in ('negishourya1980@gmail.com', 'sumitx0608@gmail.com');

-- 2. is_admin() now means "this user's app_metadata role is 'admin'".
-- SECURITY DEFINER is needed to read auth.users; the function body is gated
-- on auth.uid() (returns false for anon / not signed in), so it leaks nothing.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.raw_app_meta_data ->> 'role' = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Note for admins: existing browser sessions carry the old JWT, which does
-- not include the app_metadata role claim. Sign out and sign back in once so
-- the client-side "show admin UI" check sees the new claim. The server-side
-- check above is immediate and does not depend on the JWT.
