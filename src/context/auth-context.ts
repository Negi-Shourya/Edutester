import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  error: string | null;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, target: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
