import { useEffect, useState } from "react";
import type { TribeRanking, DataResponse } from "@/services/data/types";
import { fetchTribeRankings } from "@/services/data/dataService";

interface UseTribeRankingOptions {
  limit?: number;
  userId?: string;
  tribeId?: string;
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseTribeRankingResult {
  rankings: TribeRanking[] | null;
  userRanking: TribeRanking | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching tribe rankings
 */
export function useTribeRanking(options: UseTribeRankingOptions = {}): UseTribeRankingResult {
  const {
    limit = 10,
    userId,
    tribeId,
    enabled = true,
    refetchOnMount = true
  } = options;

  const [rankings, setRankings] = useState<TribeRanking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadRankings = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: DataResponse<TribeRanking[]> = await fetchTribeRankings({
        limit,
        userId,
        tribeId
      });
      
      if (alive) {
        setRankings(response.data);
        setSource(response.source);
        setCached(response.cached);
        
        // Set warning if using fallback
        if (response.source === 'fallback' && response.errors && response.errors.length > 0) {
          setError('Live data niet beschikbaar, fallback gebruikt');
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
        setRankings([]);
        setSource('fallback');
        setCached(false);
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
    
    return () => { alive = false; };
  };

  useEffect(() => {
    if (refetchOnMount || !rankings) {
      const cleanup = loadRankings();
      return () => cleanup.then(fn => fn?.());
    }
  }, [limit, userId, tribeId, enabled, refetchOnMount]);

  // Find user's ranking if userId provided
  const userRanking = userId && rankings 
    ? rankings.find(r => r.tribeId === tribeId) || null
    : null;

  return {
    rankings,
    userRanking,
    loading,
    error,
    source,
    cached,
    refetch: loadRankings
  };
}

/**
 * Hook for getting tribe leaderboard (top tribes by points)
 */
export function useTribeLeaderboard(limit: number = 10): UseTribeRankingResult {
  return useTribeRanking({
    limit,
    enabled: true,
    refetchOnMount: true
  });
}

/**
 * Hook for getting specific tribe's ranking position
 */
export function useTribePosition(tribeId: string): {
  position: TribeRanking | null;
  loading: boolean;
  error: string | null;
} {
  const { rankings, loading, error } = useTribeRanking({
    tribeId,
    limit: 1,
    enabled: !!tribeId
  });

  const position = rankings?.[0] || null;

  return {
    position,
    loading,
    error
  };
}

/**
 * Hook for calculating tribe points from activities
 */
export function useTribePointsCalculator() {
  const calculatePoints = (activities: {
    newMembers: number;
    posts: number;
    challengeSubmissions: number;
    challengeWins: number;
    likes: number;
    comments: number;
  }): number => {
    const pointsConfig = {
      newMember: 50,        // Nieuwe member join
      post: 25,             // Nieuwe post
      challengeSubmission: 100, // Challenge deelname
      challengeWin: 500,    // Challenge winnen
      like: 5,              // Like ontvangen
      comment: 10           // Comment ontvangen
    };

    return (
      activities.newMembers * pointsConfig.newMember +
      activities.posts * pointsConfig.post +
      activities.challengeSubmissions * pointsConfig.challengeSubmission +
      activities.challengeWins * pointsConfig.challengeWin +
      activities.likes * pointsConfig.like +
      activities.comments * pointsConfig.comment
    );
  };

  return { calculatePoints };
}