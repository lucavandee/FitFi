import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamification/gamificationService';
import { useUser } from '@/context/UserContext';

export function GamificationDashboardMini() {
  const { user } = useUser();

  const { data: stats } = useQuery({
    queryKey: ['gamification', user?.id],
    queryFn: () => gamificationService.getUserStats(user!.id),
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => gamificationService.getUserAchievements(user!.id),
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user || !stats) return null;

  const levelInfo = gamificationService.getNextLevelInfo(stats.total_xp);

  return (
    <div className="space-y-4">
      {/* XP Progress Card */}
      <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border-2 border-[var(--ff-color-primary-200)] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md">
              <span className="text-2xl">{levelInfo.current.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                {levelInfo.current.name}
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                Level {stats.current_level}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--ff-color-primary-700)]">
              {stats.total_xp}
            </div>
            <div className="text-xs text-[var(--color-muted)]">XP</div>
          </div>
        </div>

        {/* Progress Bar */}
        {levelInfo.next && (
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-2">
              <span>Tot volgend level</span>
              <span className="font-semibold">
                {levelInfo.xpToNext} XP
              </span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-2 text-xs text-[var(--color-muted)] text-center">
              Volgend: {levelInfo.next.name} {levelInfo.next.icon}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Achievements"
          value={stats.achievements_count}
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Streak"
          value={`${stats.daily_streak} dagen`}
          color="from-orange-400 to-red-500"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Challenges"
          value={stats.challenges_completed}
          color="from-blue-400 to-purple-500"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Outfits"
          value={stats.outfits_saved}
          color="from-pink-400 to-rose-500"
        />
      </div>

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[var(--color-border)] p-4 shadow-md">
          <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--ff-color-accent-600)]" />
            Recente Achievements
          </h4>
          <div className="space-y-2">
            {achievements.slice(0, 3).map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 bg-[var(--ff-color-primary-50)] rounded-lg"
              >
                <span className="text-2xl">{achievement.achievement_icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {achievement.achievement_name}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {new Date(achievement.unlocked_at).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-[var(--color-border)] p-4 shadow-md">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-md`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)] mb-1">
        {value}
      </div>
      <div className="text-xs text-[var(--color-muted)] font-medium">
        {label}
      </div>
    </div>
  );
}
