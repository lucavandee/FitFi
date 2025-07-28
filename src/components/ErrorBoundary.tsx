import React, { Component, ErrorInfo, ReactNode } from 'react';
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

  public static getDerivedStateFromError(error: Error): State {
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
    
    // Log error with additional context
    console.error('Uncaught error in component:', {
      error,
      componentStack: errorInfo.componentStack,
      userId: TEST_USER_ID,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Track error in analytics (production only)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'error', {
        event_category: 'error',
        event_label: error.message,
        value: 1,
        non_interaction: true,
        error_type: error.name,
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        page_url: window.location.href,
        user_id: TEST_USER_ID
      });
    }
    
    // Initialize Sentry if available and capture error
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          component: 'ErrorBoundary',
          userId: TEST_USER_ID
        }
      });
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={this.handleReset}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}