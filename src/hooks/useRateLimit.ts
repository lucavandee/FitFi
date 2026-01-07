import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';

interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: Date | null;
  retryAfter?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  endpoint: string;
}

/**
 * Hook for client-side rate limiting
 * Checks rate limits before making API calls to prevent DoS
 */
export function useRateLimit() {
  const { user } = useUser();
  const [status, setStatus] = useState<RateLimitStatus>({
    allowed: true,
    remaining: 100,
    resetAt: null,
  });

  const checkRateLimit = useCallback(
    async (config: RateLimitConfig): Promise<RateLimitStatus> => {
      try {
        // Determine identifier (user ID or IP-based)
        const identifier = user?.id || 'anonymous';
        const identifierType = user?.id ? 'user' : 'ip';

        // Call rate limit check function
        const { data, error } = await supabase.rpc('check_rate_limit', {
          p_identifier: identifier,
          p_identifier_type: identifierType,
          p_endpoint: config.endpoint,
          p_max_requests: config.maxRequests,
          p_window_minutes: config.windowMinutes,
        });

        if (error) {
          console.error('Rate limit check error:', error);
          // Fail open: allow request if rate limit check fails
          return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt: null,
          };
        }

        const result = data as {
          allowed: boolean;
          current_count: number;
          limit: number;
          reset_at: string;
        };

        const newStatus: RateLimitStatus = {
          allowed: result.allowed,
          remaining: Math.max(0, result.limit - result.current_count),
          resetAt: result.reset_at ? new Date(result.reset_at) : null,
          retryAfter: result.reset_at
            ? Math.ceil((new Date(result.reset_at).getTime() - Date.now()) / 1000)
            : undefined,
        };

        setStatus(newStatus);
        return newStatus;
      } catch (err) {
        console.error('Rate limit error:', err);
        // Fail open: allow request on error
        return {
          allowed: true,
          remaining: config.maxRequests,
          resetAt: null,
        };
      }
    },
    [user]
  );

  const resetStatus = useCallback(() => {
    setStatus({
      allowed: true,
      remaining: 100,
      resetAt: null,
    });
  }, []);

  return {
    status,
    checkRateLimit,
    resetStatus,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  NOVA_CHAT: {
    maxRequests: 30,
    windowMinutes: 1,
    endpoint: '/functions/nova',
  },
  QUIZ_SUBMIT: {
    maxRequests: 20,
    windowMinutes: 1,
    endpoint: '/api/quiz',
  },
  PHOTO_UPLOAD: {
    maxRequests: 10,
    windowMinutes: 5,
    endpoint: '/functions/upload',
  },
  OUTFIT_GENERATION: {
    maxRequests: 50,
    windowMinutes: 1,
    endpoint: '/api/outfits',
  },
  AI_ANALYSIS: {
    maxRequests: 15,
    windowMinutes: 1,
    endpoint: '/functions/analyze',
  },
} as const;
