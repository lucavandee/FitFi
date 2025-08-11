/**
 * Progress persistence utility for FitFi
 * Saves and restores quiz progress to prevent data loss
 */

interface QuizProgress {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userAgent: string;
  version: string;
}

interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  data: Record<string, any>;
  timestamp: number;
  sessionId: string;
  version: string;
}

const STORAGE_KEYS = {
  QUIZ_PROGRESS: 'fitfi-quiz-progress',
  ONBOARDING_PROGRESS: 'fitfi-onboarding-progress',
  SESSION_ID: 'fitfi-session-id'
} as const;

const CURRENT_VERSION = '1.0.0';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

/**
 * Check if stored data is still valid
 */
function _isDataValid(timestamp: number): boolean {
  return Date.now() - timestamp < MAX_AGE;
}

/**
 * Save quiz progress (internal)
 */
function _saveQuizProgress(
  currentStep: number,
  totalSteps: number,
  answers: Record<string, any>
): void {
  try {
    const progress: QuizProgress = {
      currentStep,
      totalSteps,
      answers,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      version: CURRENT_VERSION
    };
    
    localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
    
    // Track progress save
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_progress_saved', {
        event_category: 'persistence',
        event_label: `step_${currentStep}`,
        step: currentStep,
        total_steps: totalSteps
      });
    }
    
    console.log(`[📱 ProgressPersistence] Quiz progress saved: step ${currentStep}/${totalSteps}`);
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to save quiz progress:', error);
  }
}

/**
 * Load quiz progress (internal)
 */
function _loadQuizProgress(): QuizProgress | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    if (!stored) return null;
    
    const progress: QuizProgress = JSON.parse(stored);
    
    // Validate data
    if (!_isDataValid(progress.timestamp)) {
      console.log('[📱 ProgressPersistence] Quiz progress expired, clearing');
      _clearQuizProgress();
      return null;
    }
    
    // Version check
    if (progress.version !== CURRENT_VERSION) {
      console.log('[📱 ProgressPersistence] Quiz progress version mismatch, clearing');
      _clearQuizProgress();
      return null;
    }
    
    console.log(`[📱 ProgressPersistence] Quiz progress loaded: step ${progress.currentStep}/${progress.totalSteps}`);
    
    // Track progress load
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_progress_loaded', {
        event_category: 'persistence',
        event_label: `step_${progress.currentStep}`,
        step: progress.currentStep,
        total_steps: progress.totalSteps,
        age_minutes: Math.round((Date.now() - progress.timestamp) / 60000)
      });
    }
    
    return progress;
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to load quiz progress:', error);
    _clearQuizProgress();
    return null;
  }
}

/**
 * Clear quiz progress (internal)
 */
function _clearQuizProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
    console.log('[📱 ProgressPersistence] Quiz progress cleared');
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to clear quiz progress:', error);
  }
}

/**
 * Save onboarding progress
 */
export function saveOnboardingProgress(
  currentStep: string,
  completedSteps: string[],
  data: Record<string, any>
): void {
  try {
    // Only skip saving if we're explicitly told to skip
    const shouldSkipSave = data._skipSave === true;
    
    if (shouldSkipSave) {
      console.log('[📱 ProgressPersistence] Explicitly skipping save due to _skipSave flag');
      return;
    }
    
    const progress: OnboardingProgress = {
      currentStep,
      completedSteps,
      data,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      version: CURRENT_VERSION
    };
    
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, JSON.stringify(progress));
    
    // Track progress save
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_progress_saved', {
        event_category: 'persistence',
        event_label: currentStep,
        step: currentStep,
        completed_steps: completedSteps.length
      });
    }
    
    console.log(`[📱 ProgressPersistence] Onboarding progress saved: ${currentStep}`);
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to save onboarding progress:', error);
  }
}

/**
 * Load onboarding progress
 */
