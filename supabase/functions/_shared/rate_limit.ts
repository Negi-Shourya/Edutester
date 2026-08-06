import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

export interface RateLimitRule {
  route: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// Per-user rolling-window rate limit backed by the service-role-only
// `function_calls` table. Returns `{ allowed: false, retryAfterSeconds }` when
// the user has already made `limit` calls for `route` within `windowMs`
// (respond with 429 + Retry-After); on the allowed path it logs the call so
// the next invocation is counted.
export async function checkRateLimit(
  admin: ReturnType<typeof createClient<any>>,
  userId: string,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - rule.windowMs).toISOString();

  const { count } = await admin
    .from('function_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('route', rule.route)
    .gte('created_at', since);

  if ((count ?? 0) >= rule.limit) {
    const { data: oldest } = await admin
      .from('function_calls')
      .select('created_at')
      .eq('user_id', userId)
      .eq('route', rule.route)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(1);
    const first = oldest?.[0]?.created_at as string | undefined;
    const retryAfterSeconds = first
      ? Math.max(1, Math.ceil((new Date(first).getTime() + rule.windowMs - Date.now()) / 1000))
      : Math.ceil(rule.windowMs / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Best-effort housekeeping keeps the log small; failures are ignored.
  await admin
    .from('function_calls')
    .delete()
    .eq('route', rule.route)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const { error } = await admin.from('function_calls').insert({ user_id: userId, route: rule.route });
  if (error) console.error('rate-limit log insert failed', error);

  return { allowed: true, retryAfterSeconds: 0 };
}
