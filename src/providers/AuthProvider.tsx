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

    // 1) Probeer normale GoTrue signup (met mogelijke email confirm)
    const primary = await supabase().auth.signUp({
      email,
      password,
      options: { data, emailRedirectTo: AUTH_REDIRECT },
    });

    if (!primary.error) return; // ✅ klaar (mail verzonden of direct ingelogd indien confirm uit)

    // 2) Als het een server-side probleem lijkt (500/SMTP/template), val terug op admin function
    const status = (primary as any)?.error?.status ?? 0;
    const message = (primary as any)?.error?.message || '';
    const serverish = status >= 500 || /smtp|template|internal/i.test(message);

    if (!serverish) {
      // client-fout: zwak wachtwoord, ongeldig e-mail, bestaat al, etc.
      setLastError(`${(primary as any).error.code ?? 'signup_error'}: ${message}`);
      throw primary.error;
    }

    // 3) Fallback via Netlify Function (service-role), daarna direct inloggen
    const res = await fetch('/.netlify/functions/auth-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, data }),
    });

    if (!res.ok) {
      const body = await res.text();
      setLastError(`admin_signup_failed: HTTP ${res.status} ${body}`);
      throw new Error(`admin_signup_failed: ${res.status}`);
    }

    const { error: signInErr } = await supabase().auth.signInWithPassword({ email, password });
    if (signInErr) {
      setLastError(`signin_after_admin_failed: ${signInErr.message}`);
      throw signInErr;
    }
  }

  async function signIn(email: string, password: string) {
    setLastError(null);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      setLastError(`${(error as any)?.code ?? 'signin_error'}: ${error.message}`);
      throw error;
    }
  }

  async function signOut() {
    setLastError(null);
    const { error } = await supabase().auth.signOut();
    if (error) {
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
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}