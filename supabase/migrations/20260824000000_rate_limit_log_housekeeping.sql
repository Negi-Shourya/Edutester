-- Move rate-limit log housekeeping out of the request path.
--
-- Both `scoring_calls` and `function_calls` were pruned inline on every
-- invocation, filtering on `created_at` alone. Neither table has an index that
-- can serve that: scoring_calls is keyed (user_id, created_at) and
-- function_calls (user_id, route, created_at), and with user_id leading, a bare
-- created_at range is a sequential scan. That is harmless at a few calls a
-- minute, but an exam ends on a deadline — every submission scans the table and
-- they all contend for the same expired rows at the one moment that matters.
--
-- The purge is pure housekeeping. Each rate limiter only ever looks back over
-- its own rolling window (one hour for scoring, per-rule for the razorpay
-- routes), so nothing depends on old rows disappearing promptly. Run it nightly
-- instead, and index created_at so the purge is an index scan rather than a
-- full pass over the table.

create index if not exists scoring_calls_created_at_idx
  on public.scoring_calls (created_at);

create index if not exists function_calls_created_at_idx
  on public.function_calls (created_at);

create extension if not exists pg_cron;

-- Re-running this migration must not fail on an already-scheduled job.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-rate-limit-logs') then
    perform cron.unschedule('purge-rate-limit-logs');
  end if;
end
$$;

select cron.schedule(
  'purge-rate-limit-logs',
  -- 03:14, deliberately off the hour so it does not land with other jobs.
  '14 3 * * *',
  $$
    delete from public.scoring_calls where created_at < now() - interval '24 hours';
    delete from public.function_calls where created_at < now() - interval '24 hours';
  $$
);
