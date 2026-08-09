-- Admin subscription cancellation + cancellation log.
--
-- Admin clicks "Cancel" on a subscription in the admin panel → a confirmation
-- dialog → admin_cancel_subscription() flips the subscription status to
-- 'cancelled' (access check requires status='active', so the student loses
-- access immediately) and appends a row to subscription_cancellations.

create table if not exists public.subscription_cancellations (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,             -- snapshot of the student's email at cancel time
  plan_id text,           -- snapshot of the cancelled plan
  plan_name text,
  amount int,             -- paise
  cancelled_at timestamptz not null default now(),
  cancelled_by text not null -- admin email (from JWT) who cancelled
);

create index if not exists subscription_cancellations_cancelled_at_idx
  on public.subscription_cancellations (cancelled_at desc);

create index if not exists subscription_cancellations_user_id_idx
  on public.subscription_cancellations (user_id);

alter table public.subscription_cancellations enable row level security;

-- Admin-only table: reads and (theoretically) writes are gated on is_admin().
drop policy if exists subscription_cancellations_admin_all on public.subscription_cancellations;
create policy subscription_cancellations_admin_all
  on public.subscription_cancellations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cancel a subscription (admin only). Idempotent-ish: cancelling a
-- non-active subscription returns ok=false instead of erroring.
create or replace function public.admin_cancel_subscription(p_subscription_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_email text;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  select * into v_sub from public.subscriptions where id = p_subscription_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Subscription not found');
  end if;

  if v_sub.status <> 'active' then
    return jsonb_build_object('ok', false, 'error', 'Subscription is not active');
  end if;

  update public.subscriptions
     set status = 'cancelled'
   where id = p_subscription_id;

  select email::text into v_email from auth.users where id = v_sub.user_id;

  insert into public.subscription_cancellations
    (subscription_id, user_id, email, plan_id, plan_name, amount, cancelled_by)
  values
    (v_sub.id, v_sub.user_id, v_email, v_sub.plan_id, v_sub.plan_name, v_sub.amount,
     coalesce(nullif(auth.jwt() ->> 'email', ''), 'admin'));

  return jsonb_build_object('ok', true, 'id', v_sub.id);
end;
$$;

grant execute on function public.admin_cancel_subscription(uuid) to authenticated;

-- Cancellation log (admin only).
create or replace function public.admin_get_cancellations()
returns table (
  id uuid,
  subscription_id uuid,
  user_id uuid,
  email text,
  plan_id text,
  plan_name text,
  amount int,
  cancelled_at timestamptz,
  cancelled_by text
)
language sql
stable
set search_path = ''
security definer
as $$
  select c.id, c.subscription_id, c.user_id, c.email, c.plan_id, c.plan_name,
         c.amount, c.cancelled_at, c.cancelled_by
  from public.subscription_cancellations c
  where public.is_admin()
  order by c.cancelled_at desc;
$$;

grant execute on function public.admin_get_cancellations() to authenticated;
