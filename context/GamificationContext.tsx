import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import gamificationConfig from '../config/gamification.json';
import { getUserGamification, updateUserGamification, completeChallenge as completeSupabaseChallenge, getDailyChallenges } from '../services/supabaseService';
import toast from 'react-hot-toast';
import { isValidUUID, TEST_USER_ID } from '../lib/supabase';

interface GamificationState {
  points: number;
  level: string;
  badges: string[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  referralCode: string;
  lastCheckIn: string | null;
  completedChallenges: string[];
  totalReferrals: number;
  seasonalEventProgress: Record<string, any>;
}

interface GamificationContextType {
  // State
  points: number;
  level: string;
  currentLevelInfo: any;
  nextLevelInfo: any;
  badges: string[];
  earnedBadges: any[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  availableChallenges: any[];
  referralCode: string;
  totalReferrals: number;
  isLoading: boolean;
  
  // Actions
  completeQuiz: () => Promise<void>;
  makePurchase: (amount?: number) => Promise<void>;
  checkIn: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  recordReferral: (code: string) => Promise<void>;
  viewRecommendation: () => Promise<void>;
  shareOutfit: () => Promise<void>;
  saveOutfit: () => Promise<void>;
  
  // Utilities
  getPointsForAction: (action: string) => number;
  canEarnBadge: (badgeId: string) => boolean;
  getProgressToNextLevel: () => number;
  isSeasonalEventActive: () => boolean;
  getSeasonalMultiplier: () => number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSupabaseConnected } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [gamificationState, setGamificationState] = useState<GamificationState>({
    points: 0,
    level: 'beginner',
    badges: [],
    streak: 0,
    dailyChallengeStatus: {},
    referralCode: '',
    lastCheckIn: null,
    completedChallenges: [],
    totalReferrals: 0,
    seasonalEventProgress: {}
  });

  // Initialize gamification state
  useEffect(() => {
    if (user) {
      loadGamificationState();
    } else {
      // Reset state for non-logged in users
      setGamificationState({
        points: 0,
        level: 'beginner',
        badges: [],
        streak: 0,
        dailyChallengeStatus: resetDailyChallenges(),
        referralCode: generateReferralCode(),
        lastCheckIn: null,
        completedChallenges: [],
        totalReferrals: 0,
        seasonalEventProgress: {}
      });
    }
    setIsLoading(false);
  }, [user]);

  const loadGamificationState = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Try to get gamification data from Supabase
      if (isSupabaseConnected) {
        // Always use test user ID for development
        const effectiveUserId = TEST_USER_ID;
        
        const gamificationData = await getUserGamification(effectiveUserId);
        
        if (gamificationData) {
          const dailyChallengeStatus = await getDailyChallengeStatus(effectiveUserId);
          
          setGamificationState({
            points: gamificationData.points || 0,
            level: gamificationData.level || 'beginner',
            badges: gamificationData.badges || [],
            streak: gamificationData.streak || 0,
            dailyChallengeStatus: dailyChallengeStatus || resetDailyChallenges(),
            referralCode: gamificationData.referral_code || generateReferralCode(),
            lastCheckIn: gamificationData.last_check_in,
            completedChallenges: gamificationData.completed_challenges || [],
            totalReferrals: gamificationData.total_referrals || 0,
            seasonalEventProgress: gamificationData.seasonal_event_progress || {}
          });
          return;
        }
      }
      
      // Fallback to localStorage
      const savedState = localStorage.getItem(`fitfi-gamification-${user.id}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setGamificationState({
            ...parsed,
            referralCode: parsed.referralCode || generateReferralCode(),
            seasonalEventProgress: parsed.seasonalEventProgress || {}
          });
        } catch (error) {
          console.error('Error loading gamification state:', error);
          initializeNewUser();
        }
      } else {
        initializeNewUser();
      }
    } catch (error) {
      console.error('Error loading gamification state:', error);
      initializeNewUser();
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyChallengeStatus = async (userId: string): Promise<Record<string, boolean> | null> => {
    try {
      if (!isSupabaseConnected) return null;
      
      const challenges = await getDailyChallenges(userId);
      
      if (!challenges || challenges.length === 0) {
        console.log('No daily challenges found, returning default status');
        return resetDailyChallenges();
      }
      
      const status: Record<string, boolean> = {};
      
      // Initialize all challenges as not completed
      gamificationConfig.dailyChallenges.forEach(challenge => {
        status[challenge.id] = false;
      });
      
      // Update with completed challenges
      challenges.forEach(challenge => {
        status[challenge.challenge_id] = challenge.completed;
      });
      
      return status;
    } catch (error) {
      console.error('Error getting daily challenge status:', error);
      return resetDailyChallenges();
    }
  };

  const initializeNewUser = () => {
    const newState: GamificationState = {
      points: 0,
      level: 'beginner',
      badges: [],
      streak: 0,
      dailyChallengeStatus: resetDailyChallenges(),
      referralCode: generateReferralCode(),
      lastCheckIn: null,
      completedChallenges: [],
      totalReferrals: 0,
      seasonalEventProgress: {}
    };
    setGamificationState(newState);
    saveGamificationState(newState);
  };

  const saveGamificationState = async (state: GamificationState) => {
    if (!user) return;
    
    // Save to localStorage as fallback
    localStorage.setItem(`fitfi-gamification-${user.id}`, JSON.stringify(state));
    
    // Save to Supabase if connected
    if (isSupabaseConnected) {
      try {
        // Always use test user ID for development
        const effectiveUserId = TEST_USER_ID;
        
        if (!isValidUUID(effectiveUserId)) {
          console.error('Invalid UUID format for saveGamificationState, skipping database update');
          return;
        }
        
        await updateUserGamification(effectiveUserId, {
          points: state.points,
          level: state.level,
          badges: state.badges,
          streak: state.streak,
          last_check_in: state.lastCheckIn,
          completed_challenges: state.completedChallenges,
          total_referrals: state.totalReferrals,
          seasonal_event_progress: state.seasonalEventProgress || {}
        });
      } catch (error) {
        console.error('Error saving gamification state to Supabase:', error);
      }
    }
  };

  const generateReferralCode = (): string => {
    const userId = user?.id || 'guest';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FITFI${userId.substring(0, 3).toUpperCase()}${randomSuffix}`;
  };

