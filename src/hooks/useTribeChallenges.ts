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
export function useChallengeSubmissions(challengeId: string, userId?: string) {
  const [submissions, setSubmissions] = useState<TribeChallengeSubmission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');

  const loadSubmissions = async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    let alive = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchChallengeSubmissions(challengeId, { userId });
      
      if (alive) {
        setSubmissions(response.data);
        setSource(response.source);
        
        if (response.source === 'fallback' && response.errors && response.errors.length > 0) {
          setError('Live data niet beschikbaar, fallback gebruikt');
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
        setSubmissions([]);
        setSource('fallback');
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
    
    return () => { alive = false; };
  };

  const submitChallenge = async (submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>) => {
    try {
      const response = await createChallengeSubmission(submission);
      
      // Refresh submissions after successful creation
      if (response.data) {
        await loadSubmissions();
        return response.data;
      }
      
      throw new Error('Submission failed');
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  };

  useEffect(() => {
    const cleanup = loadSubmissions();
    return () => cleanup.then(fn => fn?.());
  }, [challengeId, userId]);

  return {
    submissions,
    loading,
    error,
    source,
    submitChallenge,
    refetch: loadSubmissions
  };
}