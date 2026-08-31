import { useEffect, useState, type ReactNode } from 'react';
import { supabase, setRememberMe as setRememberFlag, isRememberMe } from '../lib/supabase';
import { AuthContext, type AuthContextValue, type AuthResult } from './auth-context';
import {
  syncPendingConsentToDatabase,
  recordUserEntryLog,
  getAuthFlow,
  clearAuthFlow,
  getPendingConsent,
  isBrandNewAccount,
} from '../lib/consent';

function hasPotentialStoredSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('-auth-token') || key === 'supabase.auth.token')) {
        return true;
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('-auth-token') || key === 'supabase.auth.token')) {
        return true;
      }
    }
  } catch {
    // Storage access restricted in some iframes
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [loading, setLoading] = useState(() => hasPotentialStoredSession());
  const [authError, setAuthError] = useState<AuthContextValue['authError']>(null);
  const [rememberMe, setRemember] = useState(isRememberMe());

  // GoTrue reports OAuth failures back in the URL fragment (e.g.
  // #error=...&error_description=...). Surface them instead of failing
  // silently, then scrub the URL so a refresh doesn't loop the error.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const urlError = params.get('error') ?? params.get('error_description');
    if (urlError) {
      setAuthError(urlError);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleSessionResolution = async (
      nextSession: AuthContextValue['session'],
      isSignInEvent: boolean = false
    ) => {
      if (nextSession?.user) {
        const flow = getAuthFlow();
        const pending = getPendingConsent();

        // If the user arrived through the "Login" page as a brand new account
        // created in the current OAuth callback (without prior registration)
        if (flow === 'login' && !pending && isBrandNewAccount(nextSession.user)) {
          clearAuthFlow();
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signup')) {
            window.location.href = '/signup?notice=unregistered';
          }
          return;
        }

        clearAuthFlow();
        setAuthError(null);
        void syncPendingConsentToDatabase();

        if (isSignInEvent) {
          void recordUserEntryLog('login');
        } else {
          void recordUserEntryLog('session_entry');
        }
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) setAuthError(error.message);
        await handleSessionResolution(data.session, false);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      await handleSessionResolution(nextSession, event === 'SIGNED_IN');
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    const target = redirectTo || `${window.location.origin}/dashboard`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: target },
    });
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    target: string
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, target_exam: target },
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    // Clear local auth state first so nothing redirects into protected
    // pages while the (possibly slow) server-side signout is in flight.
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // The session is already gone locally; a network failure here must
      // not leave the user stranded on a protected page.
    }
  };

  const updateRememberMe = (remember: boolean) => {
    setRememberFlag(remember);
    setRemember(remember);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        rememberMe,
        setRememberMe: updateRememberMe,
        signInWithGoogle,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
