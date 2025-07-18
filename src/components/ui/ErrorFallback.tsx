import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import { env } from '../../utils/env';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showDetails?: boolean;
}

/**
 * A fallback component to display when an error occurs
 * Used by ErrorBoundary to provide a consistent error UI
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Er is iets misgegaan',
  message = 'We konden de gevraagde informatie niet laden. Dit kan komen door een tijdelijk probleem.',
  showHomeButton = true,
  showDetails = false
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="text-white/80 mb-6">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary"
            onClick={resetErrorBoundary}
            icon={<RefreshCw size={16} />}
            iconPosition="left"
          >
            Probeer opnieuw
          </Button>
          
          {showHomeButton && (
            <Button 
              variant="ghost"
              onClick={() => window.location.href = '/'}
              icon={<Home size={16} />}
              iconPosition="left"
              className="text-white border border-white/30 hover:bg-white/10"
            >
              Terug naar home
            </Button>
          )}
        </div>
        
        {showDetails && env.DEBUG_MODE && (
          <div className="mt-6 p-4 bg-red-900/20 rounded-lg text-left overflow-auto">
            <p className="text-sm font-mono text-red-300 mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <details className="text-xs font-mono text-red-400">
                <summary className="cursor-pointer">Stack trace</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;