import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female' | 'neutral';
  role?: 'admin' | 'user';
  stylePreferences: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
  isPremium: boolean;
  savedRecommendations: string[];
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  authEventPending: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to ensure user profile exists in database
const ensureUserProfileExists = async (user: any): Promise<void> => {
  try {
    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // If profile doesn't exist, create it
    if (!data) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referral_count: 0
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    }
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authEventPending, setAuthEventPending] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Ensure profile exists in database
          await ensureUserProfileExists(session.user);
          
          // Create user profile from session - no extra fetch needed
          const userProfile: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            stylePreferences: {
              casual: 3,
              formal: 3,
              sporty: 3,
              vintage: 3,
              minimalist: 3
            },
            isPremium: false,
            savedRecommendations: []
          };
          
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[UserContext] Auth state change:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (!session?.user) break;
            
            // Ensure profile exists in database
            await ensureUserProfileExists(session.user);
            
            const userProfile: UserProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'user',
              stylePreferences: {
                casual: 3,
                formal: 3,
                sporty: 3,
                vintage: 3,
                minimalist: 3
              },
              isPremium: false,
              savedRecommendations: []
            };
            
            setUser(userProfile);
            setAuthEventPending(false);
            break;
            
          case 'TOKEN_REFRESHED':
            if (!session?.user) break;
            
            // Don't reset authEventPending for token refresh
            const refreshedProfile: UserProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'user',
              stylePreferences: {
                casual: 3,
                formal: 3,
                sporty: 3,
                vintage: 3,
                minimalist: 3
              },
              isPremium: false,
              savedRecommendations: []
            };
            
            setUser(refreshedProfile);
            break;
            
          case 'TOKEN_REFRESH_FAILED':
            console.warn('[UserContext] Token refresh failed, signing out user');
            setAuthEventPending(false);
            setUser(null);
            toast.error('Je sessie is verlopen, log opnieuw in.');
            break;
            
          case 'SIGNED_OUT':
            setUser(null);
            setAuthEventPending(false);
            break;
            
          default:
            // Handle any other auth events
            setIsLoading(false);
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      setAuthEventPending(true);
      
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 60000)
      );
      
      const { error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password
        }),
        timeout
      ]) as any;

      if (error) {
        setAuthEventPending(false);
        toast.error('E-mail of wachtwoord onjuist');
        return { success: false };
      }

      toast.success('Welkom terug!');
      return { success: true };
    } catch (error: any) {
      setAuthEventPending(false);
      console.error('Login error:', error);
      
      if (error.message === 'Auth timeout') {
        toast.error('Server reageert traag – probeer het opnieuw.');
      } else {
        toast.error('Er ging iets mis bij het inloggen');
      }
      return { success: false };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      setAuthEventPending(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        setAuthEventPending(false);
        if (error.message.includes('User already registered')) {
          toast.error('Dit e-mailadres is al geregistreerd');
        } else {
          toast.error('Registratie mislukt. Probeer het opnieuw.');
        }
        return { success: false };
      }

      if (data.user) {
        toast.success('Account succesvol aangemaakt!');
        // Don't reset authEventPending here - let onAuthStateChange handle it
        return { success: true, redirectTo: '/onboarding' };
      }

      setAuthEventPending(false);
      return { success: false };
    } catch (error: any) {
      setAuthEventPending(false);
      console.error('Registration error:', error);
      toast.error('Er ging iets mis bij het aanmaken van je account');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      setAuthEventPending(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Uitgelogd');
        // Don't manually set user to null - let onAuthStateChange handle it
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Er ging iets mis bij het uitloggen');
    } finally {
      setAuthEventPending(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Update local state immediately
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Update in Supabase database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        toast.error('Er ging iets mis bij het bijwerken van je profiel');
        // Revert local state on error
        setUser(prev => prev ? { ...prev, ...user } : null);
        return;
      }
      
      toast.success('Profiel bijgewerkt');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Er ging iets mis bij het bijwerken van je profiel');
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    authEventPending,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};