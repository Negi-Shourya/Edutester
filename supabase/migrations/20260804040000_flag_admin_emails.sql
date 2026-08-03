-- Admin roster: flag the four owner emails as admins.
--
-- Two parts:
-- 1. Idempotently set app_metadata.role = 'admin' for any of these emails
--    that already have an account (safe to re-run after a new signup).
-- 2. A BEFORE INSERT trigger on auth.users that auto-flags future signups
--    with one of these emails, so no manual step is needed when the
--    remaining owners create their accounts.

-- 1. Flag existing accounts (idempotent).
update auth.users
set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"', true)
where email in (
  'sumitx0608@gmail.com',
  'negishourya1980@gmail.com',
  'edutester4u@gmail.com',
  'sumit66x@gmail.com'
);

-- 2. Auto-flag future signups with an owner email.
create or replace function public.flag_admin_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email in (
    'sumitx0608@gmail.com',
    'negishourya1980@gmail.com',
    'edutester4u@gmail.com',
    'sumit66x@gmail.com'
  ) then
    new.raw_app_meta_data := jsonb_set(
      coalesce(new.raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"',
      true
    );
  end if;
  return new;
end;
$$;

drop trigger if exists flag_admin_signup on auth.users;
create trigger flag_admin_signup
  before insert on auth.users
  for each row execute function public.flag_admin_signup();