export function loadOnboardingProgress(): OnboardingProgress | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    if (!stored) return null;
    
    const progress: OnboardingProgress = JSON.parse(stored);
    
    // Validate data
    if (!_isDataValid(progress.timestamp)) {
      console.log('[📱 ProgressPersistence] Onboarding progress expired, clearing');
      _clearOnboardingProgress();
      return null;
    }
    
    // Version check
    if (progress.version !== CURRENT_VERSION) {
      console.log('[📱 ProgressPersistence] Onboarding progress version mismatch, clearing');
      _clearOnboardingProgress();
      return null;
    }
    
    console.log(`[📱 ProgressPersistence] Onboarding progress loaded: ${progress.currentStep}`);
    
    // Track progress load
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_progress_loaded', {
        event_category: 'persistence',
        event_label: progress.currentStep,
        step: progress.currentStep,
        completed_steps: progress.completedSteps.length,
        age_minutes: Math.round((Date.now() - progress.timestamp) / 60000)
      });
    }
    
    return progress;
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to load onboarding progress:', error);
    _clearOnboardingProgress();
    return null;
  }
}

/**
 * Check if onboarding context has valid data to prevent overwriting
 */
function shouldLoadSavedProgress(currentContextData: any): boolean {
  // Only load saved progress if context is empty or has minimal data
  const hasValidContextData = currentContextData && (
    currentContextData.gender || 
    (currentContextData.archetypes && currentContextData.archetypes.length > 0) ||
    currentContextData.season ||
    (currentContextData.occasions && currentContextData.occasions.length > 0)
  );
  
  return !hasValidContextData;
}
/**
 * Clear onboarding progress (internal)
 */
function _clearOnboardingProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    console.log('[📱 ProgressPersistence] Onboarding progress cleared');
  } catch (error) {
    console.error('[❌ ProgressPersistence] Failed to clear onboarding progress:', error);
  }
}

/**
 * Check if user has any saved progress (internal)
 */
function _hasSavedProgress(): {
  hasQuizProgress: boolean;
  hasOnboardingProgress: boolean;
  mostRecentType: 'quiz' | 'onboarding' | null;
  mostRecentTimestamp: number | null;
} {
  const quizProgress = _loadQuizProgress();
  const onboardingProgress = loadOnboardingProgress();
  
  const hasQuizProgress = !!quizProgress;
  const hasOnboardingProgress = !!onboardingProgress;
  
  let mostRecentType: 'quiz' | 'onboarding' | null = null;
  let mostRecentTimestamp: number | null = null;
  
  if (quizProgress && onboardingProgress) {
    if (quizProgress.timestamp > onboardingProgress.timestamp) {
      mostRecentType = 'quiz';
      mostRecentTimestamp = quizProgress.timestamp;
    } else {
      mostRecentType = 'onboarding';
      mostRecentTimestamp = onboardingProgress.timestamp;
    }
  } else if (quizProgress) {
    mostRecentType = 'quiz';
    mostRecentTimestamp = quizProgress.timestamp;
  } else if (onboardingProgress) {
    mostRecentType = 'onboarding';
    mostRecentTimestamp = onboardingProgress.timestamp;
  }
  
  return {
    hasQuizProgress,
    hasOnboardingProgress,
    mostRecentType,
    mostRecentTimestamp
  };
}

/**
 * Auto-save progress on page unload
 */
export function setupAutoSave(): void {
  // Save progress before page unload
  window.addEventListener('beforeunload', () => {
    // This will be called by individual components
    console.log('[📱 ProgressPersistence] Page unload detected');
  });
  
  // Save progress on visibility change (tab switch, minimize)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[📱 ProgressPersistence] Page hidden, auto-save triggered');
      // This will be called by individual components
    }
  });
  
  // Periodic auto-save every 30 seconds
  setInterval(() => {
    // This will be called by individual components if they have unsaved changes
    console.log('[📱 ProgressPersistence] Periodic auto-save check');
  }, 30000);
}

