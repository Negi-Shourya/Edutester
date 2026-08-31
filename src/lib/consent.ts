import { supabase } from './supabase';
import type { ExamType } from './exam';

export const CURRENT_CONSENT_VERSION = '2026-v1.0';
export const CONSENT_STORAGE_KEY = 'edutester_pending_consent';
export const AUTH_FLOW_KEY = 'edutester_auth_flow';

export interface PendingConsentData {
  consentVersion: string;
  consentType: string;
  consentedAt: string;
  entryTime: string;
  examTrack: ExamType;
  userAgent: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  ageDeclaration: boolean;
}

/**
 * Sets the intended authentication flow ('signup' vs 'login')
 * to distinguish registration from login attempts.
 */
export function setAuthFlow(flow: 'signup' | 'login'): void {
  try {
    sessionStorage.setItem(AUTH_FLOW_KEY, flow);
    localStorage.setItem(AUTH_FLOW_KEY, flow);
  } catch {
    // Ignore storage restrictions
  }
}

/**
 * Gets the current auth flow intent.
 */
export function getAuthFlow(): 'signup' | 'login' | null {
  try {
    const val = sessionStorage.getItem(AUTH_FLOW_KEY) || localStorage.getItem(AUTH_FLOW_KEY);
    if (val === 'signup' || val === 'login') return val;
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the auth flow flag from storage.
 */
export function clearAuthFlow(): void {
  try {
    sessionStorage.removeItem(AUTH_FLOW_KEY);
    localStorage.removeItem(AUTH_FLOW_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Stores consent and entry timestamp into localStorage/sessionStorage
 * right before triggering Google OAuth redirection.
 */
export function savePendingConsent(examTrack: ExamType = 'jee'): void {
  setAuthFlow('signup');
  const now = new Date().toISOString();
  const consentData: PendingConsentData = {
    consentVersion: CURRENT_CONSENT_VERSION,
    consentType: 'signup_dpdpa_consent',
    consentedAt: now,
    entryTime: now,
    examTrack,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    termsAccepted: true,
    privacyAccepted: true,
    ageDeclaration: true,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
  } catch {
    try {
      sessionStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    } catch {
      // Ignore storage errors in restricted iframe environments
    }
  }
}

/**
 * Retrieves pending consent recorded prior to OAuth redirect.
 */
export function getPendingConsent(): PendingConsentData | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY) || sessionStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingConsentData;
  } catch {
    return null;
  }
}

/**
 * Clears pending consent from local storage after persistence.
 */
export function clearPendingConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    sessionStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Determines whether a user account was just created in the current OAuth callback
 * (within the last 30 seconds) vs an existing registered account.
 */
export function isBrandNewAccount(user: { created_at?: string | null } | null | undefined): boolean {
  if (!user?.created_at) return false;
  const createdAtMs = new Date(user.created_at).getTime();
  if (isNaN(createdAtMs)) return false;

  const ageMs = Date.now() - createdAtMs;
  // Account created within the last 30 seconds indicates a brand new registration
  return ageMs >= 0 && ageMs < 30000;
}

/**
 * Persists pending consent to the Supabase database if a user just signed up / authenticated.
 */
export async function syncPendingConsentToDatabase(): Promise<boolean> {
  const pending = getPendingConsent();
  if (!pending) return false;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return false;
    }

    const { error } = await supabase.rpc('record_user_consent', {
      p_consent_type: pending.consentType,
      p_consent_version: pending.consentVersion,
      p_exam_track: pending.examTrack,
      p_consented_at: pending.consentedAt,
      p_entry_time: pending.entryTime,
      p_user_agent: pending.userAgent,
      p_metadata: {
        platform: 'web',
        url: typeof window !== 'undefined' ? window.location.href : '',
        screen_resolution:
          typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    if (error) {
      // Fallback direct insert if RPC is unavailable
      await supabase.from('user_consents').insert({
        user_id: sessionData.session.user.id,
        email: sessionData.session.user.email,
        consent_type: pending.consentType,
        consent_version: pending.consentVersion,
        consented_at: pending.consentedAt,
        entry_time: pending.entryTime,
        exam_track: pending.examTrack,
        user_agent: pending.userAgent,
        terms_accepted: pending.termsAccepted,
        privacy_accepted: pending.privacyAccepted,
        age_declaration: pending.ageDeclaration,
        metadata: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }

    clearPendingConsent();
    clearAuthFlow();
    return true;
  } catch (err) {
    console.debug('Consent sync error (will retry next session):', err);
    return false;
  }
}

let lastEntryLogged = 0;

/**
 * Records a user entry / login timestamp for audit trail and compliance.
 */
export async function recordUserEntryLog(
  entryType: 'signup' | 'login' | 'session_entry' = 'session_entry',
  path: string = typeof window !== 'undefined' ? window.location.pathname : '/'
): Promise<void> {
  const now = Date.now();
  if (now - lastEntryLogged < 3000) return; // Debounce 3s
  lastEntryLogged = now;

  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const entryTime = new Date().toISOString();

    const { error } = await supabase.rpc('record_user_entry', {
      p_entry_type: entryType,
      p_path: path,
      p_user_agent: userAgent,
      p_entry_time: entryTime,
      p_metadata: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        auth_status: user ? 'authenticated' : 'anonymous',
      },
    });

    if (error && user) {
      // Fallback insert
      await supabase.from('user_entry_logs').insert({
        user_id: user.id,
        email: user.email,
        entry_type: entryType,
        entry_time: entryTime,
        path,
        user_agent: userAgent,
        metadata: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }
  } catch {
    // Fail silently so user interaction is never blocked
  }
}
