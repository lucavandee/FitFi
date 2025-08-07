/**
 * Global type definitions for the application
 */

// GTM DataLayer
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (
      command: string,
      action: string,
      params?: {
        [key: string]: any;
      }
    ) => void;
  }
}

export {};

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