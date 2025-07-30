import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Create user profile from session - no extra fetch needed
          const userProfile: UserProfile = {
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
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const userProfile: UserProfile = {
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
          
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('E-mail of wachtwoord onjuist');
        return { success: false };
      }

      toast.success('Welkom terug!');
      return { success: true, redirectTo: '/dashboard' };
    } catch (error: any) {
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
        if (error.message.includes('User already registered')) {
          toast.error('Dit e-mailadres is al geregistreerd');
        } else {
          toast.error('Registratie mislukt. Probeer het opnieuw.');
        }
        return { success: false };
      }

      if (data.user) {
        toast.success('Account succesvol aangemaakt!');
        return { success: true, redirectTo: '/onboarding' };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Er ging iets mis bij het aanmaken van je account');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Uitgelogd');
        setUser(null);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
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