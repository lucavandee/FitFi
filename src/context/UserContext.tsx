import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '../services/DataRouter';
import toast from 'react-hot-toast';
import { TEST_USER_ID } from '../lib/supabase';
import { env } from '../utils/env';

export type StylePreference = {
  casual: number;
  formal: number;
  sporty: number;
  vintage: number;
  minimalist: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  photoUrl?: string;
  stylePreferences: StylePreference;
  isPremium: boolean;
  savedRecommendations: string[];
  password?: string;
};

type UserContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveRecommendation: (recommendationId: string) => Promise<void>;
  unsaveRecommendation: (recommendationId: string) => Promise<void>;
  isSupabaseConnected: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(env.USE_SUPABASE);

  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userProfile = await getUserData(TEST_USER_ID);
        if (userProfile) {
          setUser(userProfile);
          setIsSupabaseConnected(true);
        } else {
          throw new Error('Kon gebruiker niet laden');
        }
      } catch (err) {
        console.error('User initialization error:', err);
        setError('Fout bij inladen gebruiker');
        setIsSupabaseConnected(false);
        const stored = localStorage.getItem('fitfi-user');
        const parsedUser = stored ? JSON.parse(stored) : null;
        if (parsedUser) {
          try {
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing saved user:', parseError);
            const mockUser: UserProfile = {
              id: TEST_USER_ID,
              name: 'Test User',
              email: 'test@example.com',
              gender: 'female',
              stylePreferences: { casual: 3, formal: 3, sporty: 3, vintage: 3, minimalist: 3 },
              isPremium: false,
              savedRecommendations: []
            };
            setUser(mockUser);
            localStorage.setItem('fitfi-user', JSON.stringify(mockUser));
          }
        } else {
          const mockUser: UserProfile = {
            id: TEST_USER_ID,
            name: 'Test User',
            email: 'test@example.com',
            gender: 'female',
            stylePreferences: { casual: 3, formal: 3, sporty: 3, vintage: 3, minimalist: 3 },
            isPremium: false,
            savedRecommendations: []
          };
          setUser(mockUser);
          localStorage.setItem('fitfi-user', JSON.stringify(mockUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fitfi-user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getUserData(TEST_USER_ID);
      if (userProfile) {
        setUser(userProfile);
        toast.success('Ingelogd!');
        setIsSupabaseConnected(true);
      } else {
        throw new Error('Gebruiker niet gevonden');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Login mislukt');
      setIsSupabaseConnected(false);
      const mockUser: UserProfile = {
        id: TEST_USER_ID,
        name: 'Test User',
        email,
        stylePreferences: { casual: 4, formal: 3, sporty: 2, vintage: 5, minimalist: 4 },
        isPremium: false,
        savedRecommendations: []
      };
      setUser(mockUser);
      localStorage.setItem('fitfi-user', JSON.stringify(mockUser));
      toast.success('Mock login geslaagd!');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getUserData(TEST_USER_ID);
      if (userProfile) {
        const updatedUser = { ...userProfile, name, email };
        setUser(updatedUser);
        localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
        toast.success('Account aangemaakt!');
        setIsSupabaseConnected(true);
      } else {
        throw new Error('Kon geen account aanmaken');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Registratie mislukt');
      setIsSupabaseConnected(false);
      const mockUser: UserProfile = {
        id: TEST_USER_ID,
        name,
        email,
        gender: 'female',
        stylePreferences: { casual: 3, formal: 3, sporty: 3, vintage: 3, minimalist: 3 },
        isPremium: false,
        savedRecommendations: []
      };
      setUser(mockUser);
      localStorage.setItem('fitfi-user', JSON.stringify(mockUser));
      toast.success('Mock account aangemaakt!');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('fitfi-user');
      toast.success('Uitgelogd');
    } catch (err) {
      console.warn('Logout geforceerd ondanks fout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('Geen gebruiker om bij te werken');
      const updatedUser = {
        ...user,
        ...updates,
        stylePreferences: {
          ...user.stylePreferences,
          ...(updates.stylePreferences || {})
        }
      };
      setUser(updatedUser);
      localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
      toast.success('Profiel bijgewerkt');
    } catch (err) {
      console.error(err);
      toast.error('Fout bij bijwerken profiel');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecommendation = async (id: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = { ...user, savedRecommendations: [...user.savedRecommendations, id] };
      setUser(updated);
      localStorage.setItem('fitfi-user', JSON.stringify(updated));
      toast.success('Opgeslagen');
    } catch (err) {
      console.error(err);
      toast.error('Opslaan mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const unsaveRecommendation = async (id: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = {
        ...user,
        savedRecommendations: user.savedRecommendations.filter(r => r !== id)
      };
      setUser(updated);
      localStorage.setItem('fitfi-user', JSON.stringify(updated));
      toast.success('Verwijderd');
    } catch (err) {
      console.error(err);
      toast.error('Verwijderen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        saveRecommendation,
        unsaveRecommendation,
        isSupabaseConnected
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
