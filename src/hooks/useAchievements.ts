import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { Achievement, UserAchievement } from '../types/achievements';
import { achievements, getEarnedAchievements } from '../data/achievements';
import toast from 'react-hot-toast';

// Get singleton client
const sb = supabase();

export function useAchievements() {
  const { user } = useUser();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    loadUserAchievements();
  }, [user?.id]);

  const loadUserAchievements = async () => {
    if (!user?.id) return;

    if (!sb) {
      console.warn('[Achievements] Supabase not available');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await sb
        .from('quiz_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndAwardAchievements = async (quizAnswers: any, metadata: any = {}) => {
    if (!user?.id) return [];

    const earnedAchievements = getEarnedAchievements(quizAnswers, metadata);
    const newAchievements: Achievement[] = [];

    for (const achievement of earnedAchievements) {
      // Check if user already has this achievement
      const hasAchievement = userAchievements.some(
        ua => ua.achievement_id === achievement.id
      );

      if (!hasAchievement) {
        if (!sb) {
          console.warn('[Achievements] Supabase not available for awarding');
          continue;
        }
        
        try {
          const { error } = await sb
            .from('quiz_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
              achievement_type: achievement.type,
              metadata
            });

          if (!error) {
            newAchievements.push(achievement);
            
            // Show achievement toast
            toast.success(
              `🏆 Achievement Unlocked: ${achievement.title}!`,
              { duration: 4000 }
            );
          }
        } catch (error) {
          console.error('Error awarding achievement:', error);
        }
      }
    }

    if (newAchievements.length > 0) {
      await loadUserAchievements(); // Refresh list
    }

    return newAchievements;
  };

  const getAchievementProgress = () => {
    const totalAchievements = achievements.length;
    const earnedCount = userAchievements.length;
    const progressPercentage = Math.round((earnedCount / totalAchievements) * 100);

    return {
      earned: earnedCount,
      total: totalAchievements,
      percentage: progressPercentage
    };
  };

  const hasAchievement = (achievementId: string): boolean => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  return {
    userAchievements,
    isLoading,
    checkAndAwardAchievements,
    getAchievementProgress,
    hasAchievement,
    refetch: loadUserAchievements
  };
}