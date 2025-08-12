import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { env } from "../utils/env";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { trackEvent } from "../utils/analytics";

// Get singleton client
const sb = supabase();

interface Level {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp: number | null;
  icon: string;
  color: string;
  perks: string[];
}

interface Badge {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_icon: string;
  earned_at: string;
  metadata: Record<string, any>;
}

interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  label: string;
  description: string;
  points: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  completed?: boolean;
  progress?: number;
  maxProgress?: number;
}

interface GamificationState {
  points: number;
  level: Level | null;
  levelRank: number;
  badges: Badge[];
  streak: number;
  weeklyPoints: number;
  monthlyPoints: number;
  leaderboardRank: number;
  lastLevelUp: string | null;
}

interface GamificationContextType {
  points: number;
  level: Level | null;
  levelRank: number;
  currentLevelInfo: Level | null;
  nextLevelInfo: Level | null;
  progressToNextLevel: number;
  badges: Badge[];
  earnedBadges: Badge[];
  streak: number;
  availableChallenges: Challenge[];
  availableWeeklyChallenges: Challenge[];
  leaderboardRank: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastLevelUp: string | null;
  isLoading: boolean;
  error: string | null;

  completeChallenge: (challengeId: string) => Promise<void>;
  completeWeeklyChallenge: (challengeId: string) => Promise<void>;
  awardPoints: (actionType: string, points?: number, metadata?: Record<string, any>) => Promise<void>;
  saveOutfit: () => Promise<void>;
  shareOutfit: () => Promise<void>;
  dailyCheckIn: () => Promise<void>;
  getCurrentLevelPerks: () => string[];
  getProgressToNextLevel: () => number;
  refreshData: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [availableWeeklyChallenges, setAvailableWeeklyChallenges] = useState<Challenge[]>([]);
  const [allLevels, setAllLevels] = useState<Level[]>([]);

  const [gamificationState, setGamificationState] = useState<GamificationState>({
    points: 0,
    level: null,
    levelRank: 1,
    badges: [],
    streak: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    leaderboardRank: 1,
    lastLevelUp: null,
  });

  useEffect(() => {
    if (user?.id) {
      loadGamificationData();
    } else {
      resetGamificationState();
    }
  }, [user]);

  const loadLevels = async () => {
    if (!sb) return;
    
    try {
      const { data, error } = await sb
        .from('levels')
        .select('*')
        .order('min_xp', { ascending: true });

      if (error) {
        console.error('Error loading levels:', error);
        return;
      }

      setAllLevels(data || []);
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const resetGamificationState = () => {
    setGamificationState({
      points: 0,
      level: null,
      levelRank: 1,
      badges: [],
      streak: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      leaderboardRank: 1,
      lastLevelUp: null,
    });
    setIsLoading(false);
  };

  const loadGamificationData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Load levels first
      await loadLevels();

      // Load user points
      const { data: pointsData, error: pointsError } = await sb
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      // Create user points record if doesn't exist
      if (!pointsData) {
        const { error: insertError } = await sb
          .from('user_points')
          .insert({
            user_id: user.id,
            total_points: 0,
            weekly_points: 0,
            monthly_points: 0,
            current_level: 1
          });

        if (insertError) {
          throw insertError;
        }

        // Set default state
        setGamificationState(prev => ({
          ...prev,
          points: 0,
          level: allLevels[0] || null,
          levelRank: 1,
          weeklyPoints: 0,
          monthlyPoints: 0
        }));
      } else {
        // Find current level
        const currentLevel = allLevels.find(l => l.id === pointsData.current_level) || allLevels[0];

        setGamificationState(prev => ({
          ...prev,
          points: pointsData.total_points,
          level: currentLevel,
          levelRank: currentLevel?.id || 1,
          weeklyPoints: pointsData.weekly_points,
          monthlyPoints: pointsData.monthly_points,
          lastLevelUp: pointsData.last_level_up
        }));
      }

      // Load user badges
      const { data: badgesData, error: badgesError } = await sb
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (badgesError) {
        console.warn('Error loading badges:', badgesError);
      } else {
        setGamificationState(prev => ({
          ...prev,
          badges: badgesData || []
        }));
      }

      // Load available challenges
      const dailyChallenges: Challenge[] = [
        {
          id: 'daily_checkin',
          type: 'daily',
          label: 'Dagelijkse Check-in',
          description: 'Log in en check je stijlupdates',
          points: 10,
          icon: '📅',
          difficulty: 'easy'
        },
        {
          id: 'view_recommendations',
          type: 'daily',
          label: 'Bekijk 3 aanbevelingen',
          description: 'Ontdek nieuwe outfit ideeën',
          points: 20,
          icon: '👀',
          difficulty: 'easy',
          maxProgress: 3
        },
        {
          id: 'save_outfit',
          type: 'daily',
          label: 'Bewaar een outfit',
          description: 'Voeg een outfit toe aan je favorieten',
          points: 15,
          icon: '💾',
          difficulty: 'easy'
        }
      ];

      const weeklyChallenges: Challenge[] = [
        {
          id: 'weekly_streak',
          type: 'weekly',
          label: '7 dagen actief',
          description: 'Log 7 dagen achter elkaar in',
          points: 100,
          icon: '🔥',
          difficulty: 'hard',
          maxProgress: 7
        },
        {
          id: 'share_outfits',
          type: 'weekly',
          label: 'Deel 3 outfits',
          description: 'Deel je favoriete looks op social media',
          points: 75,
          icon: '📱',
          difficulty: 'medium',
          maxProgress: 3
        }
      ];

      setAvailableChallenges(dailyChallenges);
      setAvailableWeeklyChallenges(weeklyChallenges);

      // Get leaderboard rank
      try {
        const { data: rankData, error: rankError } = await sb
          .rpc('get_user_leaderboard_rank', {
            user_uuid: user.id,
            leaderboard_type: 'all_time'
          });

        if (!rankError && rankData && rankData.length > 0) {
          setGamificationState(prev => ({
            ...prev,
            leaderboardRank: rankData[0].rank || 1
          }));
        }
      } catch (rankError) {
        console.warn('Could not load leaderboard rank:', rankError);
      }

    } catch (err) {
      console.error("Gamification loading error:", err);
      setError('Kon gamification data niet laden');
      resetGamificationState();
    } finally {
      setIsLoading(false);
    }
  };

