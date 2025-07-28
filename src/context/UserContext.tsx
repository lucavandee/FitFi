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
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Create user profile from session
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Welkom terug!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Er ging iets mis bij het inloggen');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
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
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Account succesvol aangemaakt!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Er ging iets mis bij het registreren');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Uitgelogd');
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Er ging iets mis bij het uitloggen');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      setUser(prev => prev ? { ...prev, ...updates } : null);
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