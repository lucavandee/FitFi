import { useEffect, useState } from "react";
import type { TribeChallenge, TribeChallengeSubmission, DataResponse } from "@/services/data/types";
import { fetchTribeChallenges, fetchChallengeSubmissions, createChallengeSubmission } from "@/services/data/dataService";

interface UseTribeChallengesOptions {
  status?: "draft" | "open" | "closed" | "archived";
  limit?: number;
  enabled?: boolean;
}

interface UseTribeChallengesResult {
  challenges: TribeChallenge[] | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching tribe challenges
 */
export function useTribeChallenges(
  tribeId: string,
  options: UseTribeChallengesOptions = {}
): UseTribeChallengesResult {
  const {
    status,
    limit,
    enabled = true
  } = options;

  const [challenges, setChallenges] = useState<TribeChallenge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadChallenges = async () => {
    if (!enabled || !tribeId) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: DataResponse<TribeChallenge[]> = await fetchTribeChallenges(tribeId, {
        status,
        limit
      });
      
      if (alive) {
        setChallenges(response.data);
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
        setChallenges([]);
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
    const cleanup = loadChallenges();
    return () => cleanup.then(fn => fn?.());
  }, [tribeId, status, limit, enabled]);

  return {
    challenges,
    loading,
    error,
    source,
    cached,
    refetch: loadChallenges
  };
}

/**
 * Hook for fetching challenge submissions
 */
export function useChallengeSubmissions(
  challengeId: string,
  options?: {
    userId?: string;
    limit?: number;
    enabled?: boolean;
  }
): {
  submissions: TribeChallengeSubmission[] | null;
  loading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
  submitEntry: (submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>) => Promise<TribeChallengeSubmission | null>;
} {
  const { enabled = true, ...fetchOptions } = options || {};
  
  const [submissions, setSubmissions] = useState<TribeChallengeSubmission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const loadSubmissions = async () => {
    if (!enabled || !challengeId) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchChallengeSubmissions(challengeId, fetchOptions);
      
      if (alive) {
        setSubmissions(response.data);
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
        setSubmissions([]);
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

  const submitEntry = async (
    submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>
  ): Promise<TribeChallengeSubmission | null> => {
    try {
      const response = await createChallengeSubmission(submission);
      
      // Refresh submissions list
      await loadSubmissions();
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      return null;
    }
  };

  useEffect(() => {
    const cleanup = loadSubmissions();
    return () => cleanup.then(fn => fn?.());
  }, [challengeId, enabled, fetchOptions?.limit, fetchOptions?.userId]);

  return {
    submissions,
    loading,
    error,
    source,
    cached,
    refetch: loadSubmissions,
    submitEntry
  };
}

/**
 * Hook for managing challenge participation
 */
export function useChallengeParticipation(
  challengeId: string,
  userId?: string
): {
  hasParticipated: boolean;
  userSubmission: TribeChallengeSubmission | null;
  loading: boolean;
  error: string | null;
} {
  const { submissions, loading, error } = useChallengeSubmissions(challengeId, {
    userId,
    enabled: !!userId
  });

  const userSubmission = submissions?.find(s => s.userId === userId) || null;
  const hasParticipated = !!userSubmission;

  return {
    hasParticipated,
    userSubmission,
    loading,
    error
  };
}