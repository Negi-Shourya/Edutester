import { useEffect, useState, type ReactNode } from 'react';
import { supabase, setRememberMe as setRememberFlag, isRememberMe } from '../lib/supabase';
import { AuthContext, type AuthContextValue, type AuthResult } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [loading, setLoading] = useState(true);
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
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) setAuthError(error.message);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) setAuthError(null);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
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
