import { useEffect, useState } from "react";
import { findBestOpenChallenge } from "@/services/tribes/challengeDiscovery";

/**
 * Hook for finding the best open challenge for a user
 * Prioritizes challenges from joined tribes, falls back to global challenges
 */
export function useBestChallenge(userId?: string) {
  const [best, setBest] = useState<{ tribeId?: string; challengeId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    
    const loadBestChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await findBestOpenChallenge(userId);
        
        if (alive) {
          setBest(result);
          
          // Log discovery result for analytics
          if (result && typeof window.gtag === 'function') {
            window.gtag('event', 'best_challenge_discovered', {
              event_category: 'challenge_discovery',
              event_label: result.challengeId,
              tribe_id: result.tribeId,
              user_id: userId
            });
          }
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setBest(null);
          
          console.error('[useBestChallenge] Error loading best challenge:', err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadBestChallenge();
    
    return () => { 
      alive = false; 
    };
  }, [userId]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await findBestOpenChallenge(userId);
      setBest(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBest(null);
    } finally {
      setLoading(false);
    }
  };

  return { 
    best, 
    loading, 
    error,
    refetch,
    hasBestChallenge: !!best,
    challengeId: best?.challengeId,
    tribeId: best?.tribeId
  };
}