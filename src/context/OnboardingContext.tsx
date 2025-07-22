import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { useGamification } from './GamificationContext';
import { getCurrentSeason } from '../engine/helpers';
import { useNavigationService } from '../services/NavigationService';
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
  const navigationService = useNavigationService();
  
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
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  
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
      
      // Ensure we have complete data with defaults
      const completeData = {
        ...data,
        season: data.season || 'herfst',
        occasions: data.occasions || ['Casual'],
        archetypes: data.archetypes || ['casual_chic']
      };
      
      // Track quiz completion in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quiz_complete', {
          event_category: 'questionnaire',
          event_label: 'complete',
          quiz_duration: quizDuration,
          archetypes: completeData.archetypes.join(','),
          season: completeData.season,
          occasions: completeData.occasions.join(','),
          gender: data.gender
        });
      }
      
      // Update user profile with onboarding data
      await updateProfile({
        gender: data.gender === 'man' ? 'male' : 'female',
        name: data.name,
        // Convert archetypes to style preferences
        stylePreferences: {
          casual: completeData.archetypes.includes('casual_chic') ? 5 : 3,
          formal: completeData.archetypes.includes('klassiek') ? 5 : 3,
          sporty: completeData.archetypes.includes('streetstyle') ? 5 : 3,
          vintage: completeData.archetypes.includes('retro') ? 5 : 3,
          minimalist: completeData.archetypes.includes('urban') ? 5 : 3
        }
      });
      
      // Award gamification points for completing the quiz
      await completeQuiz();
      
      // Update context with complete data
      setData(completeData);
      
      console.log('[🔍 OnboardingContext] Onboarding completed, setting completion flag');
      setIsOnboardingComplete(true);
      
      // Show success toast
      toast.success('Stijlprofiel aangemaakt!');
      
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
      toast.error('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle onboarding completion with redirect
  useEffect(() => {
    if (isOnboardingComplete) {
      console.log('[🔍 OnboardingContext] Onboarding complete, redirecting to results in 300ms');
      navigationService.navigateToEnhancedResults(data, {
        loadingMessage: 'Je aanbevelingen worden geladen...',
        onError: (error) => {
          console.error('[OnboardingContext] Navigation error:', error);
          // Emergency fallback
          navigate('/results', { state: { onboardingData: data } });
        }
      });
    }
  }, [isOnboardingComplete, navigate, data, navigationService]);
  
  // Check if onboarding is complete based on required fields
  useEffect(() => {
    const hasRequiredFields = data.gender && data.archetypes && data.archetypes.length > 0;
    if (hasRequiredFields && currentStep === 'results' && !isOnboardingComplete) {
      console.log('[🔍 OnboardingContext] All required fields present, marking as complete');
      setIsOnboardingComplete(true);
    }
  }, [data, currentStep, isOnboardingComplete]);
  
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