import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service (e.g., Sentry)
    console.error('Uncaught error:', error, errorInfo);
    
    // In a production app, you would log to a service like:
    // if (typeof window.Sentry !== 'undefined') {
    //   window.Sentry.captureException(error);
    // }
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
      return this.props.fallback || (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
              Oeps, er is iets misgegaan
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We konden je stijladvies niet laden. Dit kan komen door een tijdelijk probleem. Probeer het opnieuw of ga terug naar de homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="primary"
                onClick={this.handleReset}
                icon={<RefreshCw size={16} />}
                iconPosition="left"
              >
                Probeer opnieuw
              </Button>
              <Button 
                variant="secondary"
                onClick={() => window.location.href = '/'}
              >
                Terug naar home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left overflow-auto">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                  {this.state.error.toString()}
                </p>
                <details className="text-xs font-mono text-red-700 dark:text-red-400">
                  <summary className="cursor-pointer">Stack trace</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;