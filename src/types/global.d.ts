/**
 * Global type definitions for the application
 */

// Google Analytics
interface Window {
  gtag?: (
    command: string,
    action: string,
    params?: {
      [key: string]: any;
    }
  ) => void;
  
  // Legacy tracking functions (to be migrated to analyticsService)
  trackQuizStart?: (quizType: string) => void;
  trackQuizProgress?: (currentStep: number, totalSteps: number, category: string) => void;
  trackQuizComplete?: (timeInSeconds: number, totalSteps: number, userSegment: string) => void;
  trackStylePreference?: (preferenceType: string, rating: number) => void;
  trackPhotoUpload?: (purpose: string) => void;
  trackLeadCapture?: (source: string, type: string) => void;
  trackUserRegistration?: (method: string, userType: string) => void;
}

// Supabase types
interface SupabaseError {
  code: string;
  details: string | null;
  hint: string | null;
  message: string;
}

// Toast notification
declare module 'react-hot-toast' {
  interface ToastOptions {
    id?: string;
    icon?: React.ReactNode;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    ariaProps?: {
      role?: string;
      'aria-live'?: 'assertive' | 'off' | 'polite';
      'aria-atomic'?: 'true' | 'false';
    };
  }
}