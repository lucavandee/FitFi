import React, { useReducer, useState } from 'react';
import { ArrowRight, User, Palette, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { filterProductsByGender } from '../lib/matching';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Types for quiz state
export interface QuizAnswers {
  selectedGender?: 'male' | 'female' | 'neutral';
  selectedStyle?: string;
  selectedOccasions?: string[];
  selectedSeason?: string;
  comfortLevel?: number;
}

interface QuizState {
  answers: QuizAnswers;
  currentStep: number;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Quiz reducer actions
type QuizAction = 
  | { type: 'SET_GENDER'; payload: 'male' | 'female' | 'neutral' }
  | { type: 'SET_STYLE'; payload: string }
  | { type: 'SET_OCCASIONS'; payload: string[] }
  | { type: 'SET_SEASON'; payload: string }
  | { type: 'SET_COMFORT'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };

// Quiz reducer
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_GENDER':
      return {
        ...state,
        answers: { ...state.answers, selectedGender: action.payload },
        errors: { ...state.errors, gender: '' }
      };
    case 'SET_STYLE':
      return {
        ...state,
        answers: { ...state.answers, selectedStyle: action.payload },
        errors: { ...state.errors, style: '' }
      };
    case 'SET_OCCASIONS':
      return {
        ...state,
        answers: { ...state.answers, selectedOccasions: action.payload },
        errors: { ...state.errors, occasions: '' }
      };
    case 'SET_SEASON':
      return {
        ...state,
        answers: { ...state.answers, selectedSeason: action.payload },
        errors: { ...state.errors, season: '' }
      };
    case 'SET_COMFORT':
      return {
        ...state,
        answers: { ...state.answers, comfortLevel: action.payload }
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 4)
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.message }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: '' }
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };
    case 'RESET':
      return {
        answers: {},
        currentStep: 0,
        errors: {},
        isSubmitting: false
      };
    default:
      return state;
  }
}

// Initial state
const initialState: QuizState = {
  answers: {},
  currentStep: 0,
  errors: {},
  isSubmitting: false
};

// Gender options with proper icons and labels
const genderOptions = [
  {
    value: 'male' as const,
    label: 'Man',
    icon: '👨',
    description: 'Mannelijke stijladvies'
  },
  {
    value: 'female' as const,
    label: 'Vrouw', 
    icon: '👩',
    description: 'Vrouwelijke stijladvies'
  },
  {
    value: 'neutral' as const,
    label: 'Gender Neutraal',
    icon: '👤',
    description: 'Neutrale stijladvies'
  }
];

// Style options
const styleOptions = [
  {
    value: 'klassiek',
    label: 'Klassiek',
    description: 'Tijdloze elegantie en verfijnde stukken'
  },
  {
    value: 'casual_chic',
    label: 'Casual Chic',
    description: 'Moeiteloze elegantie met een relaxte twist'
  },
  {
    value: 'urban',
    label: 'Urban',
    description: 'Stoere stadslook met functionele details'
  },
  {
    value: 'streetstyle',
    label: 'Streetstyle',
    description: 'Authentieke streetwear met attitude'
  }
];

// Occasion options
const occasionOptions = [
  { value: 'werk', label: 'Werk', icon: '💼' },
  { value: 'casual', label: 'Casual', icon: '☕' },
  { value: 'uitgaan', label: 'Uitgaan', icon: '🎉' },
  { value: 'sport', label: 'Sport', icon: '🏃‍♀️' }
];