  const awardPoints = async (actionType: string, points?: number, metadata?: Record<string, any>) => {
    if (!user?.id) return;

    if (!sb) {
      toast.error('Kan punten niet toekennen - geen verbinding');
      return;
    }

    try {
      const { data, error } = await sb.functions.invoke('calculate-points', {
        body: {
          action_type: actionType,
          points,
          metadata
        },
        headers: {
          Authorization: `Bearer ${(await sb.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      // Refresh data to get updated state
      await loadGamificationData();

      // Show success message
      if (data.level_up) {
        toast.success(`🎉 Level Up! Je bent nu ${data.new_level}!`, { duration: 5000 });
      } else {
        toast.success(`+${data.points_awarded} punten verdiend!`);
      }

      // Track points earned
      trackEvent('points_earned', 'gamification', actionType, data.points_awarded, {
        user_id: user.id,
        total_points: data.new_total,
        level_up: data.level_up
      });

    } catch (err) {
      console.error('Error awarding points:', err);
      toast.error('Kon punten niet toekennen');
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    if (!sb) {
      toast.error('Kan challenge niet voltooien - geen verbinding');
      return;
    }

    try {
      const { data, error } = await sb.functions.invoke('submit-challenge', {
        body: {
          challenge_id: challengeId,
          challenge_type: 'daily'
        },
        headers: {
          Authorization: `Bearer ${(await sb.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        if (error.message?.includes('already completed')) {
          toast.error('Challenge al voltooid vandaag!');
          return;
        }
        throw error;
      }

      toast.success("✅ Challenge voltooid!");

      // Refresh data
      await loadGamificationData();

      trackEvent('challenge_completed', 'gamification', challengeId, data.points_earned, {
        user_id: user.id,
        challenge_type: 'daily'
      });

    } catch (err) {
      console.error("Challenge completion failed:", err);
      toast.error("Challenge kon niet worden voltooid.");
    }
  };

  const completeWeeklyChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    if (!sb) {
      toast.error('Kan weekly challenge niet voltooien - geen verbinding');
      return;
    }

    try {
      const { data, error } = await sb.functions.invoke('submit-challenge', {
        body: {
          challenge_id: challengeId,
          challenge_type: 'weekly'
        },
        headers: {
          Authorization: `Bearer ${(await sb.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        if (error.message?.includes('already completed')) {
          toast.error('Weekly challenge al voltooid!');
          return;
        }
        throw error;
      }

      toast.success("🎉 Weekly Challenge voltooid!");

      // Refresh data
      await loadGamificationData();

      trackEvent('weekly_challenge_completed', 'gamification', challengeId, data.points_earned, {
        user_id: user.id,
        challenge_type: 'weekly'
      });

    } catch (err) {
      console.error("Weekly challenge completion failed:", err);
      toast.error("Weekly challenge kon niet worden voltooid.");
    }
  };

  const saveOutfit = async () => {
    await awardPoints('outfit_save', 15);
  };

  const shareOutfit = async () => {
    await awardPoints('outfit_share', 30);
  };

  const dailyCheckIn = async () => {
    await awardPoints('daily_checkin', 10);
  };

  const getCurrentLevelInfo = (): Level | null => {
    return gamificationState.level;
  };

  const getNextLevelInfo = (): Level | null => {
    if (!gamificationState.level) return allLevels[0] || null;
    
    const currentLevelIndex = allLevels.findIndex(l => l.id === gamificationState.level?.id);
    return allLevels[currentLevelIndex + 1] || null;
  };

  const getProgressToNextLevel = (): number => {
    const currentLevel = getCurrentLevelInfo();
    const nextLevel = getNextLevelInfo();
    
    if (!currentLevel || !nextLevel) return 100;
    
    const currentPoints = gamificationState.points;
    const range = nextLevel.min_xp - currentLevel.min_xp;
    const progress = currentPoints - currentLevel.min_xp;
    
    return Math.min(100, Math.round((progress / range) * 100));
  };

  const getCurrentLevelPerks = (): string[] => {
    return gamificationState.level?.perks || [];
  };

  const refreshData = async () => {
    if (!user?.id) return;
    await loadGamificationData();
  };

  // Computed values
  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = getNextLevelInfo();
  const progressToNextLevel = getProgressToNextLevel();
  const earnedBadges = gamificationState.badges;

  return (
    <GamificationContext.Provider
      value={{
        ...gamificationState,
        availableChallenges,
        availableWeeklyChallenges,
        isLoading,
        error,
        currentLevelInfo,
        nextLevelInfo,
        progressToNextLevel,
        earnedBadges,
        completeChallenge,
        completeWeeklyChallenge,
        awardPoints,
        saveOutfit,
        shareOutfit,
        dailyCheckIn,
        getCurrentLevelPerks,
        getProgressToNextLevel,
        refreshData,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};