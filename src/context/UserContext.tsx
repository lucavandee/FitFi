import React, { createContext, useContext, useState, useEffect } from 'react';

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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('fitfi-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const mockUser: UserProfile = {
        id: '123',
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
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const mockUser: UserProfile = {
        id: Date.now().toString(),
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
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('fitfi-user');
      setUser(null);
    } catch (err) {
      setError('Failed to logout. Please try again.');
      console.error(err);
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
          id: Date.now().toString(),
          name: updates.name || '',
          email: updates.email || '',
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
      } else {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecommendation = async (recommendationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('User not logged in');
      
      const savedRecommendations = [...user.savedRecommendations];
      
      if (!savedRecommendations.includes(recommendationId)) {
        savedRecommendations.push(recommendationId);
        
        const updatedUser = { 
          ...user, 
          savedRecommendations 
        };
        
        setUser(updatedUser);
        localStorage.setItem('fitfi-user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError('Failed to save recommendation. Please try again.');
      console.error(err);
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
        saveRecommendation
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