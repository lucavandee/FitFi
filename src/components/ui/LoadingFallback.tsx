import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'We maken je stijlrapport…',
  hint = 'Dit duurt meestal minder dan een minuut.',
  size = 'md',
  fullScreen = false,
  className = '',
}) => {
  const spinnerSizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div
        className={`${spinnerSizes[size]} border-[var(--color-border)] border-t-[var(--ff-color-primary-600)] rounded-full animate-spin`}
        aria-hidden="true"
      />
      <div className="text-center space-y-1">
        <p className={`${textSizes[size]} text-[var(--color-text)] font-medium`}>{message}</p>
        {hint && <p className="text-sm text-[var(--color-muted)]">{hint}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 bg-[var(--color-bg)]/90 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {content}
    </div>
  );
};

export default LoadingFallback;
