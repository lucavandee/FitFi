import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getReferralCookie, clearReferralCookie } from '../utils/referralUtils';
import { storageAvailable } from '../utils/storageUtils';

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
  const [profileTimeout, setProfileTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for existing session on mount with storage fallback support
    const checkSession = async () => {
      try {
        console.log('[Auth] Checking existing session...');
        
        // Log storage availability for debugging
        if (import.meta.env.DEV) {
          console.log('[Auth] Storage available:', storageAvailable());
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[Auth] Found existing session:', session.user.id);
          await createUserProfileFromSession(session);
        } else {
          console.log('[Auth] No existing session found');
        }
      } catch (error) {
        console.error('[Auth] Session check error:', error);
        
        // Show storage warning if needed
        if (!storageAvailable() && import.meta.env.DEV) {
          console.warn('[Auth] localStorage not available - using cookie fallback');
        }
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
    const timeoutId = setTimeout(() => {
      console.warn('[Auth] Profile loading timeout - proceeding with fallback');
      setUser({
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
      });
      setIsLoading(false);
    }, 8000); // 8 second timeout
    
    setProfileTimeout(timeoutId);

    try {
      console.log('[Auth] Creating user profile from session...');
      
      // Load profile with fail-safe auto-creation
      const profile = await loadProfileWithAutoCreate(session.user.id);
      
      const userProfile: UserProfile = {
        id: session.user.id,
        name: profile?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        gender: profile?.gender,
        stylePreferences: {
          casual: 3,
          formal: 3,
          sporty: 3,
          vintage: 3,
          minimalist: 3
        },
        isPremium: profile?.is_premium || false,
        savedRecommendations: []
      };

      setUser(userProfile);
      console.log('[Auth] User profile set successfully:', userProfile.id);
      
    } catch (error) {
      console.error('[Auth] Error creating user profile from session:', error);
      
      // Sentry breadcrumb
      if (typeof window.Sentry !== 'undefined') {
        window.Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Profile fetch error',
          level: 'error',
          data: { 
            error_code: error?.code || 'unknown',
            user_id: session.user.id 
          }
        });
      }
      
      // Fallback profile to prevent blocking
      setUser({
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
      });
    } finally {
      if (profileTimeout) {
        clearTimeout(profileTimeout);
        setProfileTimeout(null);
      }
      setIsLoading(false);
    }
  };

  // Fail-safe profile loading with auto-creation
  const loadProfileWithAutoCreate = async (userId: string) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status === 406) {
        // Profile doesn't exist - try to create it
        console.log('[Auth] Profile not found, creating new profile');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            full_name: null // Will be updated later
          });

        if (insertError) {
          console.error('[Auth] Error creating profile:', insertError);
          return {}; // Return empty profile to allow app to continue
        }
        
        return {}; // Return empty profile after creation
      }

      if (error) {
        console.error('[Auth] Profile fetch error:', error);
        return {}; // Return empty profile to allow app to continue
      }

      return data;
      
    } catch (error) {
      console.error('[Auth] Profile loading exception:', error);
      return {}; // Return empty profile to allow app to continue
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
        // Verify session was properly stored
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Session storage failed - likely private browsing
          toast.error('Sessie opslaan mislukt. Probeer de standaard browser of schakel privé-modus uit.');
          return { success: false };
        }
        
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
        
        // Verify session was properly stored
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Session storage failed - likely private browsing
          toast.error('Account aangemaakt maar sessie opslaan mislukt. Log in via de standaard browser.');
          return { success: false };
        }
        
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
      }
    } catch (error) {
      console.error('[Auth] Logout exception:', error);
      toast.error('Er ging iets mis bij het uitloggen');
    } finally {
      setIsLoading(false);
    }
  };

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