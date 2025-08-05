import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import gamificationConfig from "../config/gamification.json";
import { env } from "../utils/env";
import {
  getGamificationData,
  updateGamificationData,
  completeChallenge as completeDataRouterChallenge,
  getDailyChallengesData,
} from "../services/DataRouter";
import toast from "react-hot-toast";
import { trackEvent } from "../utils/analytics";

interface GamificationState {
  points: number;
  level: string;
  levelRank: number;
  badges: string[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  weeklyChallengeStatus: Record<string, boolean>;
  referralCode: string;
  lastCheckIn: string | null;
  completedChallenges: string[];
  totalReferrals: number;
  seasonalEventProgress: Record<string, any>;
  leaderboardRank: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

interface GamificationContextType {
  points: number;
  level: string;
  levelRank: number;
  currentLevelInfo: any;
  nextLevelInfo: any;
  progressToNextLevel: number;
  badges: string[];
  earnedBadges: any[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  weeklyChallengeStatus: Record<string, boolean>;
  availableChallenges: any[];
  availableWeeklyChallenges: any[];
  referralCode: string;
  totalReferrals: number;
  leaderboardRank: number;
  weeklyPoints: number;
  monthlyPoints: number;
  isLoading: boolean;

  completeQuiz: () => Promise<void>;
  makePurchase: (amount?: number) => Promise<void>;
  checkIn: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  completeWeeklyChallenge: (challengeId: string) => Promise<void>;
  recordReferral: () => Promise<void>;
  viewRecommendation: () => Promise<void>;
  shareOutfit: () => Promise<void>;
  saveOutfit: () => Promise<void>;
  levelUp: (newLevel: string) => Promise<void>;

  getPointsForAction: (action: string) => number;
  canEarnBadge: (badgeId: string) => boolean;
  getProgressToNextLevel: () => number;
  isSeasonalEventActive: () => boolean;
  getSeasonalMultiplier: () => number;
  getLeaderboardPosition: () => Promise<number>;
  getCurrentLevelPerks: () => string[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
  const [availableWeeklyChallenges, setAvailableWeeklyChallenges] = useState<any[]>([]);

  const [gamificationState, setGamificationState] = useState<GamificationState>({
    points: 0,
    level: "beginner",
    levelRank: 1,
    badges: [],
    streak: 0,
    dailyChallengeStatus: {},
    weeklyChallengeStatus: {},
    referralCode: generateReferralCode(),
    lastCheckIn: null,
    completedChallenges: [],
    totalReferrals: 0,
    seasonalEventProgress: {},
    leaderboardRank: 1,
    weeklyPoints: 0,
    monthlyPoints: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadGamificationState();
    } else {
      resetGamificationState();
    }
  }, [user]);

  const resetGamificationState = () => {
    setGamificationState({
      points: 0,
      level: "beginner",
      levelRank: 1,
      badges: [],
      streak: 0,
      dailyChallengeStatus: {},
      weeklyChallengeStatus: {},
      referralCode: generateReferralCode(),
      lastCheckIn: null,
      completedChallenges: [],
      totalReferrals: 0,
      seasonalEventProgress: {},
      leaderboardRank: 1,
      weeklyPoints: 0,
      monthlyPoints: 0,
    });
    setIsLoading(false);
  };

  const loadGamificationState = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getGamificationData(user.id);
      
      // Handle auth errors gracefully
      if (!data) {
        console.warn('[Gamification] No data available, using fallback');
        resetGamificationState();
        return;
      }
      
      const dailyChallenges = await getDailyChallengesData(user.id);
      const leaderboardRank = await getLeaderboardPosition();

      setGamificationState({
        ...data,
        dailyChallengeStatus: dailyChallenges,
        leaderboardRank,
      });

      // Filter daily and weekly challenges
      const allChallenges = Array.isArray(gamificationConfig.challenges) ? gamificationConfig.challenges : [];
      
      setAvailableChallenges(
        allChallenges.filter(ch => ch.type === 'daily' && !data.completedChallenges.includes(ch.id))
      );
      
      setAvailableWeeklyChallenges(
        allChallenges.filter(ch => ch.type === 'weekly' && !data.completedChallenges.includes(ch.id))
      );
    } catch (err) {
      console.error("[⚠️ Gamification] Error loading data:", err);
      
      // Check for auth errors (401/403)
      if (err?.status === 401 || err?.status === 403 || err?.message?.includes('auth')) {
        console.warn('[Gamification] Auth error detected, using fallback UI');
        resetGamificationState();
        return;
      }
      
      // For other errors, show fallback but don't spam user with toasts
      console.warn('[Gamification] Using fallback data due to error');
      resetGamificationState();
    } finally {
      setIsLoading(false);
    }
  };

  const updatePoints = async (points: number, action?: string) => {
    if (!user?.id) return;
    const newPoints = gamificationState.points + points;
    
    // Check for level up
    const currentLevel = getCurrentLevelInfo();
    const newLevel = calculateLevel(newPoints);
    
    if (newLevel.rank > currentLevel.rank) {
      await levelUp(newLevel.id);
    }
    
    await updateGamificationData(user.id, { points: newPoints });
    setGamificationState((prev) => ({ ...prev, points: newPoints }));
    
    // Track points earned
    if (action) {
      trackEvent('points_earned', 'gamification', action, points, {
        user_id: user.id,
        total_points: newPoints,
        level: gamificationState.level
      });
    }
  };

  const completeChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      await completeDataRouterChallenge(user.id, challengeId);
      toast.success("✅ Challenge voltooid!");

      const challenge = gamificationConfig.challenges?.find(ch => ch.id === challengeId);
      const points = challenge?.points || getPointsForAction("challenge");

      setGamificationState((prev) => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        points: prev.points + points,
      }));
      
      // Track challenge completion
      trackEvent('challenge_completed', 'gamification', challengeId, points, {
        user_id: user.id,
        challenge_type: challenge?.type || 'daily',
        difficulty: challenge?.difficulty || 'medium'
      });
    } catch (err) {
      console.error("❌ Challenge voltooiing mislukt:", err);
      toast.error("Challenge kon niet worden voltooid.");
    }
  };

  const completeWeeklyChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      await completeDataRouterChallenge(user.id, challengeId);
      toast.success("🎉 Weekly Challenge voltooid!");

      const challenge = gamificationConfig.challenges?.find(ch => ch.id === challengeId);
      const points = challenge?.points || 75;

      setGamificationState((prev) => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        points: prev.points + points,
        weeklyPoints: prev.weeklyPoints + points,
      }));
      
      trackEvent('weekly_challenge_completed', 'gamification', challengeId, points, {
        user_id: user.id,
        difficulty: challenge?.difficulty || 'medium'
      });
    } catch (err) {
      console.error("❌ Weekly challenge voltooiing mislukt:", err);
      toast.error("Weekly challenge kon niet worden voltooid.");
    }
  };

  const levelUp = async (newLevel: string) => {
    if (!user?.id) return;

    const levelInfo = gamificationConfig.levels.find(l => l.id === newLevel);
    if (!levelInfo) return;

    try {
      await updateGamificationData(user.id, { 
        level: newLevel,
        updated_at: new Date().toISOString()
      });
      
      setGamificationState((prev) => ({ 
        ...prev, 
        level: newLevel,
        levelRank: levelInfo.rank
      }));
      
      // Show level up notification
      toast.success(`🎉 Level Up! Je bent nu ${levelInfo.name}!`, { duration: 5000 });
      
      // Track level up
      trackEvent('level_up', 'gamification', newLevel, levelInfo.rank, {
        user_id: user.id,
        previous_level: gamificationState.level,
        points_at_levelup: gamificationState.points
      });
    } catch (err) {
      console.error("❌ Level up mislukt:", err);
    }
  };

  const calculateLevel = (points: number) => {
    const levels = gamificationConfig.levels.sort((a, b) => b.minPoints - a.minPoints);
    return levels.find(level => points >= level.minPoints) || levels[levels.length - 1];
  };

  const getCurrentLevelInfo = () => {
    return gamificationConfig.levels.find(l => l.id === gamificationState.level) || gamificationConfig.levels[0];
  };

  const getLeaderboardPosition = async (): Promise<number> => {
    if (!user?.id) return 1;
    
    try {
      // This would be implemented with a Supabase RPC function
      // For now, return a mock position
      return Math.floor(Math.random() * 100) + 1;
    } catch (error) {
      console.error('Error getting leaderboard position:', error);
      return 1;
    }
  };

  const getCurrentLevelPerks = (): string[] => {
    const currentLevel = getCurrentLevelInfo();
    return currentLevel?.perks || [];
  };
  // Acties
  const completeQuiz = () => updatePoints(getPointsForAction("quiz"), "quiz");
  const makePurchase = (amount = 1) => updatePoints(getPointsForAction("purchase") * amount, "purchase");
  const checkIn = () => updatePoints(getPointsForAction("checkin"), "checkin");
  const recordReferral = () => updatePoints(getPointsForAction("referral"), "referral");
  const viewRecommendation = () => updatePoints(getPointsForAction("view"), "view");
  const shareOutfit = () => updatePoints(getPointsForAction("share"), "share");
  const saveOutfit = () => updatePoints(getPointsForAction("save"), "save");

  // Helpers
  const getPointsForAction = (action: string): number => {
    return gamificationConfig.actions?.[action]?.points || 0;
  };

  const canEarnBadge = (badgeId: string): boolean => {
    return !gamificationState.badges.includes(badgeId);
  };

  const getProgressToNextLevel = (): number => {
    const current = getCurrentLevelInfo();
    const next = gamificationConfig.levels.find((l) => l.rank === current.rank + 1);

    if (!next) return 100; // Max level reached

    const range = next.minPoints - current.minPoints;
    const progress = gamificationState.points - current.minPoints;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  const isSeasonalEventActive = () => true; // TODO: Replace with real logic
  const getSeasonalMultiplier = () => 1; // TODO: Replace with real logic

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = gamificationConfig.levels.find(
    (l) => l.rank === currentLevelInfo.rank + 1
  );
  const earnedBadges = (gamificationConfig.badges || []).filter((b) =>
    gamificationState.badges.includes(b.id)
  );

  return (
    <GamificationContext.Provider
      value={{
        ...gamificationState,
        availableChallenges,
        availableWeeklyChallenges,
        isLoading,
        progressToNextLevel: getProgressToNextLevel(),
        completeQuiz,
        makePurchase,
        checkIn,
        completeChallenge,
        completeWeeklyChallenge,
        recordReferral,
        viewRecommendation,
        shareOutfit,
        saveOutfit,
        levelUp,
        getPointsForAction,
        canEarnBadge,
        getProgressToNextLevel,
        isSeasonalEventActive,
        getSeasonalMultiplier,
        getLeaderboardPosition,
        getCurrentLevelPerks,
        currentLevelInfo,
        nextLevelInfo,
        earnedBadges,
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

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
