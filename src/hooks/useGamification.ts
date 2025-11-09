import { useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { gamificationService } from '@/services/gamification/gamificationService';
import { showXPNotification } from '@/components/gamification/XPToast';
import gamificationConfig from '@/config/gamification.json';

export function useGamification() {
  const { user } = useUser();

  const awardXP = useCallback(
    async (eventType: keyof typeof gamificationConfig.pointsPerAction, metadata: Record<string, any> = {}) => {
      if (!user) return null;

      const xp = gamificationConfig.pointsPerAction[eventType];
      if (!xp) return null;

      const result = await gamificationService.awardXP(
        user.id,
        eventType,
        xp,
        metadata
      );

      if (result?.success) {
        showXPNotification({
          xp: result.xp_awarded || xp,
          message: getEventMessage(eventType),
          leveledUp: result.leveled_up,
          newLevel: result.level_name,
        });

        if (result.leveled_up) {
          await checkLevelAchievements(user.id, result.level || 1);
        }
      }

      return result;
    },
    [user]
  );

  const checkLevelAchievements = async (userId: string, level: number) => {
    if (level >= 10) {
      await gamificationService.unlockAchievement(userId, 'level_10');
    }
  };

  const onQuizComplete = useCallback(async () => {
    const result = await awardXP('quizComplete');
    if (result && user) {
      await gamificationService.unlockAchievement(user.id, 'first_quiz');
      await gamificationService.assignDailyChallenges(user.id);
    }
  }, [awardXP, user]);

  const onOutfitSave = useCallback(async () => {
    await awardXP('outfitSave');
  }, [awardXP]);

  const onOutfitShare = useCallback(async () => {
    await awardXP('outfitShare');
  }, [awardXP]);

  const onPurchase = useCallback(async (amount: number) => {
    const result = await awardXP('purchase', { amount });
    if (result && user) {
      await gamificationService.unlockAchievement(user.id, 'pro_purchaser');
      await gamificationService.unlockAchievement(user.id, 'premium_member');
    }
  }, [awardXP, user]);

  const onDailyCheckIn = useCallback(async () => {
    if (!user) return;

    const stats = await gamificationService.getUserStats(user.id);
    if (!stats) return;

    const lastCheckIn = stats.last_checkin_at
      ? new Date(stats.last_checkin_at)
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      lastDate.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === today.getTime()) {
        return;
      }
    }

    await awardXP('dailyCheckIn');

    if (stats.daily_streak >= 7) {
      await gamificationService.unlockAchievement(user.id, 'seven_day_streak');
    }
  }, [awardXP, user]);

  const onReferral = useCallback(async () => {
    const result = await awardXP('referralSignup');
    if (result && user) {
      const stats = await gamificationService.getUserStats(user.id);
      if (stats && stats.referrals_made >= 3) {
        await gamificationService.unlockAchievement(user.id, 'referrer');
      }
    }
  }, [awardXP, user]);

  const completeChallenge = useCallback(
    async (challengeId: string) => {
      if (!user) return false;
      return await gamificationService.completeChallenge(user.id, challengeId);
    },
    [user]
  );

  return {
    awardXP,
    onQuizComplete,
    onOutfitSave,
    onOutfitShare,
    onPurchase,
    onDailyCheckIn,
    onReferral,
    completeChallenge,
  };
}

function getEventMessage(eventType: string): string {
  const messages: Record<string, string> = {
    quizComplete: 'Quiz voltooid!',
    purchase: 'Aankoop gedaan!',
    dailyCheckIn: 'Daily check-in!',
    challengeComplete: 'Challenge voltooid!',
    referralSignup: 'Vriend uitgenodigd!',
    outfitShare: 'Outfit gedeeld!',
    outfitSave: 'Outfit opgeslagen!',
    profileComplete: 'Profiel voltooid!',
    weeklyStreak: 'Wekelijkse streak!',
    monthlyStreak: 'Maandelijkse streak!',
    firstPurchase: 'Eerste aankoop!',
    reviewWrite: 'Review geschreven!',
    friendInvite: 'Vriend uitgenodigd!',
  };

  return messages[eventType] || 'XP verdiend!';
}
