import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ui/ErrorFallback';
import { TEST_USER_ID } from '../lib/supabase';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error without PII
    console.error('Uncaught error in component:', {
      error: error instanceof Error ? error.message : String(error),
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Track error in analytics (production only)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'error', {
        event_category: 'error',
        event_label: error.message,
        value: 1,
        non_interaction: true,
        error_type: error.name,
        error_message: error.message,
        component_stack: errorInfo.componentStack,
        page_url: window.location.href,
        session_id: `session_${Date.now()}`
      });
    }
    
    // Additional error context for debugging (no PII)
    console.error('Error captured by ErrorBoundary:', {
      errorType: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback
          error={this.state.error as Error}
          resetErrorBoundary={this.handleReset}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}