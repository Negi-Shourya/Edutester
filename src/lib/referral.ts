import { supabase } from './supabase';

export const REFERRAL_STORAGE_KEY = 'edutester_referral_code';
export const REFERRAL_TIMESTAMP_KEY = 'edutester_referral_time';
export const REFERRAL_COOKIE_NAME = 'edutester_ref';
export const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Normalizes referral code to lowercase trimmed alphanumeric string.
 */
export function normalizeReferralCode(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const trimmed = code.trim().toLowerCase();
  if (!trimmed || !/^[a-z0-9_-]{2,32}$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Reads a cookie by name from document.cookie.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Sets a cookie with 30-day max-age.
 */
function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Captures ?ref=... or ?referral=... from the URL query parameters
 * and stores it with a 30-day attribution window.
 */
export function captureReferralParam(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const rawCode = params.get('ref') || params.get('referral') || params.get('aff');
    const cleanCode = normalizeReferralCode(rawCode);

    if (cleanCode) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, cleanCode);
      localStorage.setItem(REFERRAL_TIMESTAMP_KEY, Date.now().toString());
      setCookie(REFERRAL_COOKIE_NAME, cleanCode, 30);
      return cleanCode;
    }
  } catch {
    // Ignore browser storage exceptions
  }

  return null;
}

/**
 * Retrieves the currently active referral code if within the 30-day window.
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const code = localStorage.getItem(REFERRAL_STORAGE_KEY) || getCookie(REFERRAL_COOKIE_NAME);
    if (!code) return null;

    const timeStr = localStorage.getItem(REFERRAL_TIMESTAMP_KEY);
    if (timeStr) {
      const storedTime = parseInt(timeStr, 10);
      if (!isNaN(storedTime) && Date.now() - storedTime > ATTRIBUTION_WINDOW_MS) {
        clearStoredReferralCode();
        return null;
      }
    }

    return normalizeReferralCode(code);
  } catch {
    return null;
  }
}

/**
 * Clears stored referral data.
 */
export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    localStorage.removeItem(REFERRAL_TIMESTAMP_KEY);
    if (typeof document !== 'undefined') {
      document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    // Ignore
  }
}

/**
 * Syncs the stored referral code to Supabase for the authenticated user.
 * Called automatically when user completes login / signup.
 */
export async function syncPendingReferralToDatabase(): Promise<boolean> {
  const code = getStoredReferralCode();
  if (!code) return false;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return false;
    }

    const { data, error } = await supabase.rpc('record_user_referral', {
      p_code: code,
    });

    if (error) {
      console.warn('Could not record referral attribution:', error.message);
      return false;
    }

    // Successfully processed or already attributed
    clearStoredReferralCode();
    return !!data;
  } catch (err) {
    console.warn('Failed to sync referral code:', err);
    return false;
  }
}
