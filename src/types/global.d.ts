// Global type definitions for FitFi

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_HOTJAR_ID?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Toast custom function typing
declare module 'react-hot-toast' {
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    duration?: number;
    visible: boolean;
    height?: number;
    createdAt: number;
    pauseDuration: number;
  }

  interface ToastOptions {
    id?: string;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    ariaProps?: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
  }

  function custom(
    jsx: (t: Toast) => React.ReactNode,
    options?: ToastOptions
  ): string;
}

// Window extensions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    hj?: (...args: any[]) => void;
    _hjSettings?: {
      hjid: number;
      hjsv: number;
    };
  }
}

export {};

// Handige generieke shims die vaak ontbreken
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}