import { useState, useEffect } from 'react';
import { getVariant, trackEvent } from '@/services/ab/abTestingService';

/**
 * React hook for A/B testing
 * Automatically assigns variant and provides tracking function
 *
 * @example
 * const { variant, track } = useABTest('hero-cta-test', user?.id);
 *
 * return (
 *   <button onClick={() => track('click')}>
 *     {variant === 'control' ? 'Start Quiz' : 'Ontdek je stijl'}
 *   </button>
 * );
 */
export function useABTest(
  experimentName: string,
  userId?: string,
  sessionId?: string
): {
  variant: string | null;
  isLoading: boolean;
  track: (eventType: string, eventData?: Record<string, any>) => Promise<void>;
} {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function assignVariant() {
      try {
        // Generate session ID if not provided
        const effectiveSessionId = sessionId || getOrCreateSessionId();

        const assignedVariant = await getVariant(
          experimentName,
          userId,
          effectiveSessionId
        );

        if (mounted) {
          setVariant(assignedVariant);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useABTest] Failed to assign variant:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    assignVariant();

    return () => {
      mounted = false;
    };
  }, [experimentName, userId, sessionId]);

  const track = async (eventType: string, eventData?: Record<string, any>) => {
    const effectiveSessionId = sessionId || getOrCreateSessionId();

    await trackEvent(
      experimentName,
      eventType,
      userId,
      effectiveSessionId,
      eventData
    );
  };

  return { variant, isLoading, track };
}

/**
 * Get or create session ID for anonymous tracking
 */
function getOrCreateSessionId(): string {
  const key = 'fitfi_ab_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
