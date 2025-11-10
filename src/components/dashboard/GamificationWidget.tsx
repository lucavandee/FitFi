import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, TrendingUp, ArrowRight, Crown, Award, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamification/gamificationService';
import { useUser } from '@/context/UserContext';

export function GamificationWidget() {
  const { user } = useUser();

  const { data: stats, isLoading } = useQuery({
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

  if (!user || isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-3xl p-8 shadow-xl border-2 border-[var(--color-border)] animate-pulse">
          <div className="h-20 bg-white/50 rounded-xl mb-4"></div>
          <div className="h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const levelInfo = gamificationService.getNextLevelInfo(stats.total_xp);

  return (
    <div className="space-y-6">
      {/* Main XP Card - Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] rounded-3xl p-8 shadow-2xl border-2 border-white/50 hover-lift">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--ff-color-primary-300)] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--ff-color-accent-300)] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl">
                <span className="text-3xl">{levelInfo.current.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                  {levelInfo.current.name}
                </h3>
                <p className="text-sm text-[var(--color-muted)] font-medium">
                  Level {stats.current_level} • {stats.total_xp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] shadow-lg border border-[var(--color-border)]">
              <Crown className="w-4 h-4 inline mr-1" />
              Top {Math.ceil((stats.current_level / 50) * 100)}%
            </div>
          </div>

          {/* Progress Bar */}
          {levelInfo.next && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-[var(--color-muted)] mb-3">
                <span className="font-medium">Tot volgend level</span>
                <span className="font-bold text-[var(--ff-color-primary-700)]">
                  {levelInfo.xpToNext} XP
                </span>
              </div>
              <div className="h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-500)] to-[var(--ff-color-primary-600)] bg-[length:200%_100%]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${levelInfo.progress}%`,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    width: { duration: 1, ease: 'easeOut' },
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--color-muted)]">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-accent-600)]" />
                <span>Volgend: {levelInfo.next.name} {levelInfo.next.icon}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MiniStatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Achievements"
              value={stats.achievements_count}
              gradient="from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
            />
            <MiniStatCard
              icon={<Zap className="w-5 h-5" />}
              label="Streak"
              value={`${stats.daily_streak}d`}
              gradient="from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-700)]"
            />
            <MiniStatCard
              icon={<Target className="w-5 h-5" />}
              label="Challenges"
              value={stats.challenges_completed}
              gradient="from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)]"
            />
            <MiniStatCard
              icon={<Star className="w-5 h-5" />}
              label="Outfits"
              value={stats.outfits_saved}
              gradient="from-[var(--ff-color-accent-600)] to-[var(--ff-color-primary-600)]"
            />
          </div>

          {/* CTA */}
          <NavLink
            to="/gamification"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)] text-white rounded-xl font-semibold hover:from-[var(--ff-color-primary-600)] hover:to-[var(--ff-color-accent-600)] transition-all shadow-lg hover-lift"
          >
            <Trophy className="w-5 h-5" />
            Bekijk alle achievements
            <ArrowRight className="w-5 h-5" />
          </NavLink>
        </div>
      </div>

      {/* Recent Achievements - Carousel Style */}
      {achievements && achievements.length > 0 && (
        <div className="bg-white dark:bg-[var(--color-surface)] rounded-3xl p-6 shadow-xl border-2 border-[var(--color-border)] hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--ff-color-accent-600)]" />
              Recente Achievements
            </h4>
            <NavLink
              to="/gamification"
              className="text-sm font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] flex items-center gap-1"
            >
              Bekijk alles
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {achievements.slice(0, 3).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border border-[var(--color-border)] hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-2xl">{achievement.achievement_icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--color-text)] mb-1 truncate">
                    {achievement.achievement_name}
                  </div>
                  <div className="text-xs text-[var(--color-muted)] flex items-center gap-2">
                    <span>{new Date(achievement.unlocked_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
                    <span>•</span>
                    <span className="font-semibold text-[var(--ff-color-primary-600)]">+{achievement.achievement_xp_reward} XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestones Preview */}
      <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] dark:from-[var(--ff-color-primary-900/20)] dark:to-[var(--ff-color-accent-900/20)] rounded-3xl p-6 shadow-xl border-2 border-[var(--color-border)]">
        <h4 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--ff-color-accent-600)]" />
          Komende Milestones
        </h4>
        <div className="space-y-3">
          <MilestoneItem
            icon="🎯"
            title="100 XP Bereiken"
            current={stats.total_xp}
            target={100}
            reward="+50 XP"
          />
          <MilestoneItem
            icon="🔥"
            title="7 Dagen Streak"
            current={stats.daily_streak}
            target={7}
            reward="+100 XP"
          />
          <MilestoneItem
            icon="👗"
            title="10 Outfits Opslaan"
            current={stats.outfits_saved}
            target={10}
            reward="+75 XP"
          />
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--color-border)] hover-scale">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-2 shadow-md`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-[var(--color-text)]">
        {value}
      </div>
      <div className="text-xs text-[var(--color-muted)] font-medium">
        {label}
      </div>
    </div>
  );
}

function MilestoneItem({
  icon,
  title,
  current,
  target,
  reward,
}: {
  icon: string;
  title: string;
  current: number;
  target: number;
  reward: string;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="text-sm font-bold text-[var(--color-text)]">{title}</div>
            <div className="text-xs text-[var(--color-muted)]">
              {current} / {target}
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white text-xs font-bold rounded-lg">
          {reward}
        </div>
      </div>
      <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isComplete ? 'bg-gradient-to-r from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-700)]' : 'bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
