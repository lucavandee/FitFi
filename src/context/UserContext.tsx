import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type FitFiUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type UserCtx = {
  user: FitFiUser | null;
  session: Session | null;
  loading: boolean;
  error?: string | null;
};

const Ctx = createContext<UserCtx>({ user: null, session: null, loading: true });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let mounted = true;

    async function init() {
      try {
        const sb = supabase();
        if (!sb) {
          if (!mounted) return;
          setSession(null);
          setUser(null);
          setErr(null);
          setLoading(false);
          return;
        }

        const { data, error } = await sb.auth.getSession();
        if (error) {
          console.warn("[UserContext] getSession error:", error);
          if (!mounted) return;
          setErr(error.message ?? String(error));
        }
        const current = data?.session ?? null;
        if (mounted) {
          setSession(current);
          setUser(current?.user ? mapUser(current.user) : null);
        }

        const { data: sub } = sb.auth.onAuthStateChange((_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ? mapUser(newSession.user) : null);
        });

        unsub = () => {
          try {
            sub?.subscription?.unsubscribe?.();
          } catch {}
        };
      } catch (e: any) {
        console.error("[UserContext] init failed:", e);
        if (mounted) setErr(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  const value = useMemo<UserCtx>(() => ({
    user, session, loading, error: err,
  }), [user, session, loading, err]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useUser() {
  return useContext(Ctx);
}

function mapUser(u: User): FitFiUser {
  return {
    id: u.id,
    email: u.email,
    name: (u.user_metadata as any)?.name ?? null,
  };
}

// Legacy compatibility exports
export type UserProfile = FitFiUser & {
  gender?: 'male' | 'female';
  stylePreferences?: Record<string, number>;
  isPremium?: boolean;
  savedRecommendations?: string[];
};

// Legacy compatibility functions
export const useUserProfile = () => {
  const { user } = useUser();
  return {
    user: user ? {
      ...user,
      gender: undefined,
      stylePreferences: {},
      isPremium: false,
      savedRecommendations: []
    } as UserProfile : null,
    isLoading: false
  };
};