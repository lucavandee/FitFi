import React, { createContext, useContext, useState } from 'react';

/**
 * Clean OnboardingContext for route-driven flow
 * No auto-populate, no navigation logic, just data management
 */
export interface OnboardingData {
  gender?: 'man' | 'vrouw';
  name?: string;
  archetypes?: string[];
  season?: 'lente' | 'zomer' | 'herfst' | 'winter';
  occasions?: string[];
  preferences?: {
    tops?: boolean;
    bottoms?: boolean;
    outerwear?: boolean;
    shoes?: boolean;
    accessories?: boolean;
  };
  // Metadata
  startTime?: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateAnswers: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
  isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean initial state - no auto-population
  const initialState: OnboardingData = {
    gender: undefined,
    name: '',
    archetypes: [],
    season: undefined,
    occasions: [],
    preferences: {
      tops: true,
      bottoms: true,
      outerwear: true,
      shoes: true,
      accessories: true
    },
    startTime: Date.now()
  };

  const [data, setData] = useState<OnboardingData>(initialState);

  // Simple update function
  const updateAnswers = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  // Reset function
  const resetData = () => {
    setData(initialState);
  };

  // Check if onboarding is complete
  const isComplete = !!(
    data.gender &&
    data.archetypes && data.archetypes.length > 0 &&
    data.season &&
    data.occasions && data.occasions.length > 0
  );

  const value: OnboardingContextType = {
    data,
    updateAnswers,
    resetData,
    isComplete
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};