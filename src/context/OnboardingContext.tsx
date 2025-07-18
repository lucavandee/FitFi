import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { useGamification } from './GamificationContext';
import { getCurrentSeason } from '../engine/helpers';
import toast from 'react-hot-toast';

// Define the types for our onboarding data
export interface OnboardingData {
  // Step 1: Welcome - no data
  
  // Step 2: Gender & Name
  gender?: 'man' | 'vrouw';
  name?: string;
  
  // Step 3: Archetype
  archetypes?: string[];
  
  // Step 4: Season
  season?: 'lente' | 'zomer' | 'herfst' | 'winter';
  
  // Step 5: Occasion
  occasions?: string[];
  
  // Step 6: Preferences (optional)
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
  currentStep: string;
  setStep: (step: string) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  completeStep: (step: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetOnboarding: () => void;
  isStepCompleted: (step: string) => boolean;
  submitOnboarding: () => Promise<void>;
  isSubmitting: boolean;
}

// Create the context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Define the step order
const STEP_ORDER = [
  'welcome',
  'gender_name',
  'archetype',
  'season',
  'occasion',
  'preferences',
  'results'
];

// Provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { updateProfile } = useUser();
  const { completeQuiz } = useGamification();
  
  // Initialize state
  const [data, setData] = useState<OnboardingData>(() => {
    // Try to load from localStorage
    const savedData = localStorage.getItem('fitfi-onboarding');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error);
      }
    }
    
    // Default data
    return {
      startTime: Date.now(),
      completedSteps: []
    };
  });
  
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Update data
  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
    
    // Track step data in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_data', {
        event_category: 'questionnaire',
        event_label: currentStep,
        step_name: currentStep,
        data: JSON.stringify(newData)
      });
    }
  };
  
  // Mark a step as completed
  const completeStep = (step: string) => {
    setData(prevData => {
      const completedSteps = [...(prevData.completedSteps || [])];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      return {
        ...prevData,
        completedSteps
      };
    });
    
    // Track step completion in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_complete', {
        event_category: 'questionnaire',
        event_label: step,
        step_name: step
      });
    }
  };
  
  // Check if a step is completed
  const isStepCompleted = (step: string): boolean => {
    return data.completedSteps?.includes(step) || false;
  };
  
  // Set the current step and navigate to it
  const setStep = (step: string) => {
    console.log('[🔍 OnboardingContext] Setting step:', step);
    setCurrentStep(step);
    
    // Navigate to the appropriate route
    switch (step) {
      case 'welcome':
        navigate('/onboarding');
        break;
      case 'gender_name':
        navigate('/onboarding/gender-name');
        break;
      case 'archetype':
        navigate('/onboarding/archetype');
        break;
      case 'results':
        console.log('[🔍 OnboardingContext] Navigating to results with data:', data);
        navigate('/onboarding/results');
        break;
      default:
        navigate('/onboarding');
    }
    
    // Track step navigation in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: step,
        step_name: step
      });
    }
  };
  
  // Go to the next step
  const goToNextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]);
    }
  };
  
  // Go to the previous step
  const goToPreviousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1]);
    }
  };
  
  // Reset the onboarding process
  const resetOnboarding = () => {
    setData({
      startTime: Date.now(),
      completedSteps: []
    });
    setCurrentStep('welcome');
    navigate('/onboarding');
    
    // Track reset in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_reset', {
        event_category: 'questionnaire',
        event_label: 'reset'
      });
    }
  };
  
  // Submit the onboarding data
  const submitOnboarding = async () => {
    console.log('[🔍 OnboardingContext] Submitting onboarding data:', data);
    setIsSubmitting(true);
    
    try {
      // Calculate quiz duration
      const quizDuration = Math.floor((Date.now() - (data.startTime || Date.now())) / 1000);
      
      // Track quiz completion in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quiz_complete', {
          event_category: 'questionnaire',
          event_label: 'complete',
          quiz_duration: quizDuration,
          archetypes: data.archetypes?.join(','),
          season: data.season,
          occasions: data.occasions?.join(','),
          gender: data.gender
        });
      }
      
      // Update user profile with onboarding data
      await updateProfile({
        gender: data.gender === 'man' ? 'male' : 'female',
        name: data.name,
        // Convert archetypes to style preferences
        stylePreferences: {
          casual: data.archetypes?.includes('casual_chic') ? 5 : 3,
          formal: data.archetypes?.includes('klassiek') ? 5 : 3,
          sporty: data.archetypes?.includes('streetstyle') ? 5 : 3,
          vintage: data.archetypes?.includes('retro') ? 5 : 3,
          minimalist: data.archetypes?.includes('urban') ? 5 : 3
        }
      });
      
      // Award gamification points for completing the quiz
      await completeQuiz();
      
      console.log('[🔍 OnboardingContext] Navigating to results page');
      // Navigate to results page
      navigate('/results', { state: { onboardingData: data } });
      
      // Show success toast
      toast.success('Stijlprofiel aangemaakt!');
      
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
      toast.error('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Ensure we always have valid onboarding data
  useEffect(() => {
    // Auto-populate missing onboarding data with sensible defaults
    if (!data.gender || !data.archetypes || data.archetypes.length === 0) {
      console.log('[🔧 OnboardingContext] Auto-populating missing onboarding data');
      
      const fallbackData: Partial<OnboardingData> = {};
      
      if (!data.gender) {
        fallbackData.gender = 'vrouw'; // Default to female
      }
      
      if (!data.archetypes || data.archetypes.length === 0) {
        fallbackData.archetypes = ['casual_chic']; // Default archetype
      }
      
      if (!data.season) {
        fallbackData.season = 'herfst'; // Default season
      }
      
      if (!data.occasions || data.occasions.length === 0) {
        fallbackData.occasions = ['Casual']; // Default occasion
      }
      
      if (!data.name) {
        fallbackData.name = 'Stijlzoeker'; // Default name
      }
      
      // Only update if we actually have fallback data to add
      if (Object.keys(fallbackData).length > 0) {
        updateData(fallbackData);
      }
    }
  }, [data, updateData]);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fitfi-onboarding', JSON.stringify(data));
  }, [data]);
  
  // Context value
  const value: OnboardingContextType = {
    data,
    currentStep,
    setStep,
    updateData,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    resetOnboarding,
    isStepCompleted,
    submitOnboarding,
    isSubmitting
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook to use the onboarding context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};