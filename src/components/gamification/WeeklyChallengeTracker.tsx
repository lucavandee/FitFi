import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Trophy, Sparkles, Flame } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';

interface WeeklyChallenge {
  day_of_week: number;
  theme_name: string;
  theme_description: string;
  theme_icon: string;
  xp_reward: number;
  is_completed: boolean;
  week_start_date: string;
}

export function WeeklyChallengeTracker() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [completingDay, setCompletingDay] = useState<number | null>(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['weeklyProgress', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return [];

      const { data, error } = await client.rpc('get_current_week_progress', {
        p_user_id: user.id,
      });

      if (error) {
        return [];
      }

      return data as WeeklyChallenge[];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const handleCompleteDay = async (dayOfWeek: number) => {
    if (!user || completingDay !== null) return;

    const challenge = challenges.find((c) => c.day_of_week === dayOfWeek);
    if (!challenge || challenge.is_completed) return;

    setCompletingDay(dayOfWeek);

    try {
      const client = supabase();
      if (!client) throw new Error('Supabase client not available');

      const { data, error } = await client.rpc('complete_daily_challenge', {
        p_user_id: user.id,
        p_day_of_week: dayOfWeek,
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        if (result.week_completed) {
          toast.success(`Week voltooid! +${result.total_week_xp} XP totaal (incl. 200 bonus!)`, {
            icon: '🏆',
            duration: 5000,
          });
        } else {
          toast.success(`${challenge.theme_name} voltooid! +${result.xp_earned} XP`, {
            icon: challenge.theme_icon,
            duration: 4000,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['weeklyProgress', user.id] });
        queryClient.invalidateQueries({ queryKey: ['gamification', user.id] });
      } else {
        toast.error('Challenge voltooien mislukt');
      }
    } catch (err) {
      toast.error('Er ging iets mis');
    } finally {
      setCompletingDay(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#FFFFFF] rounded-2xl p-6 shadow-lg border-2 border-[#E5E5E5]">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-[#FAFAF8] rounded w-2/3" />
          <div className="h-20 bg-[#FAFAF8] rounded" />
        </div>
      </div>
    );
  }

  const completedCount = challenges.filter((c) => c.is_completed).length;
  const totalChallenges = challenges.length;
  const progressPercentage = (completedCount / totalChallenges) * 100;
  const isWeekComplete = completedCount === totalChallenges;

  const today = new Date().getDay();

  return (
    <div className="bg-white dark:bg-[#FFFFFF] rounded-2xl p-6 shadow-lg border-2 border-[#E5E5E5] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C2654A]" />
            Weekly Outfit Challenge
          </h4>
          <p className="text-sm text-[#8A8A8A] mt-1">
            Voltooi dagelijkse stijl-uitdagingen
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#1A1A1A]">
            {completedCount}/{totalChallenges}
          </div>
          <p className="text-xs text-[#8A8A8A]">
            {isWeekComplete ? 'Week compleet!' : 'dagen voltooid'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-[#FAFAF8] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isWeekComplete
                ? 'bg-gradient-to-r from-[#C2654A] to-[#A8513A]'
                : 'bg-gradient-to-r from-[#C2654A] to-[#C2654A]'
            }`}
          />
        </div>
      </div>

      {isWeekComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-gradient-to-r from-[#FAF5F2] to-[#FAF5F2] border-2 border-[#D4856E] rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#C2654A] flex-shrink-0" />
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1">
                Geweldig! Week voltooid 🎉
              </p>
              <p className="text-sm text-[#8A8A8A]">
                Je hebt alle 7 dagelijkse uitdagingen voltooid en +200 bonus XP verdiend!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Challenges */}
      <div className="space-y-3">
        {challenges.map((challenge, index) => (
          <ChallengeDay
            key={challenge.day_of_week}
            challenge={challenge}
            isToday={challenge.day_of_week === today}
            isCompleting={completingDay === challenge.day_of_week}
            onComplete={() => handleCompleteDay(challenge.day_of_week)}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Bonus Info */}
      <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-[#8A8A8A]">
          <Sparkles className="w-4 h-4" />
          <span>Voltooibonus: +200 XP</span>
        </div>
        {!isWeekComplete && (
          <div className="flex items-center gap-2 text-[#C2654A] font-semibold">
            <Flame className="w-4 h-4" />
            <span>{totalChallenges - completedCount} nog te gaan!</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChallengeDayProps {
  challenge: WeeklyChallenge;
  isToday: boolean;
  isCompleting: boolean;
  onComplete: () => void;
  delay: number;
}

function ChallengeDay({
  challenge,
  isToday,
  isCompleting,
  onComplete,
  delay,
}: ChallengeDayProps) {
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`
        relative p-4 rounded-xl border-2 transition-all
        ${isToday ? 'ring-2 ring-[#C2654A] ring-offset-2' : ''}
        ${
          challenge.is_completed
            ? 'bg-gradient-to-r from-[#FAF5F2] to-[#FAF5F2] border-[#D4856E]'
            : 'bg-[#FFFFFF] border-[#E5E5E5] hover:border-[#D4856E]'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md
              ${
                challenge.is_completed
                  ? 'bg-gradient-to-br from-[#C2654A] to-[#C2654A]'
                  : 'bg-[#FAFAF8]'
              }
            `}
          >
            {challenge.theme_icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-bold text-[#1A1A1A] text-sm">
              {dayNames[challenge.day_of_week]}
            </h5>
            {isToday && (
              <span className="px-2 py-0.5 bg-[#C2654A] text-white text-xs font-semibold rounded-full">
                Vandaag
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
            {challenge.theme_name}
          </p>
          <p className="text-xs text-[#8A8A8A] line-clamp-2">
            {challenge.theme_description}
          </p>
        </div>

        <div className="flex-shrink-0">
          {challenge.is_completed ? (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-8 h-8 text-[#C2654A]" />
              <span className="text-xs font-semibold text-[#A8513A]">
                +{challenge.xp_reward} XP
              </span>
            </div>
          ) : (
            <button
              onClick={onComplete}
              disabled={isCompleting}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#FAF5F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Circle className="w-8 h-8 text-[#8A8A8A]" />
                </motion.div>
              ) : (
                <>
                  <Circle className="w-8 h-8 text-[#8A8A8A]" />
                  <span className="text-xs font-semibold text-[#C2654A]">
                    +{challenge.xp_reward} XP
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
