import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock auth for now - just set loading to false
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - create a user session
    console.log('Mock login:', email);
    setUser({
      id: 'mock-user-id',
      name: 'Test User',
      email: email,
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
  };

  const register = async (name: string, email: string, password: string) => {
    // Mock registration - create a user session
    console.log('Mock registration:', name, email);
    setUser({
      id: 'mock-user-id',
      name: name,
      email: email,
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
  };

  const logout = async () => {
    // Mock logout
    console.log('Mock logout');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    // Mock profile update
    console.log('Mock profile update:', updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
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