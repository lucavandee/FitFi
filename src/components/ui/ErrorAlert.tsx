/**
 * ErrorAlert Component
 *
 * Displays contextual, solution-oriented error messages.
 *
 * Features:
 * - Animated entrance
 * - Icon support
 * - Severity-based styling
 * - Accessible (ARIA live regions)
 * - Mobile-friendly
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Info,
  AlertTriangle,
  Mail,
  Lock,
  User,
  X,
} from 'lucide-react';
import type { ErrorMessage } from '@/utils/formErrors';

interface ErrorAlertProps {
  /** Error message object */
  error: ErrorMessage | null;
  /** Show close button? */
  dismissible?: boolean;
  /** On dismiss callback */
  onDismiss?: () => void;
  /** Compact mode (no solution text) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const iconMap = {
  AlertCircle,
  Info,
  AlertTriangle,
  Mail,
  Lock,
  User,
};

const severityStyles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    title: 'text-red-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-600',
    title: 'text-amber-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    title: 'text-blue-900',
  },
};

export function ErrorAlert({
  error,
  dismissible = false,
  onDismiss,
  compact = false,
  className = '',
}: ErrorAlertProps) {
  if (!error) return null;

  const Icon = error.icon ? iconMap[error.icon] : AlertCircle;
  const styles = severityStyles[error.severity];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={error.title}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          rounded-xl border-2 p-4
          ${styles.bg} ${styles.border}
          ${className}
        `}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
              {error.title}
            </h3>

            {/* Message */}
            <p className={`text-sm ${styles.text}`}>
              {error.message}
            </p>

            {/* Solution (optional) */}
            {!compact && error.solution && (
              <p className={`text-sm ${styles.text} mt-2 font-medium`}>
                💡 {error.solution}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className={`
                flex-shrink-0 rounded-lg p-1.5
                hover:bg-black/5 active:scale-95
                transition-all outline-none
                focus-visible:shadow-[var(--ff-shadow-ring)]
                ${styles.icon}
              `}
              aria-label="Sluiten"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline Error Display (for form fields)
 */
interface InlineErrorProps {
  error: ErrorMessage | null;
  className?: string;
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  if (!error) return null;

  const Icon = error.icon ? iconMap[error.icon] : AlertCircle;
  const styles = severityStyles[error.severity];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={error.title}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15 }}
        className={`overflow-hidden ${className}`}
      >
        <div
          className={`flex items-start gap-2 mt-2 ${styles.text}`}
          role="alert"
          aria-live="polite"
        >
          <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.icon}`} aria-hidden="true" />
          <div className="text-sm">
            <span className="font-semibold">{error.title}</span>
            {error.solution && (
              <span className="block mt-0.5 opacity-90">{error.solution}</span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Toast Error Display (for global errors)
 */
interface ToastErrorProps {
  error: ErrorMessage | null;
  onDismiss: () => void;
  duration?: number;
}

export function ToastError({ error, onDismiss, duration = 5000 }: ToastErrorProps) {
  React.useEffect(() => {
    if (error && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [error, duration, onDismiss]);

  if (!error) return null;

  const Icon = error.icon ? iconMap[error.icon] : AlertCircle;
  const styles = severityStyles[error.severity];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={error.title}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed top-20 right-4 z-[9999] max-w-sm w-full
          rounded-xl border-2 p-4 shadow-xl
          ${styles.bg} ${styles.border}
        `}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
              {error.title}
            </h3>
            <p className={`text-sm ${styles.text}`}>
              {error.message}
            </p>
            {error.solution && (
              <p className={`text-sm ${styles.text} mt-2 font-medium`}>
                💡 {error.solution}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className={`
              flex-shrink-0 rounded-lg p-1.5
              hover:bg-black/5 active:scale-95
              transition-all outline-none
              focus-visible:shadow-[var(--ff-shadow-ring)]
              ${styles.icon}
            `}
            aria-label="Sluiten"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className={`h-1 ${styles.border} rounded-full mt-3 origin-left`}
            style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
