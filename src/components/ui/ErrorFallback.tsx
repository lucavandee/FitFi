import React, { useEffect, useRef } from 'react';
import { RefreshCw, Home, ArrowLeft, Mail } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetErrorBoundary,
  title = "Er ging iets mis.",
  description = "Vernieuw de pagina of probeer het opnieuw.",
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-6 h-6 text-[var(--color-muted)]" aria-hidden="true" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-[var(--color-text)] mb-2 outline-none"
        >
          {title}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mb-1">{description}</p>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          We kunnen dit nu niet laden. Probeer later nog eens.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {resetErrorBoundary ? (
            <button
              onClick={resetErrorBoundary}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Probeer opnieuw
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Vernieuw
            </button>
          )}
          <button
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Terug
          </button>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <a
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Naar dashboard
          </a>
          <a
            href="/contact"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] hover:text-[var(--color-text)] transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Contact
          </a>
        </div>

        <p className="mt-6 text-xs text-[var(--color-muted)]">
          Probeer het later nog eens als het probleem aanhoudt.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
