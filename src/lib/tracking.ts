import { supabase } from './supabase';

let lastTracked = 0;

// Fire-and-forget page view recording, throttled to avoid duplicates from
// StrictMode double-effects in dev.
export function trackPageView(path: string) {
  const now = Date.now();
  if (now - lastTracked < 1000) return;
  lastTracked = now;

  void supabase.auth
    .getSession()
    .then(async ({ data }) => {
      const { user } = data.session ?? {};
      const { error } = await supabase
        .from('page_views')
        .insert({ path, user_id: user?.id ?? null });
      if (error) console.debug('page view tracking failed:', error.message);
    })
    .catch(() => {});
}
