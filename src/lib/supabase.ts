import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || 'https://gvsgromfsqvywawauzfi.supabase.co';
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  'sb_publishable_E4i5onSWlO_NBqE8nsHXig_K25O1Lqv';

const REMEMBER_KEY = 'edutester_remember';

function isRemembered() {
  return localStorage.getItem(REMEMBER_KEY) !== '0';
}

function currentStore(): Storage {
  return isRemembered() ? localStorage : sessionStorage;
}

// "Remember me": persisted sessions live in localStorage (survive browser
// restarts); otherwise they live in sessionStorage (cleared on tab close).
const storage = {
  getItem: (key: string) => currentStore().getItem(key),
  setItem: (key: string, value: string) => currentStore().setItem(key, value),
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function setRememberMe(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
}

export function isRememberMe() {
  return isRemembered();
}
