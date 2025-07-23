import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateSmartDefaults } from '../utils/smartDefaults';

/**
 * Simplified OnboardingContext for route-driven flow
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
  completedSteps?: string[];
}

interface OnboardingContextType {
  data: OnboardingData;
  updateAnswers: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
  isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with smart defaults
  const smartDefaults = generateSmartDefaults();
  
  const initialState: OnboardingData = {
    gender: undefined,
    name: '',
    archetypes: [],
    season: smartDefaults.season,
    occasions: smartDefaults.occasions,
    preferences: {
      tops: true,
      bottoms: true,
      outerwear: true,
      shoes: true,
      accessories: true
    },
    startTime: Date.now(),
    completedSteps: []
  };

  const [data, setData] = useState<OnboardingData>(() => {
    // Try to load from localStorage for persistence
    const saved = localStorage.getItem('fitfi-onboarding-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error);
      }
    }
    return initialState;
  });

  // Update answers function
  const updateAnswers = (newData: Partial<OnboardingData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      
      // Save to localStorage
      localStorage.setItem('fitfi-onboarding-data', JSON.stringify(updated));
      
      return updated;
    });
  };

  // Reset data function
  const resetData = () => {
    setData(initialState);
    localStorage.removeItem('fitfi-onboarding-data');
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