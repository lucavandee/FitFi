import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/lib/supabaseClient';

// Get singleton client
const sb = supabase();

interface GamificationData {
  points: number;
  level: string;
  badges: string[];
  streak: number;
  completedChallenges: string[];
  totalReferrals: number;
}

interface LevelInfo {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp?: number;
  icon: string;
  color: string;
  perks: string[];
}

interface GamificationContextValue {
  // Core data
  points: number;
  level: string;
  badges: any[];
  streak: number;
  completedChallenges: string[];
  totalReferrals: number;
  
  // Level info
  currentLevelInfo: LevelInfo | null;
  nextLevelInfo: LevelInfo | null;
  progressToNextLevel: number;
  
  // Rankings
  leaderboardRank: number;
  weeklyPoints: number;
  monthlyPoints: number;
  
  // Actions
  saveOutfit: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  addPoints: (amount: number, reason?: string) => Promise<void>;
  getCurrentLevelPerks: () => string[];
  
  // State
  isLoading: boolean;
  error: string | null;
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [data, setData] = useState<GamificationData>({
    points: 0,
    level: 'beginner',
    badges: [],
    streak: 0,
    completedChallenges: [],
    totalReferrals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock level data
  const levels: LevelInfo[] = [
    { id: 1, level_name: 'Beginner', min_xp: 0, max_xp: 100, icon: '🌱', color: '#10b981', perks: ['Basic recommendations'] },
    { id: 2, level_name: 'Explorer', min_xp: 100, max_xp: 300, icon: '🔍', color: '#3b82f6', perks: ['Daily challenges', 'Basic analytics'] },
    { id: 3, level_name: 'Enthusiast', min_xp: 300, max_xp: 600, icon: '✨', color: '#8b5cf6', perks: ['Weekly challenges', 'Outfit history'] },
    { id: 4, level_name: 'Trendsetter', min_xp: 600, max_xp: 1000, icon: '🎯', color: '#f59e0b', perks: ['Premium challenges', 'Style insights'] },
    { id: 5, level_name: 'Influencer', min_xp: 1000, icon: '⭐', color: '#ef4444', perks: ['Exclusive content', 'Early access'] }
  ];

  const currentLevelInfo = levels.find(l => l.level_name.toLowerCase() === data.level) || levels[0];
  const nextLevelInfo = levels.find(l => l.id === (currentLevelInfo?.id || 0) + 1) || null;
  
  const progressToNextLevel = nextLevelInfo 
    ? Math.round(((data.points - currentLevelInfo.min_xp) / (nextLevelInfo.min_xp - currentLevelInfo.min_xp)) * 100)
    : 100;

  useEffect(() => {
    if (user?.id) {
      loadGamificationData();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadGamificationData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to load from Supabase
      if (sb) {
        const { data: gamificationData, error } = await sb
          .from('user_gamification')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && gamificationData) {
          setData({
            points: gamificationData.points || 0,
            level: gamificationData.level || 'beginner',
            badges: gamificationData.badges || [],
            streak: gamificationData.streak || 0,
            completedChallenges: gamificationData.completed_challenges || [],
            totalReferrals: gamificationData.total_referrals || 0
          });
        } else {
          // Use default data
          setData({
            points: 120,
            level: 'beginner',
            badges: ['first_quiz'],
            streak: 2,
            completedChallenges: ['view3', 'shareLook'],
            totalReferrals: 1
          });
        }
      } else {
        // Fallback data when Supabase not available
        setData({
          points: 120,
          level: 'beginner',
          badges: ['first_quiz'],
          streak: 2,
          completedChallenges: ['view3', 'shareLook'],
          totalReferrals: 1
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setError('Kon gamification data niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  const saveOutfit = async (): Promise<void> => {
    await addPoints(15, 'outfit_save');
  };

  const completeChallenge = async (challengeId: string): Promise<void> => {
    if (data.completedChallenges.includes(challengeId)) return;
    
    setData(prev => ({
      ...prev,
      completedChallenges: [...prev.completedChallenges, challengeId]
    }));
    
    await addPoints(75, 'challenge_complete');
  };

  const addPoints = async (amount: number, reason?: string): Promise<void> => {
    setData(prev => ({
      ...prev,
      points: prev.points + amount
    }));

    // Update in Supabase if available
    if (sb && user?.id) {
      try {
        await sb
          .from('user_gamification')
          .upsert({
            user_id: user.id,
            points: data.points + amount,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.warn('Failed to update points in Supabase:', error);
      }
    }
  };

  const getCurrentLevelPerks = (): string[] => {
    return currentLevelInfo?.perks || [];
  };

  const value: GamificationContextValue = {
    // Core data
    points: data.points,
    level: data.level,
    badges: data.badges.map(badge => ({ badge_id: badge, badge_name: badge, badge_icon: '🏆', earned_at: new Date().toISOString() })),
    streak: data.streak,
    completedChallenges: data.completedChallenges,
    totalReferrals: data.totalReferrals,
    
    // Level info
    currentLevelInfo,
    nextLevelInfo,
    progressToNextLevel,
    
    // Rankings (mock data)
    leaderboardRank: 42,
    weeklyPoints: 85,
    monthlyPoints: 340,
    
    // Actions
    saveOutfit,
    completeChallenge,
    addPoints,
    getCurrentLevelPerks,
    
    // State
    isLoading,
    error
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextValue => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};