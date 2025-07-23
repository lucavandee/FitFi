/**
 * Centralized navigation service for managing all redirects and transitions
 * Provides consistent loading states, error handling, and user feedback
 */

import { NavigateFunction } from 'react-router-dom';
import toast from 'react-hot-toast';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  if (typeof window !== 'undefined' && (import.meta.env.DEV || localStorage.getItem('fitfi-debug') === 'true')) {
    console.log(`[🔍 NavigationService] ${message}`, data || '');
  }
};
export interface NavigationOptions {
  delay?: number;
  showLoading?: boolean;
  loadingMessage?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  fallbackRoute?: string;
  analytics?: {
    event: string;
    category: string;
    label?: string;
    value?: number;
  };
}

export interface NavigationState {
  isNavigating: boolean;
  currentRoute: string | null;
  targetRoute: string | null;
  progress: number;
  message: string;
  error: string | null;
}

class NavigationService {
  private navigate: NavigateFunction | null = null;
  private state: NavigationState = {
    isNavigating: false,
    currentRoute: null,
    targetRoute: null,
    progress: 0,
    message: '',
    error: null
  };
  private listeners: ((state: NavigationState) => void)[] = [];
  private progressInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the navigation service with a navigate function
   */
  initialize(navigate: NavigateFunction) {
    this.navigate = navigate;
    debugLog('Initialized with navigate function');
  }

  /**
   * Subscribe to navigation state changes
   */
  subscribe(listener: (state: NavigationState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get current navigation state
   */
  getState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<NavigationState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Start progress animation
   */
  private startProgress(message: string, duration: number = 2000) {
    this.updateState({
      isNavigating: true,
      progress: 0,
      message,
      error: null
    });

    let progress = 0;
    const increment = 100 / (duration / 50); // Update every 50ms

    this.progressInterval = setInterval(() => {
      progress += increment;
      if (progress >= 95) {
        progress = 95; // Stop at 95% until completion
      }
      this.updateState({ progress });
    }, 50);
  }

  /**
   * Complete progress animation
   */
  private completeProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.updateState({ progress: 100 });

    // Reset state after a short delay
    setTimeout(() => {
      this.updateState({
        isNavigating: false,
        currentRoute: null,
        targetRoute: null,
        progress: 0,
        message: '',
        error: null
      });
    }, 500);
  }

  /**
   * Handle navigation error
   */
  private handleError(error: Error, options?: NavigationOptions) {
    debugLog('ERROR in navigation:', error);
    console.error('[ERROR] NavigationService navigation failed:', error);

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.updateState({
      isNavigating: false,
      progress: 0,
      error: error.message
    });

    // Call error callback if provided
    if (options?.onError) {
      options.onError(error);
    }

    // Show error toast
    toast.error(`Navigatie fout: ${error.message}`);

    // Try fallback route if provided
    if (options?.fallbackRoute && this.navigate) {
      debugLog(`Trying fallback route: ${options.fallbackRoute}`);
      setTimeout(() => {
        this.navigate!(options.fallbackRoute!);
      }, 1000);
    }
  }

  /**
   * Navigate to a route with enhanced UX
   */
  async navigateTo(
    route: string, 
    options: NavigationOptions = {},
    state?: any
  ): Promise<void> {
    if (!this.navigate) {
      throw new Error('NavigationService not initialized. Call initialize() first.');
    }

    const {
      delay = 300,
      showLoading = true,
      loadingMessage = 'Navigeren...',
      onStart,
      onComplete,
      analytics,
      fallbackRoute
    } = options;

    try {
      debugLog(`Starting navigation to: ${route}`);

      // Update state
      this.updateState({
        currentRoute: window.location.pathname,
        targetRoute: route
      });

      // Call start callback
      if (onStart) {
        onStart();
      }

      // Track analytics if provided
      if (analytics && typeof window.gtag === 'function') {
        window.gtag('event', analytics.event, {
          event_category: analytics.category,
          event_label: analytics.label || route,
          value: analytics.value
        });
      }

      // Start progress if loading is enabled
      if (showLoading) {
        this.startProgress(loadingMessage, delay + 500);
      }

      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, delay));

      // Perform navigation
      if (state) {
        debugLog(`Navigating with state:`, state);
        this.navigate(route, { state });
      } else {
        debugLog(`Navigating without state`);
        this.navigate(route);
      }

      // Complete progress
      if (showLoading) {
        this.completeProgress();
      }

      // Call complete callback
      if (onComplete) {
        onComplete();
      }

      debugLog(`Successfully navigated to: ${route}`);

    } catch (error) {
      this.handleError(error as Error, options);
      throw error;
    }
  }

  /**
   * Navigate to quiz results with enhanced UX
   */
  async navigateToResults(data?: any, options?: Partial<NavigationOptions>): Promise<void> {
    return this.navigateTo('/results', {
      delay: 500,
      loadingMessage: 'Je stijlprofiel wordt gemaakt...',
      fallbackRoute: '/onboarding',
      analytics: {
        event: 'navigate_to_results',
        category: 'user_journey',
        label: 'quiz_completion'
      },
      ...options
    }, data ? { answers: data } : undefined);
  }

  /**
   * Navigate to enhanced results with onboarding data
   */
  async navigateToEnhancedResults(onboardingData?: any, options?: Partial<NavigationOptions>): Promise<void> {
    return this.navigateTo('/results', {
      delay: 300,
      loadingMessage: 'Aanbevelingen worden geladen...',
      fallbackRoute: '/onboarding',
      analytics: {
        event: 'navigate_to_enhanced_results',
        category: 'user_journey',
        label: 'onboarding_completion'
      },
      ...options
    }, onboardingData ? { onboardingData } : undefined);
  }

  /**
   * Navigate to onboarding with error recovery
   */
  async navigateToOnboarding(options?: Partial<NavigationOptions>): Promise<void> {
    return this.navigateTo('/onboarding', {
      delay: 200,
      loadingMessage: 'Onboarding laden...',
      analytics: {
        event: 'navigate_to_onboarding',
        category: 'user_journey',
        label: 'restart_flow'
      },
      ...options
    });
  }

  /**
   * Navigate to next onboarding step
   */
  async navigateToNextStep(step: string, options?: Partial<NavigationOptions>): Promise<void> {
    const stepRoutes: Record<string, string> = {
      'gender_name': '/onboarding/gender-name',
      'archetype': '/onboarding/archetype',
      'season': '/onboarding/season',
      'occasion': '/onboarding/occasion',
      'preferences': '/onboarding/preferences',
      'results': '/onboarding/results'
    };

    const route = stepRoutes[step] || '/onboarding';

    return this.navigateTo(route, {
      delay: 200,
      loadingMessage: `Naar ${step}...`,
      analytics: {
        event: 'navigate_onboarding_step',
        category: 'onboarding',
        label: step
      },
      ...options
    });
  }

  /**
   * Emergency navigation (no loading, immediate)
   */
  emergencyNavigate(route: string): void {
    if (!this.navigate) {
      window.location.href = route;
      return;
    }

    debugLog(`Emergency navigation to: ${route}`);
    this.navigate(route);
  }

  /**
   * Reset navigation state
   */
  reset(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.updateState({
      isNavigating: false,
      currentRoute: null,
      targetRoute: null,
      progress: 0,
      message: '',
      error: null
    });
  }
}

// Create singleton instance
export const navigationService = new NavigationService();

// Hook for using navigation service in components
export const useNavigationService = () => {
  return navigationService;
};

export default navigationService;