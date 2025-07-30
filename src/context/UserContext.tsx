import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getReferralCookie, clearReferralCookie } from '../utils/referralUtils';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female' | 'neutral';
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
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        console.log('[Auth] Checking existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[Auth] Found existing session:', session.user.id);
          await createUserProfileFromSession(session);
        } else {
          console.log('[Auth] No existing session found');
        }
      } catch (error) {
        console.error('[Auth] Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event, session?.user?.id);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          await createUserProfileFromSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to create user profile from session
  const createUserProfileFromSession = async (session: any) => {
    try {
      console.log('[Auth] Creating user profile from session...');
      // Try to get existing profile from Supabase
      const { data: existingProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      let userProfile: UserProfile;

      if (existingProfile && !error) {
        console.log('[Auth] Found existing user profile');
        // Use existing profile from database
        userProfile = {
          id: existingProfile.id,
          name: existingProfile.name,
          email: existingProfile.email,
          gender: existingProfile.gender,
          stylePreferences: {
            casual: 3,
            formal: 3,
            sporty: 3,
            vintage: 3,
            minimalist: 3
          },
          isPremium: existingProfile.is_premium || false,
          savedRecommendations: []
        };
      } else {
        console.log('[Auth] Creating new user profile');
        // Create new profile from session metadata
        userProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
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

        // Insert new user into database
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            gender: userProfile.gender,
            is_premium: userProfile.isPremium
          }]);

        if (insertError) {
          console.error('[Auth] Error creating user profile:', insertError);
        }
      }

      setUser(userProfile);
      console.log('[Auth] User profile set successfully:', userProfile.id);
    } catch (error) {
      console.error('[Auth] Error creating user profile from session:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      setIsLoading(true);
      console.log('[Auth] Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('[Auth] Login response:', { data: data?.user?.id, error: error?.message });
      if (error) {
        toast.error(error.message);
        return { success: false };
      }

      if (data.user) {
        toast.success('Welkom terug!');
        return { success: true, redirectTo: '/dashboard' };
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Er ging iets mis bij het inloggen');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      setIsLoading(true);
      console.log('[Auth] Attempting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      console.log('[Auth] Registration response:', { data: data?.user?.id, error: error?.message });
      if (error) {
        console.error('[Auth] Registration error:', error);
        
        if (error.message.includes('User already registered')) {
          toast.error('Dit e-mailadres is al geregistreerd');
        } else if (error.message.includes('Password should be')) {
          toast.error('Wachtwoord moet minimaal 6 karakters bevatten');
        } else {
          toast.error('Registratie mislukt. Probeer het opnieuw.');
        }
        return { success: false };
      }

      if (data.user) {
        console.log('[Auth] Registration successful for user:', data.user.id);
        toast.success('Account succesvol aangemaakt!');
        
        // Process referral if exists
        const referralCode = getReferralCookie();
        if (referralCode) {
          try {
            await fetch(`/api/referral/register?code=${referralCode}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'signup',
                user_id: data.user.id
              })
            });
            clearReferralCookie();
          } catch (error) {
            console.error('[Auth] Error processing referral:', error);
          }
        }
        
        return { success: true, redirectTo: `/onboarding?user=${data.user.id}` };
      }

      console.warn('[Auth] Registration succeeded but no user data received');
      return { success: false };
    } catch (error) {
      console.error('[Auth] Registration exception:', error);
      toast.error('Verbindingsfout. Controleer je internetverbinding.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('[Auth] Attempting logout...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Logout error:', error);
        toast.error(error.message);
      } else {
        console.log('[Auth] Logout successful');
        toast.success('Uitgelogd');
        setUser(null);
          } catch (error) {
      console.error('[Auth] Logout exception:', error);
      toast.error('Er ging iets mis bij het uitloggen');
    } finally {
      setIsLoading(false);
    }
      };
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Update local state immediately
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Update in Supabase database
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          gender: updates.gender,
          is_premium: updates.isPremium
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