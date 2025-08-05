import { useReducer, useCallback } from 'react';

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  bodyProfile: any | null;
  isComplete: boolean;
  progress: number;
  errors: Record<string, string>;
}

export type OnboardingAction =
  | { type: 'SET_ANSWER'; questionId: string; answer: any }
  | { type: 'SET_BODY_PROFILE'; profile: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'RESET' }
  | { type: 'COMPLETE' };

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 10,
  answers: {},
  bodyProfile: null,
  isComplete: false,
  progress: 0,
  errors: {}
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = {
        ...state.answers,
        [action.questionId]: action.answer
      };
      
      return {
        ...state,
        answers: newAnswers,
        progress: Math.min((Object.keys(newAnswers).length / state.totalSteps) * 100, 100)
      };

    case 'SET_BODY_PROFILE':
      return {
        ...state,
        bodyProfile: action.profile
      };

    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        ...state,
        currentStep: nextStep,
        progress: (nextStep / state.totalSteps) * 100
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };

    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors
      };

    case 'COMPLETE':
      return {
        ...state,
        isComplete: true,
        progress: 100
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useOnboardingReducer() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const setAnswer = useCallback((questionId: string, answer: any) => {
    dispatch({ type: 'SET_ANSWER', questionId, answer });
  }, []);

  const setBodyProfile = useCallback((profile: any) => {
    dispatch({ type: 'SET_BODY_PROFILE', profile });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const complete = useCallback(() => {
    dispatch({ type: 'COMPLETE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setAnswer,
    setBodyProfile,
    nextStep,
    prevStep,
    setError,
    clearError,
    complete,
    reset
  };
}