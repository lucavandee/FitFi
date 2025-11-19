import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  showDetails = false
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-2 border-[var(--color-border)]">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={40} />
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3">
          Even geduld...
        </h1>

        <p className="text-[var(--color-muted)] mb-8 leading-relaxed">
          Er is iets misgegaan. We hebben dit genoteerd en gaan ermee aan de slag.
        </p>
        
        {showDetails && (
          <div className="bg-[var(--color-bg)] p-4 rounded-xl mb-6 text-left border border-[var(--color-border)]">
            <h3 className="font-semibold text-sm mb-2 text-[var(--color-text)]">Technische details:</h3>
            <p className="text-xs text-[var(--color-muted)] font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg"
          >
            <RefreshCw size={18} />
            Probeer opnieuw
          </button>

          <button
            onClick={handleGoHome}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-bg)] transition-all border-2 border-[var(--color-border)]"
          >
            <Home size={18} />
            Naar homepage
          </button>
        </div>

        <p className="text-sm text-[var(--color-muted)] mt-6">
          Blijft het probleem? Neem contact met ons op.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;