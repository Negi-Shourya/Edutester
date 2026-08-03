-- Contact form submissions from the public contact page.
-- Only inserts are exposed (anon + authenticated). Reading is limited to the
-- service role (RLS is bypassed for service_role), so admins can review
-- messages from the dashboard/edge functions later.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_insert_public"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);
