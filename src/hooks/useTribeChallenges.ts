import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import {
  getTribeChallenges,
  createTribeChallenge,
  getChallengeSubmissions,
  createChallengeSubmission,
  getTribeRanking,
  updateSubmissionScore,
  getUserChallengeParticipation,
  getChallengeStats
} from "@/services/data/tribeChallengesService";
import type { 
  TribeChallenge, 
  TribeChallengeSubmission, 
  TribeRanking,
  ChallengeStatus 
} from "@/services/data/types";
import toast from 'react-hot-toast';
import { trackEvent } from "@/utils/analytics";

/**
 * Hook for fetching tribe challenges
 */
export const useTribeChallenges = (
  tribeId?: string,
  options?: {
    status?: ChallengeStatus;
    limit?: number;
    enabled?: boolean;
  }
) => {
  const { enabled = true, ...queryOptions } = options || {};
  
  return useQuery({
    queryKey: ["tribeChallenges", tribeId, queryOptions],
    queryFn: () => getTribeChallenges(tribeId, queryOptions),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for creating tribe challenges (admin only)
 */
export const useCreateTribeChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (challenge: Omit<TribeChallenge, 'id' | 'createdAt'>) => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }
      
      // Add creator info
      const challengeWithCreator = {
        ...challenge,
        createdBy: user.id
      };
      
      return await createTribeChallenge(challengeWithCreator);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tribeChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["tribeChallenges", variables.tribeId] });
      
      // Track challenge creation
      trackEvent('tribe_challenge_created', 'community', variables.tribeId, 1, {
        challenge_id: data.id,
        difficulty: data.difficulty,
        reward_points: data.rewardPoints
      });
      
      toast.success('Challenge succesvol aangemaakt! 🎯');
    },
    onError: (error) => {
      console.error('Challenge creation failed:', error);
      toast.error('Challenge aanmaken mislukt. Probeer opnieuw.');
    }
  });
};

/**
 * Hook for fetching challenge submissions
 */
export const useChallengeSubmissions = (
  challengeId: string,
  options?: {
    userId?: string;
    limit?: number;
    includeUserProfile?: boolean;
    enabled?: boolean;
  }
) => {
  const { enabled = true, ...queryOptions } = options || {};
  
  return useQuery({
    queryKey: ["challengeSubmissions", challengeId, queryOptions],
    queryFn: () => getChallengeSubmissions(challengeId, queryOptions),
    enabled: enabled && !!challengeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for creating challenge submissions
 */
export const useCreateChallengeSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt' | 'userId' | 'userName'>) => {
      if (!user?.id) {
        throw new Error('Authentication required');
      }
      
      // Add user info
      const submissionWithUser = {
        ...submission,
        userId: user.id,
        userName: user.name || 'Anonymous'
      };
      
      return await createChallengeSubmission(submissionWithUser);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["challengeSubmissions", variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ["tribeChallenges"] });
      
      // Track submission
      trackEvent('challenge_submission_created', 'community', variables.challengeId, 1, {
        submission_id: data.id,
        tribe_id: data.tribeId,
        submission_type: data.submissionType,
        has_image: !!data.imageUrl,
        has_link: !!data.linkUrl
      });
      
      toast.success('Submission succesvol ingediend! 🎉');
    },
    onError: (error) => {
      console.error('Submission creation failed:', error);
      toast.error('Submission mislukt. Probeer opnieuw.');
    }
  });
};

/**
 * Hook for updating submission scores (admin only)
 */
export const useUpdateSubmissionScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, score, isWinner }: {
      submissionId: string;
      score: number;
      isWinner?: boolean;
    }) => updateSubmissionScore(submissionId, score, isWinner),
    onSuccess: (data) => {
      // Invalidate submissions queries
      queryClient.invalidateQueries({ queryKey: ["challengeSubmissions"] });
      
      // Track score update
      trackEvent('submission_score_updated', 'admin', data.challengeId, data.score, {
        submission_id: data.id,
        is_winner: data.isWinner
      });
      
      toast.success(`Score bijgewerkt: ${data.score}/100${data.isWinner ? ' 🏆' : ''}`);
    },
    onError: (error) => {
      console.error('Score update failed:', error);
      toast.error('Score update mislukt.');
    }
  });
};

/**
 * Hook for fetching tribe ranking
 */
export const useTribeRanking = (
  options?: {
    limit?: number;
    tribeId?: string;
    enabled?: boolean;
  }
) => {
  const { enabled = true, ...queryOptions } = options || {};
  
  return useQuery({
    queryKey: ["tribeRanking", queryOptions],
    queryFn: () => getTribeRanking(queryOptions),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for checking user's challenge participation
 */
export const useChallengeParticipation = (
  challengeId: string,
  userId?: string
) => {
  const { user } = useUser();
  const actualUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ["challengeParticipation", challengeId, actualUserId],
    queryFn: () => {
      if (!actualUserId) {
        return { hasParticipated: false };
      }
      return getUserChallengeParticipation(actualUserId, challengeId);
    },
    enabled: !!challengeId && !!actualUserId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};

/**
 * Hook for fetching challenge statistics
 */
export const useChallengeStats = (challengeId: string) => {
  return useQuery({
    queryKey: ["challengeStats", challengeId],
    queryFn: () => getChallengeStats(challengeId),
    enabled: !!challengeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

/**
 * Hook for getting user's tribe ranking position
 */
export const useUserTribeRanking = (userId?: string) => {
  const { user } = useUser();
  const actualUserId = userId || user?.id;
  
  const { data: allRankings, ...queryResult } = useTribeRanking();
  
  const userRanking = allRankings?.find(ranking => 
    ranking.tribeId === actualUserId // This would need proper user-tribe mapping
  );
  
  return {
    ...queryResult,
    userRanking,
    position: userRanking?.rank
  };
};

/**
 * Hook for getting active challenges across all tribes
 */
export const useActiveChallenges = (limit?: number) => {
  return useQuery({
    queryKey: ["activeChallenges", limit],
    queryFn: () => getTribeChallenges(undefined, { 
      status: "open", 
      limit 
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 1
  });
};

/**
 * Hook for getting challenge leaderboard (top submissions)
 */
export const useChallengeLeaderboard = (challengeId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["challengeLeaderboard", challengeId, limit],
    queryFn: () => getChallengeSubmissions(challengeId, { 
      limit,
      includeUserProfile: true 
    }),
    enabled: !!challengeId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};