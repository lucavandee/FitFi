import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { useGamification } from './GamificationContext';
import { useNavigationService } from '../services/NavigationService';
import { getCurrentSeason } from '../engine/helpers';
import toast from 'react-hot-toast';
import { saveOnboardingProgress, loadOnboardingProgress, clearOnboardingProgress } from '../utils/progressPersistence';
import { generateSmartDefaults } from '../utils/smartDefaults';
import { env } from '../utils/env';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  if (env.DEBUG_MODE || import.meta.env.DEV) {
    console.log(`[🔍 OnboardingContext] ${message}`, data || '');
  }
};
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
  completeOnboarding: (completionData: Partial<OnboardingData>) => void;
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
  const [hasJustSubmitted, setHasJustSubmitted] = useState<boolean>(false);
  const [smartDefaults, setSmartDefaults] = useState<any>(null);
  
  // Initialize smart defaults
  useEffect(() => {
    const defaults = generateSmartDefaults();
    setSmartDefaults(defaults);
    
    if (env.DEBUG_MODE) {
      console.log('[🧠 OnboardingContext] Smart defaults generated:', defaults);
    }
  }, []);
  
  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadOnboardingProgress();
    if (savedProgress) {
      console.log('[📱 OnboardingContext] Loading saved progress:', savedProgress);
      
      setData(savedProgress.data);
      setCurrentStep(savedProgress.currentStep);
      
      // Show recovery option to user
      const ageMinutes = Math.round((Date.now() - savedProgress.timestamp) / 60000);
      toast.success(`Vorige sessie hersteld (${ageMinutes} min geleden)`, {
        duration: 5000,
        icon: '📱'
      });
      
      // Track progress recovery
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'progress_recovered', {
          event_category: 'persistence',
          event_label: 'onboarding',
          step: savedProgress.currentStep,
          age_minutes: ageMinutes
        });
      }
    }
  }, []);
  
  // Update data
  const updateData = (newData: Partial<OnboardingData>) => {
    console.debug('[OnboardingContext] updateData called with:', newData);
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
    
    // Auto-save progress
    const updatedData = { ...data, ...newData };
    saveOnboardingProgress(currentStep, updatedData.completedSteps || [], updatedData);
    
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
  
  // Complete onboarding with explicit data merge
  const completeOnboarding = (completionData: Partial<OnboardingData>) => {
    console.debug('[OnboardingContext] completeOnboarding called with:', completionData);
    setHasJustSubmitted(true); // Mark as just submitted to prevent auto-population
    
    setData(prev => {
      const mergedData = {
        ...prev,
        ...completionData,
        // Ensure required fields are present
        season: completionData.season || prev.season || smartDefaults?.season || 'herfst',
        occasions: completionData.occasions || prev.occasions || smartDefaults?.occasions || ['Casual'],
        archetypes: completionData.archetypes || prev.archetypes || [smartDefaults?.archetype] || ['casual_chic']
      };
      console.debug('[OnboardingContext] Merged completion data:', mergedData);
      return mergedData;
    });
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
    
    // Auto-save progress
    saveOnboardingProgress(step, data.completedSteps || [], data);
    
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
    const prevStep = currentStep;
    debugLog(`Step transition: ${prevStep} → ${step}`);
    setCurrentStep(step);
    
    // Auto-save progress
    saveOnboardingProgress(step, data.completedSteps || [], data);
    
    debugLog(`Navigating to route for step: ${step}`);
    // Navigate to the appropriate route
    switch (step) {
      case 'welcome':
        debugLog('Navigating to /onboarding');
        navigate('/onboarding');
        break;
      case 'gender_name':
        debugLog('Navigating to /onboarding/gender-name');
        navigate('/onboarding/gender-name');
        break;
      case 'archetype':
        debugLog('Navigating to /onboarding/archetype');
        navigate('/onboarding/archetype');
        break;
      case 'results':
        debugLog('Navigating to /onboarding/results with data:', data);
        navigate('/onboarding/results');
        break;
      default:
        debugLog('Navigating to default /onboarding');
        navigate('/onboarding');
    }
    debugLog(`Navigation completed for step: ${step}`);
    
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
    // Clear saved progress
    clearOnboardingProgress();
    
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
    debugLog('Starting submitOnboarding with data:', data);
    setIsSubmitting(true);
    setHasJustSubmitted(true);
    
    try {
      // Calculate quiz duration
      const quizDuration = Math.floor((Date.now() - (data.startTime || Date.now())) / 1000);
      debugLog('Quiz duration calculated:', quizDuration);
      
      // Ensure we have complete data with defaults
      const completeData = {
        ...data,
        season: data.season || smartDefaults?.season || 'herfst',
        occasions: data.occasions || smartDefaults?.occasions || ['Casual'],
        archetypes: data.archetypes || [smartDefaults?.archetype] || ['casual_chic'],
        name: data.name || 'Stijlzoeker'
      };
      
      debugLog('Complete submission data prepared:', completeData);
      
      debugLog('Starting profile update...');
      
      // Track quiz completion in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quiz_complete', {
          event_category: 'questionnaire',
          event_label: 'complete',
          quiz_duration: quizDuration,
          archetypes: completeData.archetypes.join(','),
          season: completeData.season,
          occasions: completeData.occasions.join(','),
          gender: data.gender,
          used_smart_defaults: !!smartDefaults,
          smart_defaults_confidence: smartDefaults?.confidence || 0
        });
      }
      
      debugLog('Updating user profile...');
      
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
      
      debugLog('Profile updated successfully');
      
      // Award gamification points for completing the quiz
      debugLog('Completing quiz gamification...');
      await completeQuiz();
      debugLog('Quiz gamification completed');
      
      // Update context with complete data
      setData(completeData);
      
      // Clear saved progress since we're completing
      clearOnboardingProgress();
      debugLog('Saved progress cleared');
      
      debugLog('Setting onboarding completion flag');
      setIsOnboardingComplete(true);
      
      // Show success toast
      toast.success('Stijlprofiel aangemaakt!');
      
    } catch (error) {
      debugLog('ERROR in submitOnboarding:', error);
      console.error('[ERROR] OnboardingContext submitOnboarding failed:', error);
      toast.error('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
      debugLog('submitOnboarding finally block executed');
    }
  };
  
  // Handle onboarding completion with redirect
  useEffect(() => {
    if (isOnboardingComplete) {
      console.log('[FIX] Onboarding marked complete, starting navigation to results');
      debugLog('Onboarding complete, starting navigation to results');
      navigationService.navigateToEnhancedResults(data, {
        loadingMessage: 'Je aanbevelingen worden geladen...',
        onError: (error) => {
          console.log('[FIX] Navigation error occurred, using fallback:', error);
          debugLog('Navigation error occurred:', error);
          console.error('[ERROR] OnboardingContext navigation failed:', error);
          // Emergency fallback
          navigate('/results', { state: { onboardingData: data } });
        }
      });
      console.log('[FIX] Navigation service called for results');
      debugLog('Navigation service called');
    }
  }, [isOnboardingComplete, navigate, data, navigationService]);
  
  // Check if onboarding is complete based on required fields
  useEffect(() => {
    const hasRequiredFields = data.gender && data.archetypes && data.archetypes.length > 0;
    if (hasRequiredFields && currentStep === 'results' && !isOnboardingComplete) {
      console.log('[FIX] All required fields present, marking as complete');
      debugLog('All required fields present, marking as complete');
      setIsOnboardingComplete(true);
    }
  }, [data, currentStep, isOnboardingComplete]);
  
  // Auto-populate missing onboarding data (but allow navigation to proceed)
  useEffect(() => {
    // Get current path to prevent auto-population during navigation
    const currentPath = window.location.pathname;
    
    // Only auto-populate if we're not in the middle of completion and data is truly empty
    const hasMinimalData = data.gender || (data.archetypes && data.archetypes.length > 0) || data.season;
    
    // Check if we should skip persistence (but NOT navigation)
    const shouldSkipPersistence = hasJustSubmitted || isSubmitting || currentStep === 'results' || currentPath !== '/onboarding';
    
    if (!hasMinimalData && !shouldSkipPersistence) {
      console.log('[🔧 OnboardingContext] Auto-populating missing onboarding data');
      
      const fallbackData: Partial<OnboardingData> = {};
      
      if (!data.gender) {
        fallbackData.gender = 'vrouw'; // Default to female
      }
      
      if (!data.archetypes || data.archetypes.length === 0) {
        fallbackData.archetypes = [smartDefaults?.archetype || 'casual_chic']; // Smart default archetype
      }
      
      if (!data.season) {
        fallbackData.season = smartDefaults?.season || 'herfst'; // Smart default season
      }
      
      if (!data.occasions || data.occasions.length === 0) {
        fallbackData.occasions = smartDefaults?.occasions || ['Casual']; // Smart default occasions
      }
      
      if (!data.name) {
        fallbackData.name = 'Stijlzoeker'; // Default name
      }
      
      // Only update if we actually have fallback data to add
      if (Object.keys(fallbackData).length > 0) {
        updateData(fallbackData);
      }
    } else if (shouldSkipPersistence) {
      console.log('[FIX] Skipping persistence for current state:', {
        hasJustSubmitted,
        isSubmitting,
        currentStep,
        currentPath
      });
      // LET OP: géén return meer hier, zodat dispatch & navigate altijd draaien
    }
    
    // ONGEACHTS skip-guard, voer altijd de volgende acties uit:
    console.log('[FIX] Auto-populate effect completed, data state:', data);
    console.log('[FIX] Current step after auto-populate:', currentStep);
  }, [data, updateData, smartDefaults, isSubmitting, hasJustSubmitted, currentStep]);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fitfi-onboarding', JSON.stringify(data));
    
    // Also save to progress persistence
    if (currentStep && data) {
      saveOnboardingProgress(currentStep, data.completedSteps || [], data);
    }
  }, [data]);
  
  // Setup auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (data && currentStep) {
        saveOnboardingProgress(currentStep, data.completedSteps || [], data);
        console.log('[📱 OnboardingContext] Auto-saved progress on page unload');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, currentStep]);
  
  // Context value
  const value: OnboardingContextType = {
    data,
    currentStep,
    setStep,
    updateData,
    completeOnboarding,
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