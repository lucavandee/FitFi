import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type FitFiUser = {
  id: string;
  email?: string;
  role?: string | null;
};

type UserContextValue = {
  user: FitFiUser | null;
  status: AuthStatus;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  status: 'loading',
  isLoading: true,
  logout: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    const sb = supabase();
    if (!sb) {
      setStatus('unauthenticated');
      return;
    }

    // 1) Initial snapshot
    (async () => {
      const { data } = await sb.auth.getSession();
      if (!active) return;
      const session = data?.session ?? null;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? undefined, role: (session.user as any).role ?? null });
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    })();

    // 2) Live updates
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? undefined, role: (session.user as any).role ?? null });
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      logout: async () => {
        await supabase.auth.signOut();
        setUser(null);
        setStatus('unauthenticated');
      },
    }),
    [user, status]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);