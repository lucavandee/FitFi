import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { profileSyncService } from '@/services/data/profileSyncService';

const sb = supabase();

export interface FitFiUser {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  gender?: 'male' | 'female';
  role?: string;
  isPremium?: boolean;
  tier?: 'free' | 'premium' | 'founder';
  isAdmin?: boolean;
  stylePreferences?: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
}

export interface ColorProfile {
  temperature: "warm" | "koel" | "neutraal";
  value: "licht" | "medium" | "donker";
  contrast: "laag" | "medium" | "hoog";
  chroma: "zacht" | "helder";
  season: "lente" | "zomer" | "herfst" | "winter";
  paletteName: string;
  notes?: string[];
}

export interface UserProfile extends FitFiUser {
  stylePreferences: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
  colorProfile?: ColorProfile;
}

interface UserCtx {
  user: FitFiUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  isMember: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<FitFiUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

const UserContext = createContext<UserCtx | undefined>(undefined);

function buildUserData(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }, isAdminFromJWT: boolean): FitFiUser {
  return {
    id: supabaseUser.id,
    name: (supabaseUser.user_metadata?.name as string) || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    gender: supabaseUser.user_metadata?.gender as 'male' | 'female' | undefined,
    role: (supabaseUser.user_metadata?.role as string) || 'user',
    tier: 'free' as const,
    isAdmin: isAdminFromJWT
  };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const isMember = status === 'authenticated' && !!user?.id;

  useEffect(() => {
    if (!sb) {
      setStatus('unauthenticated');
      return;
    }

    let isSubscriptionActive = true;

    sb.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isSubscriptionActive) return;

        if (session?.user) {
          const isAdminFromJWT = session.user.app_metadata?.is_admin === true;
          const userData = buildUserData(session.user, isAdminFromJWT);
          setUser(userData);
          setStatus('authenticated');

          profileSyncService.getProfile().catch(() => {});

          sb.from('profiles')
            .select('tier, is_admin, gender, created_at')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (profile) {
                setUser(prev => prev ? {
                  ...prev,
                  tier: profile.tier as 'free' | 'premium' | 'founder',
                  gender: profile.gender as 'male' | 'female' | undefined,
                  created_at: profile.created_at
                } : null);
              }
            })
            .catch(() => {});
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      })
      .catch(() => {
        setStatus('unauthenticated');
      });

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (!isSubscriptionActive) return;

      if (session?.user) {
        const isAdminFromJWT = session.user.app_metadata?.is_admin === true;
        const userData = buildUserData(session.user, isAdminFromJWT);
        setUser(userData);
        setStatus('authenticated');

        profileSyncService.getProfile().catch(() => {});

        sb.from('profiles')
          .select('tier, is_admin, gender, created_at')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              setUser(prev => prev ? {
                ...prev,
                tier: profile.tier as 'free' | 'premium' | 'founder',
                gender: profile.gender as 'male' | 'female' | undefined,
                created_at: profile.created_at
              } : null);
            }
          })
          .catch(() => {});
      } else {
        setUser(null);
        setStatus('unauthenticated');
        try {
          localStorage.removeItem('fitfi_user');
        } catch (_) {}
      }
    });

    return () => {
      isSubscriptionActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!sb) return false;
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return false;
      return !!data?.session;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (!sb) return false;
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) return false;

      if (data?.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: profile } = await sb
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          await sb.from('profiles').insert({
            id: data.user.id,
            full_name: name || email.split('@')[0],
            referral_code: referralCode,
            tier: 'free'
          });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    if (!sb) return;
    try {
      await sb.auth.signOut();
    } catch (_) {}
  };

  const updateProfile = async (updates: Partial<FitFiUser>): Promise<void> => {
    if (!sb || !user) return;
    try {
      const { error } = await sb.auth.updateUser({ data: updates });
      if (!error) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (_) {}
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!sb) return false;
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return !error;
    } catch {
      return false;
    }
  };

  const value: UserCtx = {
    user,
    status,
    isLoading: status === 'loading',
    isMember,
    login,
    register,
    logout,
    updateProfile,
    resetPassword
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserCtx => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
