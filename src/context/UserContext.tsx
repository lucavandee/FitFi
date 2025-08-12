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
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<FitFiUser>) => Promise<void>;
  status: 'loading' | 'authenticated' | 'unauthenticated';
};

const Ctx = createContext<UserCtx>({ 
  user: null, 
  session: null, 
  loading: true,
  logout: async () => {},
  updateProfile: async () => {},
  status: 'loading'
});

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
          console.log("[UserContext] Supabase client not available - running in offline mode");
          if (!mounted) return;
          setSession(null);
          setUser(null);
          setErr(null);
          setLoading(false);
          return;
        }

        console.log("[UserContext] Initializing auth state...");
        const { data, error } = await sb.auth.getSession();
        if (error) {
          console.warn("[UserContext] getSession error:", error);
          if (!mounted) return;
          setErr(error.message ?? String(error));
        } else {
          console.log("[UserContext] Session loaded successfully");
        }
        
        const current = data?.session ?? null;
        if (mounted) {
          setSession(current);
          setUser(current?.user ? mapUser(current.user) : null);
          console.log("[UserContext] User state:", current?.user ? "authenticated" : "unauthenticated");
        }

        const { data: sub } = sb.auth.onAuthStateChange((_event, newSession) => {
          if (!mounted) return;
          console.log("[UserContext] Auth state changed:", _event, newSession?.user ? "authenticated" : "unauthenticated");
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
          console.log("[UserContext] Initialization complete");
    }

    init();
    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  const logout = async () => {
    const sb = supabase();
    if (!sb) {
      console.warn("[UserContext] Cannot logout - Supabase not available");
      return;
    }
    
    try {
      const { error } = await sb.auth.signOut();
      if (error) {
        console.error("[UserContext] Logout error:", error);
      } else {
        console.log("[UserContext] Logout successful");
      }
    } catch (error) {
      console.error("[UserContext] Logout failed:", error);
    }
  };

  const updateProfile = async (updates: Partial<FitFiUser>) => {
    const sb = supabase();
    if (!sb || !user?.id) {
      console.warn("[UserContext] Cannot update profile - not authenticated or Supabase unavailable");
      return;
    }
    
    try {
      const { error } = await sb.auth.updateUser({
        data: updates
      });
      
      if (error) {
        console.error("[UserContext] Profile update error:", error);
      } else {
        console.log("[UserContext] Profile updated successfully");
        // Update local state
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error("[UserContext] Profile update failed:", error);
    }
  };

  const status = loading ? 'loading' : user ? 'authenticated' : 'unauthenticated';

  const value = useMemo<UserCtx>(() => ({
    user, 
    session, 
    loading, 
    error: err,
    logout,
    updateProfile,
    status
  }), [user, session, loading, err, logout, updateProfile, status]);

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