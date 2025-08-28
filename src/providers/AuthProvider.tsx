import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AUTH_REDIRECT } from '@/config/app';

type AuthCtx = {
  user: import('@supabase/supabase-js').User | null;
  loading: boolean;
  lastError: string | null;
  signUp: (email: string, password: string, data?: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthCtx['user']>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase().auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, data?: Record<string, any>) {
    setLastError(null);
    const { error } = await supabase().auth.signUp({
      email,
      password,
      options: {
        data,
        emailRedirectTo: AUTH_REDIRECT, // <= MOET in Supabase allowlist staan
      },
    });
    if (error) {
      console.error('Supabase signUp error', {
        code: (error as any)?.code,
        status: (error as any)?.status,
        message: error.message,
      });
      setLastError(`${(error as any)?.code ?? 'signup_error'}: ${error.message}`);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    setLastError(null);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase signIn error', error);
      setLastError(`${(error as any)?.code ?? 'signin_error'}: ${error.message}`);
      throw error;
    }
  }

  async function signOut() {
    setLastError(null);
    const { error } = await supabase().auth.signOut();
    if (error) {
      console.error('Supabase signOut error', error);
      setLastError(error.message);
      throw error;
    }
  }

  return (
    <Ctx.Provider value={{ user, loading, lastError, signUp, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth within AuthProvider');
  return c;
}