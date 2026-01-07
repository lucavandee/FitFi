import { useEffect, useState } from 'react';
import { useRateLimit, RATE_LIMITS } from '@/hooks/useRateLimit';
import { AlertCircle, Clock } from 'lucide-react';

interface RateLimitIndicatorProps {
  endpoint: keyof typeof RATE_LIMITS;
  className?: string;
}

/**
 * Shows rate limit status and countdown timer
 */
export function RateLimitIndicator({ endpoint, className = '' }: RateLimitIndicatorProps) {
  const { status, checkRateLimit } = useRateLimit();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Initial check
    checkRateLimit(RATE_LIMITS[endpoint]);

    // Periodic refresh every 10 seconds
    const interval = setInterval(() => {
      checkRateLimit(RATE_LIMITS[endpoint]);
    }, 10000);

    return () => clearInterval(interval);
  }, [endpoint, checkRateLimit]);

  useEffect(() => {
    if (!status.allowed && status.retryAfter) {
      setCountdown(status.retryAfter);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Refresh rate limit status
            checkRateLimit(RATE_LIMITS[endpoint]);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status.allowed, status.retryAfter, endpoint, checkRateLimit]);

  // Don't show anything if rate limit is not reached
  if (status.allowed && status.remaining > 5) {
    return null;
  }

  // Warning: approaching rate limit
  if (status.allowed && status.remaining <= 5 && status.remaining > 0) {
    return (
      <div className={`flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Nog {status.remaining} berichten over deze minuut</span>
      </div>
    );
  }

  // Rate limit reached
  if (!status.allowed && countdown !== null) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ${className}`}>
        <Clock className="w-4 h-4 animate-pulse" />
        <span>
          Rate limit bereikt. Wacht nog <strong>{countdown}s</strong>
        </span>
      </div>
    );
  }

  return null;
}
