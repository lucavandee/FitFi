import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase, {
  isValidUUID,
  TEST_USER_ID,
  getUserById,
  createUser,
  updateUser,
  saveOutfit,
  unsaveOutfit
} from '../lib/supabase';
import toast from 'react-hot-toast';

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
  gender?: 'male' | 'female' | 'neutral';
  photoUrl?: string;
  stylePreferences: StylePreference;
  isPremium: boolean;
  savedRecommendations: string[];
  password?: string; // Alleen voor registratie
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
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const userProfile = await getUserById(TEST_USER_ID);
        if (userProfile) {
          setUser(userProfile);
        } else {
          const newUser = await createUser({ name: 'Test User', email: 'test@example.com' });
          if (newUser) setUser(newUser);
          else throw new Error('Kon testgebruiker niet aanmaken');
        }

        setIsSupabaseConnected(true);
      } catch (err) {
        console.error('Init error:', err);
        setError('Fout bij inladen gebruiker');
        setIsSupabaseConnected(false);

        const mockUser: UserProfile = {
          id: TEST_USER_ID,
          name: 'Test User',
          email: 'test@example.com',
          gender: 'neutral',
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

        setUser(mockUser);
        localStorage.setItem('fitfi-user', JSON.stringify(mockUser));
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
      const userProfile = await getUserById(TEST_USER_ID);
      if (userProfile) {
        setUser(userProfile);
        toast.success('Ingelogd!');
        setIsSupabaseConnected(true);
      } else {
        throw new Error('Gebruiker niet gevonden');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Login mislukt (mock)');
      setIsSupabaseConnected(false);

      const mockUser: UserProfile = {
        id: TEST_USER_ID,
        name: 'Test User',
        email,
        stylePreferences: {
          casual: 4,
          formal: 3,
          sporty: 2,
          vintage: 5,
          minimalist: 4
        },
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
      const existing = await getUserById(TEST_USER_ID);
      if (existing) {
        setUser(existing);
        toast.success('Account al aanwezig!');
      } else {
        const created = await createUser({ name, email, password });
        if (created) {
          setUser(created);
          toast.success('Registratie succesvol!');
        } else {
          throw new Error('Aanmaken mislukt');
        }
      }

      setIsSupabaseConnected(true);
    } catch (err: any) {
      console.error(err);
      setIsSupabaseConnected(false);

      const mockUser: UserProfile = {
        id: TEST_USER_ID,
        name,
        email,
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
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout geforceerd ondanks fout:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('fitfi-user');
      toast.success('Uitgelogd');
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const updated = await updateUser(TEST_USER_ID, updates);
      if (updated) {
        setUser(updated);
        toast.success('Profiel bijgewerkt');
      } else {
        setUser(prev => {
          const fallback = { ...prev!, ...updates };
          localStorage.setItem('fitfi-user', JSON.stringify(fallback));
          return fallback;
        });
        toast.success('Profiel lokaal bijgewerkt');
      }
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
      await saveOutfit(user.id, id);
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
      await unsaveOutfit(user.id, id);
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
