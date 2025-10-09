import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Get singleton client
const sb = supabase();

export interface FitFiUser {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  role?: string;
  isPremium?: boolean;
  tier?: 'free' | 'premium' | 'founder';
  stylePreferences?: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
}

export interface UserProfile extends FitFiUser {
  stylePreferences: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  
  // Determine if user is a member (has account = member for now)
  const isMember = status === 'authenticated' && !!user?.id;

  useEffect(() => {
    if (!sb) {
      setStatus('unauthenticated');
      return;
    }

    // Get initial session
    sb.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('🔍 [UserContext] getSession result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id?.substring(0, 8) + '...' || 'none',
        error: error?.message || 'none'
      });

      if (session?.user) {
        // Fetch tier from profiles table
        let userTier: 'free' | 'premium' | 'founder' = 'free';
        try {
          const { data: profile } = await sb
            .from('profiles')
            .select('tier')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.tier) {
            userTier = profile.tier as 'free' | 'premium' | 'founder';
          }
        } catch (e) {
          console.warn('[UserContext] Could not fetch tier:', e);
        }

        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          gender: session.user.user_metadata?.gender,
          role: session.user.user_metadata?.role || 'user',
          tier: userTier
        };

        setUser(userData);
        setStatus('authenticated');

        console.log('✅ [UserContext] User authenticated:', {
          id: userData.id.substring(0, 8) + '...',
          tier: userData.tier,
          hasEmail: !!userData.email
        });
      } else {
        setUser(null);
        setStatus('unauthenticated');
        console.log('🔓 [UserContext] No session - user logged out');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch tier from profiles table
        let userTier: 'free' | 'premium' | 'founder' = 'free';
        try {
          const { data: profile } = await sb
            .from('profiles')
            .select('tier')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.tier) {
            userTier = profile.tier as 'free' | 'premium' | 'founder';
          }
        } catch (e) {
          console.warn('[UserContext] Could not fetch tier:', e);
        }

        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          gender: session.user.user_metadata?.gender,
          role: session.user.user_metadata?.role || 'user',
          tier: userTier
        };

        setUser(userData);
        setStatus('authenticated');

        console.log('✅ [UserContext] User authenticated:', {
          id: userData.id.substring(0, 8) + '...',
          tier: userData.tier,
          hasEmail: !!userData.email
        });
      } else {
        setUser(null);
        setStatus('unauthenticated');
        // Clear localStorage
        try {
          localStorage.removeItem('fitfi_user');
        } catch (e) {
          console.warn('[UserContext] Could not clear user from localStorage:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!sb) {
      console.error('❌ [UserContext] Supabase client not initialized');
      return false;
    }

    try {
      console.log('🔐 [UserContext] Attempting login for:', email);
      const { data, error } = await sb.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('❌ [UserContext] Login failed:');
        console.error('   Message:', error.message);
        console.error('   Status:', error.status);
        console.error('   Name:', error.name);
        console.error('   Full error:', error);
        return false;
      }

      if (data?.session) {
        console.log('✅ [UserContext] Login successful, session created');
        return true;
      }

      console.warn('⚠️ [UserContext] Login succeeded but no session returned');
      return false;
    } catch (error) {
      console.error('❌ [UserContext] Login exception:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (!sb) return false;
    
    try {
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      return !error;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    if (!sb) return;
    
    try {
      await sb.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<FitFiUser>): Promise<void> => {
    if (!sb || !user) return;

    try {
      const { error } = await sb.auth.updateUser({
        data: updates
      });

      if (!error) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!sb) {
      console.error('❌ [UserContext] Supabase client not initialized');
      return false;
    }

    try {
      console.log('🔐 [UserContext] Sending password reset email to:', email);
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ [UserContext] Password reset failed:');
        console.error('   Message:', error.message);
        console.error('   Status:', error.status);
        return false;
      }

      console.log('✅ [UserContext] Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [UserContext] Password reset exception:', error);
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