// Season options
const seasonOptions = [
  { value: 'lente', label: 'Lente', icon: '🌱' },
  { value: 'zomer', label: 'Zomer', icon: '☀️' },
  { value: 'herfst', label: 'Herfst', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' }
];

/**
 * Match quiz answers and filter products based on user preferences
 * @param answers - Complete quiz answers object
 * @returns Filtered and matched products/outfits
 */
export function matchQuizAnswers(answers: QuizAnswers) {
  console.log('[Quiz] Matching answers:', answers);
  
  // Here you would integrate with your matching logic
  // For now, we'll simulate the matching process
  
  try {
    // Validate required fields
    if (!answers.selectedGender) {
      throw new Error('Gender is required for matching');
    }
    
    // Mock products for demonstration
    const mockProducts = [
      { id: '1', name: 'Product 1', styleTags: ['men'], gender: 'male' },
      { id: '2', name: 'Product 2', styleTags: ['women'], gender: 'female' },
      { id: '3', name: 'Product 3', styleTags: ['unisex'], gender: 'neutral' }
    ];
    
    // Use the gender filtering from matching.ts
    const filteredProducts = filterProductsByGender(
      mockProducts as any[], 
      answers.selectedGender,
      { logWarnings: true }
    );
    
    console.log('[Quiz] Filtered products:', filteredProducts);
    
    return {
      success: true,
      products: filteredProducts,
      recommendations: `Found ${filteredProducts.length} products for ${answers.selectedGender}`,
      answers
    };
  } catch (error) {
    console.error('[Quiz] Matching error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      answers
    };
  }
}

/**
 * Main Quiz component with controlled state management
 */
export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { answers, currentStep, errors, isSubmitting } = state;

  // Validation functions
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Gender step
        if (!answers.selectedGender) {
          dispatch({ type: 'SET_ERROR', payload: { field: 'gender', message: 'Kies eerst je gender' } });
          return false;
        }
        return true;
      case 1: // Style step
        if (!answers.selectedStyle) {
          dispatch({ type: 'SET_ERROR', payload: { field: 'style', message: 'Kies een stijl die bij je past' } });
          return false;
        }
        return true;
      case 2: // Occasions step
        if (!answers.selectedOccasions || answers.selectedOccasions.length === 0) {
          dispatch({ type: 'SET_ERROR', payload: { field: 'occasions', message: 'Selecteer minimaal één gelegenheid' } });
          return false;
        }
        return true;
      case 3: // Season step
        if (!answers.selectedSeason) {
          dispatch({ type: 'SET_ERROR', payload: { field: 'season', message: 'Kies een seizoen' } });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 4) {
        handleSubmit();
      } else {
        dispatch({ type: 'NEXT_STEP' });
      }
    }
  };

  // Handle previous step
  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      // Bundle all answers and call matching function
      const result = matchQuizAnswers(answers);
      
      if (result.success) {
        // Navigate to results with the matched data
        navigate('/results', { 
          state: { 
            answers,
            matchedProducts: result.products,
            recommendations: result.recommendations
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: { field: 'submit', message: result.error || 'Er ging iets mis' } });
      }
    } catch (error) {
      console.error('[Quiz] Submit error:', error);
      dispatch({ type: 'SET_ERROR', payload: { field: 'submit', message: 'Er ging iets mis bij het verwerken van je antwoorden' } });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Handle gender selection
  const handleGenderSelect = (gender: 'male' | 'female' | 'neutral') => {
    dispatch({ type: 'SET_GENDER', payload: gender });
  };

  // Handle style selection
  const handleStyleSelect = (style: string) => {
    dispatch({ type: 'SET_STYLE', payload: style });
  };

  // Handle occasion toggle
  const handleOccasionToggle = (occasion: string) => {
    const currentOccasions = answers.selectedOccasions || [];
    const newOccasions = currentOccasions.includes(occasion)
      ? currentOccasions.filter(o => o !== occasion)
      : [...currentOccasions, occasion];
    
    dispatch({ type: 'SET_OCCASIONS', payload: newOccasions });
  };

  // Handle season selection
  const handleSeasonSelect = (season: string) => {
    dispatch({ type: 'SET_SEASON', payload: season });
  };

  // Handle comfort level change
  const handleComfortChange = (level: number) => {
    dispatch({ type: 'SET_COMFORT', payload: level });
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !answers.selectedGender;
      case 1:
        return !answers.selectedStyle;
      case 2:
        return !answers.selectedOccasions || answers.selectedOccasions.length === 0;
      case 3:
        return !answers.selectedSeason;
      default:
        return false;
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="gender"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <User className="w-12 h-12 text-turquoise mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Hoe identificeer je jezelf?
              </h2>
              <p className="text-text-secondary">
                Dit helpt ons de juiste stijladvies voor je te vinden
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleGenderSelect(option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${answers.selectedGender === option.value
                      ? 'bg-[#0D1B2A] text-white border-[#0D1B2A]'
                      : 'bg-white text-text-primary border-light-grey hover:bg-[#0D1B2A] hover:bg-opacity-80 hover:text-white'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </button>
              ))}
            </div>

            {errors.gender && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{errors.gender}</span>
              </div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="style"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Palette className="w-12 h-12 text-turquoise mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Welke stijl spreekt je aan?
              </h2>
              <p className="text-text-secondary">
                Kies de stijl die het beste bij jouw persoonlijkheid past
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStyleSelect(option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${answers.selectedStyle === option.value
                      ? 'bg-[#0D1B2A] text-white border-[#0D1B2A]'
                      : 'bg-white text-text-primary border-light-grey hover:bg-[#0D1B2A] hover:bg-opacity-80 hover:text-white'
                    }
                  `}
                >
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </button>
              ))}
            </div>

            {errors.style && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{errors.style}</span>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="occasions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 text-turquoise mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Voor welke gelegenheden?
              </h2>
              <p className="text-text-secondary">
                Selecteer alle gelegenheden waarvoor je outfits zoekt
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {occasionOptions.map((option) => {
                const isSelected = answers.selectedOccasions?.includes(option.value) || false;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOccasionToggle(option.value)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-center
                      ${isSelected
                        ? 'bg-[#0D1B2A] text-white border-[#0D1B2A]'
                        : 'bg-white text-text-primary border-light-grey hover:bg-[#0D1B2A] hover:bg-opacity-80 hover:text-white'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                );
              })}
            </div>

            {errors.occasions && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{errors.occasions}</span>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="season"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Calendar className="w-12 h-12 text-turquoise mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Voor welk seizoen?
              </h2>
              <p className="text-text-secondary">
                We passen onze aanbevelingen aan op het seizoen
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {seasonOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSeasonSelect(option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${answers.selectedSeason === option.value
                      ? 'bg-[#0D1B2A] text-white border-[#0D1B2A]'
                      : 'bg-white text-text-primary border-light-grey hover:bg-[#0D1B2A] hover:bg-opacity-80 hover:text-white'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>

            {errors.season && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{errors.season}</span>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="comfort"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Hoe belangrijk is comfort?
              </h2>
              <p className="text-text-secondary">
                Beweeg de slider om je voorkeur aan te geven
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={answers.comfortLevel || 5}
                onChange={(e) => handleComfortChange(parseInt(e.target.value))}
                className="w-full h-2 bg-light-grey rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Minder belangrijk</span>
                <span className="text-2xl font-bold text-turquoise">{answers.comfortLevel || 5}</span>
                <span>Zeer belangrijk</span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="quiz-container">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Stap {currentStep + 1} van 5</span>
          <span>{Math.round(((currentStep + 1) / 5) * 100)}%</span>
        </div>
        <div className="w-full bg-light-grey rounded-full h-2">
          <div 
            className="bg-turquoise h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Current step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex space-x-4">
        {currentStep > 0 && (
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="flex-1"
            disabled={isSubmitting}
          >
            Vorige
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={isNextDisabled() || isSubmitting}
          icon={<ArrowRight size={16} />}
          iconPosition="right"
          className="flex-1"
        >
          {isSubmitting ? 'Verwerken...' : currentStep === 4 ? 'Voltooien' : 'Volgende'}
        </Button>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{errors.submit}</span>
        </div>
      )}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre className="text-xs">{JSON.stringify(answers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Quiz;