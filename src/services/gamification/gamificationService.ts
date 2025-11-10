import { supabase } from '@/lib/supabaseClient';
import gamificationConfig from '@/config/gamification.json';

export interface UserGamification {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  level_name: string;
  daily_streak: number;
  longest_streak: number;
  last_checkin_at: string | null;
  achievements_count: number;
  challenges_completed: number;
  outfits_saved: number;
  outfits_shared: number;
  referrals_made: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_icon: string;
  unlocked_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_type: string;
  challenge_name: string;
  points: number;
  status: 'active' | 'completed' | 'expired';
  progress: number;
  target: number;
  started_at: string;
  completed_at?: string;
  expires_at?: string;
}

export const gamificationService = {
  async getUserStats(userId: string): Promise<UserGamification | null> {
    const client = supabase();
    if (!client) return null;

    const { data, error } = await client
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching gamification stats:', error);
      return null;
    }

    return data;
  },

  async initializeUser(userId: string): Promise<boolean> {
    const client = supabase();
    if (!client) return false;

    const { error } = await client
      .from('user_gamification')
      .insert({
        user_id: userId,
        total_xp: 0,
        current_level: 1,
        level_name: 'Style Starter',
      });

    if (error && error.code !== '23505') {
      console.error('Error initializing gamification:', error);
      return false;
    }

    return true;
  },

  async awardXP(
    userId: string,
    eventType: string,
    xp: number,
    metadata: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    xp_awarded?: number;
    total_xp?: number;
    level?: number;
    level_name?: string;
    leveled_up?: boolean;
  } | null> {
    const client = supabase();
    if (!client) return null;

    const { data, error } = await client.rpc('award_xp', {
      p_user_id: userId,
      p_event_type: eventType,
      p_xp: xp,
      p_metadata: metadata,
    });

    if (error) {
      console.error('Error awarding XP:', error);
      return null;
    }

    return data;
  },

  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<boolean> {
    const achievement = gamificationConfig.badges.find(
      (b) => b.id === achievementId
    );
    if (!achievement) return false;

    const client = supabase();
    if (!client) return false;

    const { data, error } = await client.rpc('unlock_achievement', {
      p_user_id: userId,
      p_achievement_id: achievementId,
      p_achievement_name: achievement.label,
      p_achievement_icon: achievement.icon,
    });

    if (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }

    return data?.success || false;
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const client = supabase();
    if (!client) return [];

    const { data, error } = await client
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data || [];
  },

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    const client = supabase();
    if (!client) return [];

    const { data, error } = await client
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    return data || [];
  },

  async assignDailyChallenges(userId: string): Promise<boolean> {
    const client = supabase();
    if (!client) return false;

    const dailyChallenges = gamificationConfig.challenges.filter(
      (c) => c.type === 'daily'
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const challenge of dailyChallenges.slice(0, 3)) {
      await client.from('user_challenges').insert({
        user_id: userId,
        challenge_id: challenge.id,
        challenge_type: 'daily',
        challenge_name: challenge.label,
        points: challenge.points,
        status: 'active',
        progress: 0,
        target: 1,
        expires_at: tomorrow.toISOString(),
      });
    }

    return true;
  },

  async completeChallenge(
    userId: string,
    challengeId: string
  ): Promise<boolean> {
    const client = supabase();
    if (!client) return false;

    const { data: challenge } = await client
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('status', 'active')
      .maybeSingle();

    if (!challenge) return false;

    await client
      .from('user_challenges')
      .update({
        status: 'completed',
        progress: challenge.target,
        completed_at: new Date().toISOString(),
      })
      .eq('id', challenge.id);

    await this.awardXP(userId, 'challenge_complete', challenge.points, {
      challenge_id: challengeId,
      challenge_name: challenge.challenge_name,
    });

    await client
      .from('user_gamification')
      .update({
        challenges_completed: client.sql`challenges_completed + 1`,
      })
      .eq('user_id', userId);

    return true;
  },

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const client = supabase();
    if (!client) return [];

    const { data, error } = await client
      .from('user_gamification')
      .select(
        `
        user_id,
        total_xp,
        current_level,
        level_name,
        achievements_count,
        daily_streak
      `
      )
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  },

  getLevelInfo(level: number) {
    return gamificationConfig.levels.find((l) => l.rank === level);
  },

  getNextLevelInfo(currentXP: number) {
    const currentLevel =
      gamificationConfig.levels.find(
        (l, idx) =>
          currentXP >= l.minPoints &&
          (idx === gamificationConfig.levels.length - 1 ||
            currentXP < gamificationConfig.levels[idx + 1].minPoints)
      ) || gamificationConfig.levels[0];

    const currentIndex = gamificationConfig.levels.findIndex(
      (l) => l.id === currentLevel.id
    );
    const nextLevel = gamificationConfig.levels[currentIndex + 1];

    return {
      current: currentLevel,
      next: nextLevel,
      progress: nextLevel
        ? ((currentXP - currentLevel.minPoints) /
            (nextLevel.minPoints - currentLevel.minPoints)) *
          100
        : 100,
      xpToNext: nextLevel ? nextLevel.minPoints - currentXP : 0,
    };
  },

  async getActivityDates(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Date[]> {
    const client = supabase();
    if (!client) return [];

    try {
      const { data, error } = await client.rpc('get_user_activity_dates', {
        p_user_id: userId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
      });

      if (error) {
        console.error('Error fetching activity dates:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: { activity_date: string }) => new Date(row.activity_date));
    } catch (err) {
      console.error('Error in getActivityDates:', err);
      return [];
    }
  },

  async logDailyCheckin(userId: string): Promise<boolean> {
    const client = supabase();
    if (!client) return false;

    try {
      const { data, error } = await client.rpc('log_daily_checkin', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error logging daily check-in:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('Error in logDailyCheckin:', err);
      return false;
    }
  },
};
