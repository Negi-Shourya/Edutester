import { useEffect, useState, type ReactNode } from 'react';
import { supabase, setRememberMe as setRememberFlag, isRememberMe } from '../lib/supabase';
import { AuthContext, type AuthContextValue, type AuthResult } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRemember] = useState(isRememberMe());

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