  const resetDailyChallenges = (): Record<string, boolean> => {
    const challenges: Record<string, boolean> = {};
    gamificationConfig.dailyChallenges.forEach(challenge => {
      challenges[challenge.id] = false;
    });
    return challenges;
  };

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const lastCheckIn = gamificationState.lastCheckIn;
    
    if (!lastCheckIn || new Date(lastCheckIn).toDateString() !== today) {
      // Reset daily challenges
      setGamificationState(prev => ({
        ...prev,
        dailyChallengeStatus: resetDailyChallenges()
      }));
    }
  };

  const addPoints = async (points: number, action: string) => {
    const multiplier = getSeasonalMultiplier();
    const finalPoints = Math.round(points * multiplier);
    
    const newState = {
      ...gamificationState,
      points: gamificationState.points + finalPoints
    };

    // Check for level up
    const newLevel = calculateLevel(newState.points);
    if (newLevel !== gamificationState.level) {
      newState.level = newLevel;
      // Show level up notification
      toast.success(`Level up! Je bent nu ${newLevel}!`);
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'level_up', {
          event_category: 'gamification',
          event_label: newLevel,
          value: newState.points
        });
      }
    }

    // Check for new badges
    const newBadges = checkForNewBadges(newState, action);
    if (newBadges.length > 0) {
      newState.badges = [...new Set([...newState.badges, ...newBadges])];
      
      // Show badge notification
      newBadges.forEach(badge => {
        const badgeInfo = gamificationConfig.badges.find(b => b.id === badge);
        if (badgeInfo) {
          toast.success(`Nieuwe badge verdiend: ${badgeInfo.label}!`);
        }
      });
    }

    setGamificationState(newState);
    saveGamificationState(newState);

    // Track points earned
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'points_earned', {
        event_category: 'gamification',
        event_label: action,
        value: finalPoints
      });
    }
  };

  const calculateLevel = (points: number): string => {
    const levels = gamificationConfig.levels.sort((a, b) => b.threshold - a.threshold);
    for (const level of levels) {
      if (points >= level.threshold) {
        return level.id;
      }
    }
    return 'beginner';
  };

  const checkForNewBadges = (state: GamificationState, action: string): string[] => {
    const newBadges: string[] = [];

    // First quiz badge
    if (action === 'quiz' && !state.badges.includes('first_quiz')) {
      newBadges.push('first_quiz');
    }

    // Streak badge
    if (state.streak >= 7 && !state.badges.includes('seven_day_streak')) {
      newBadges.push('seven_day_streak');
    }

    // Purchase badge
    if (action === 'purchase' && !state.badges.includes('pro_purchaser')) {
      newBadges.push('pro_purchaser');
    }

    // Referral badge
    if (state.totalReferrals >= 3 && !state.badges.includes('referrer')) {
      newBadges.push('referrer');
    }

    // Challenge master badge
    if (state.completedChallenges.length >= 20 && !state.badges.includes('challenge_master')) {
      newBadges.push('challenge_master');
    }

    return newBadges;
  };

  const getSeasonalMultiplier = (): number => {
    const activeEvent = gamificationConfig.seasonalEvents.find(event => {
      const now = new Date();
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return now >= start && now <= end;
    });

    return activeEvent ? activeEvent.bonusMultiplier : 1;
  };

  // Action implementations
  const completeQuiz = async () => {
    await addPoints(gamificationConfig.pointsPerAction.quizComplete, 'quiz');
  };

  const makePurchase = async (amount: number = 0) => {
    const basePoints = gamificationConfig.pointsPerAction.purchase;
    const bonusPoints = Math.floor(amount / 10); // 1 point per €10 spent
    await addPoints(basePoints + bonusPoints, 'purchase');
  };

  const checkIn = async () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = 1;
    if (gamificationState.lastCheckIn) {
      const lastCheckInDate = new Date(gamificationState.lastCheckIn).toDateString();
      if (lastCheckInDate === yesterday) {
        newStreak = gamificationState.streak + 1;
      } else if (lastCheckInDate === today) {
        // Already checked in today
        return;
      }
    }

    const newState = {
      ...gamificationState,
      streak: newStreak,
      lastCheckIn: new Date().toISOString(),
      points: gamificationState.points + gamificationConfig.pointsPerAction.dailyCheckIn
    };

    setGamificationState(newState);
    saveGamificationState(newState);

    // Track check-in
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'daily_check_in', {
        event_category: 'gamification',
        event_label: 'check_in',
        value: newStreak
      });
    }
    
    toast.success(`Dagelijkse check-in: +${gamificationConfig.pointsPerAction.dailyCheckIn} punten!`);
  };

  const completeChallenge = async (challengeId: string) => {
    if (gamificationState.dailyChallengeStatus[challengeId]) {
      return; // Already completed
    }

    const challenge = gamificationConfig.dailyChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Update local state
    const newState = {
      ...gamificationState,
      dailyChallengeStatus: {
        ...gamificationState.dailyChallengeStatus,
        [challengeId]: true
      },
      completedChallenges: [...gamificationState.completedChallenges, challengeId]
    };

    setGamificationState(newState);
    saveGamificationState(newState);

    // Update Supabase if connected
    if (user && isSupabaseConnected) {
      try {
        // Always use test user ID for development
        const effectiveUserId = TEST_USER_ID;
        
        if (isValidUUID(effectiveUserId)) {
          await completeSupabaseChallenge(effectiveUserId, challengeId);
        } else {
          console.error('Invalid UUID format for completeChallenge, skipping database update');
        }
      } catch (error) {
        console.error('Error completing challenge in Supabase:', error);
      }
    }

    await addPoints(challenge.points, 'challenge');
    
    toast.success(`Uitdaging voltooid: +${challenge.points} punten!`);
  };

  const recordReferral = async (code: string) => {
    const newState = {
      ...gamificationState,
      totalReferrals: gamificationState.totalReferrals + 1
    };

    setGamificationState(newState);
    saveGamificationState(newState);

    await addPoints(gamificationConfig.pointsPerAction.referralSignup, 'referral');

    // Bonus for multiple referrals
    if (newState.totalReferrals % gamificationConfig.referralRewards.bonusThreshold === 0) {
      await addPoints(gamificationConfig.referralRewards.bonusPoints, 'referral_bonus');
      toast.success(`Referral bonus: +${gamificationConfig.referralRewards.bonusPoints} punten!`);
    }
  };

  const viewRecommendation = async () => {
    // Small points for engagement
    await addPoints(2, 'view_recommendation');
  };

  const shareOutfit = async () => {
    await addPoints(15, 'share_outfit');
    await completeChallenge('shareLook');
  };

  const saveOutfit = async () => {
    await addPoints(5, 'save_outfit');
    await completeChallenge('saveOutfit');
  };

  // Utility functions
  const getPointsForAction = (action: string): number => {
    return gamificationConfig.pointsPerAction[action] || 0;
  };

  const canEarnBadge = (badgeId: string): boolean => {
    return !gamificationState.badges.includes(badgeId);
  };

  const getProgressToNextLevel = (): number => {
    const currentLevel = gamificationConfig.levels.find(l => l.id === gamificationState.level);
    const nextLevel = gamificationConfig.levels.find(l => l.threshold > gamificationState.points);
    
    if (!nextLevel) return 100; // Max level reached
    
    const currentThreshold = currentLevel?.threshold || 0;
    const nextThreshold = nextLevel.threshold;
    const progress = ((gamificationState.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const isSeasonalEventActive = (): boolean => {
    return getSeasonalMultiplier() > 1;
  };

  // Computed values
  const currentLevelInfo = gamificationConfig.levels.find(l => l.id === gamificationState.level);
  const nextLevelInfo = gamificationConfig.levels.find(l => l.threshold > gamificationState.points);
  const earnedBadges = gamificationConfig.badges.filter(badge => gamificationState.badges.includes(badge.id));
  const availableChallenges = gamificationConfig.dailyChallenges.filter(challenge => 
    !gamificationState.dailyChallengeStatus[challenge.id]
  );

  // Check for daily reset on component mount and state changes
  useEffect(() => {
    checkDailyReset();
  }, []);

  const value: GamificationContextType = {
    // State
    points: gamificationState.points,
    level: gamificationState.level,
    currentLevelInfo,
    nextLevelInfo,
    badges: gamificationState.badges,
    earnedBadges,
    streak: gamificationState.streak,
    dailyChallengeStatus: gamificationState.dailyChallengeStatus,
    availableChallenges,
    referralCode: gamificationState.referralCode,
    totalReferrals: gamificationState.totalReferrals,
    isLoading,
    
    // Actions
    completeQuiz,
    makePurchase,
    checkIn,
    completeChallenge,
    recordReferral,
    viewRecommendation,
    shareOutfit,
    saveOutfit,
    
    // Utilities
    getPointsForAction,
    canEarnBadge,
    getProgressToNextLevel,
    isSeasonalEventActive,
    getSeasonalMultiplier
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};