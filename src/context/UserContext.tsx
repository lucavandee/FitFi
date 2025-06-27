import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase, { isValidUUID, TEST_USER_ID } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getUserById, createUser, updateUser, saveOutfit, unsaveOutfit } from '../services/supabaseService';

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
  password?: string; // Only used for registration, not stored in state
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  // Check Supabase connection and initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsSupabaseConnected(false);
          throw sessionError;
        }

        // For development, always use the test user ID
        const userProfile = await getUserById(TEST_USER_ID);
        
        if (userProfile) {
          setUser(userProfile);
          setIsSupabaseConnected(true);
        } else {
          // If test user doesn't exist, create it
          console.log('Test user not found, creating...');
          const newProfile = await createUser({
            name: 'Test User',
            email: 'test@example.com',
          });
          
          if (newProfile) {
            setUser(newProfile);
            setIsSupabaseConnected(true);
          } else {
            throw new Error('Failed to create test user');
          }
        }
        
      } catch (err) {
        console.error('Error initializing user:', err);
        setError('Failed to initialize user session');
        setIsSupabaseConnected(false);
        
        // Create a mock user as fallback
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

  // Save user to localStorage when it changes (as fallback)
  useEffect(() => {
    if (user) {
      localStorage.setItem('fitfi-user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For development, always use the test user
      const userProfile = await getUserById(TEST_USER_ID);
      
      if (userProfile) {
        setUser(userProfile);
        setIsSupabaseConnected(true);
        toast.success('Succesvol ingelogd!');
      } else {
        throw new Error('Test user not found');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      toast.error('Inloggen mislukt. Controleer je gegevens en probeer opnieuw.');
      setIsSupabaseConnected(false);
      
      // Fallback to mock login
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
      toast.success('Succesvol ingelogd (mock)!');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For development, always use the test user
      const userProfile = await getUserById(TEST_USER_ID);
      
      if (userProfile) {
        setUser(userProfile);
        setIsSupabaseConnected(true);
        toast.success('Account succesvol aangemaakt!');
      } else {
        // Create test user if it doesn't exist
        const newProfile = await createUser({
          name,
          email,
          password,
        });
        
        if (newProfile) {
          setUser(newProfile);
          setIsSupabaseConnected(true);
          toast.success('Account succesvol aangemaakt!');
        } else {
          throw new Error('Failed to create user profile');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      toast.error('Registratie mislukt. Probeer het opnieuw.');
      setIsSupabaseConnected(false);
      
      // Fallback to mock registration
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
      toast.success('Account succesvol aangemaakt (mock)!');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      localStorage.removeItem('fitfi-user');
      toast.success('Je bent uitgelogd');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error('Uitloggen mislukt. Probeer het opnieuw.');
      
      // Force logout even if Supabase fails
      setUser(null);
      localStorage.removeItem('fitfi-user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        // Create a new user profile if none exists
        const newUser: UserProfile = {
          id: TEST_USER_ID,
          name: updates.name || 'Test User',
          email: updates.email || 'test@example.com',
          gender: updates.gender,
          stylePreferences: updates.stylePreferences || {
            casual: 3,
            formal: 3,
            sporty: 3,
            vintage: 3,
            minimalist: 3
          },
          isPremium: false,
          savedRecommendations: []
        };
        
        setUser(newUser);
        localStorage.setItem('fitfi-user', JSON.stringify(newUser));
        return;
      }
      
      // Update user in Supabase
      const updatedUser = await updateUser(TEST_USER_ID, updates);
      
      if (updatedUser) {
        setUser(updatedUser);
        setIsSupabaseConnected(true);
        toast.success('Profiel bijgewerkt');
      } else {
        // Fallback to local update if Supabase fails
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
        toast.success('Profiel bijgewerkt (lokaal)');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      toast.error('Profiel bijwerken mislukt. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecommendation = async (recommendationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error('User not logged in');
      
      // Save to Supabase
      const success = await saveOutfit(TEST_USER_ID, recommendationId);
      
      // Update local state regardless of Supabase result
      const savedRecommendations = [...user.savedRecommendations];
      
      if (!savedRecommendations.includes(recommendationId)) {
        savedRecommendations.push(recommendationId);
        
        const updatedUser = { 
          ...user, 
          savedRecommendations 
        };
        
        setUser(updatedUser);
        localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
        toast.success('Outfit opgeslagen');
      }
    } catch (err: any) {
      console.error('Save recommendation error:', err);
      setError(err.message || 'Failed to save recommendation. Please try again.');
      toast.error('Outfit opslaan mislukt. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsaveRecommendation = async (recommendationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error('User not logged in');
      
      // Remove from Supabase
      const success = await unsaveOutfit(TEST_USER_ID, recommendationId);
      
      // Update local state regardless of Supabase result
      const savedRecommendations = user.savedRecommendations.filter(
        id => id !== recommendationId
      );
      
      const updatedUser = { 
        ...user, 
        savedRecommendations 
      };
      
      setUser(updatedUser);
      localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
      toast.success('Outfit verwijderd uit favorieten');
    } catch (err: any) {
      console.error('Unsave recommendation error:', err);
      setError(err.message || 'Failed to remove recommendation. Please try again.');
      toast.error('Outfit verwijderen mislukt. Probeer het opnieuw.');
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
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};