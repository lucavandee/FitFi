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
      <div className="space-y-4">
        <div className="ff-card-glass rounded-3xl p-8 animate-pulse">
          <div className="h-16 bg-[var(--ff-brand-100)] rounded-2xl mb-4"></div>
          <div className="h-3 bg-[var(--ff-brand-100)] rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const levelInfo = gamificationService.getNextLevelInfo(stats.total_xp);

  return (
    <div className="space-y-6">
      {/* Main Progress Card - Apple-Inspired */}
      <motion.div
        className="relative overflow-hidden ff-card-glass rounded-3xl p-8 border border-[var(--ff-border-subtle)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
        style={{ boxShadow: 'var(--ff-shadow-lg)' }}
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-brand-50)] via-transparent to-[var(--ff-accent-50)] opacity-40 pointer-events-none" />

        <div className="relative z-10">
          {/* Header with Level Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-brand-500)] to-[var(--ff-brand-700)] flex items-center justify-center"
                style={{ boxShadow: 'var(--ff-shadow-md)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <span className="text-3xl">{levelInfo.current.icon}</span>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--ff-text-primary)] mb-1 tracking-tight">
                  {levelInfo.current.name}
                </h3>
                <p className="text-sm text-[var(--ff-text-secondary)] font-medium">
                  Level {stats.current_level} • {stats.total_xp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Top % Badge */}
            <div className="px-4 py-2 bg-[var(--ff-bg-surface)] backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-brand-700)] border border-[var(--ff-border-default)]">
              <Crown className="w-4 h-4 inline mr-1 text-[var(--ff-brand-600)]" />
              Top {Math.ceil((stats.current_level / 50) * 100)}%
            </div>
          </div>

          {/* Progress Bar - Apple Style */}
          {levelInfo.next && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-[var(--ff-text-secondary)] mb-3">
                <span className="font-medium">Tot volgend level</span>
                <span className="font-bold text-[var(--ff-brand-700)]">
                  {levelInfo.xpToNext.toLocaleString()} XP
                </span>
              </div>
              <div className="h-3 bg-[var(--ff-brand-100)] rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--ff-brand-600)] to-[var(--ff-accent-600)] relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'var(--ff-gradient-shimmer)' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--ff-text-tertiary)]">
                <Sparkles className="w-4 h-4 text-[var(--ff-accent-600)]" />
                <span>Volgend: {levelInfo.next.name} {levelInfo.next.icon}</span>
              </div>
            </div>
          )}

          {/* Stats Grid - Clean & Minimal */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MiniStatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Achievements"
              value={stats.achievements_count}
              color="brand"
            />
            <MiniStatCard
              icon={<Zap className="w-5 h-5" />}
              label="Streak"
              value={`${stats.daily_streak}d`}
              color="accent"
            />
            <MiniStatCard
              icon={<Target className="w-5 h-5" />}
              label="Challenges"
              value={stats.challenges_completed}
              color="brand"
            />
            <MiniStatCard
              icon={<Star className="w-5 h-5" />}
              label="Outfits"
              value={stats.outfits_saved}
              color="accent"
            />
          </div>

          {/* CTA Button - Premium */}
          <NavLink
            to="/gamification"
            className="group w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--ff-brand-700)] to-[var(--ff-brand-600)] text-white rounded-xl font-semibold transition-all"
            style={{
              boxShadow: 'var(--ff-shadow-md)',
              transition: 'all var(--ff-duration-normal) var(--ff-ease-out)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--ff-shadow-xl)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--ff-shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trophy className="w-5 h-5" />
            Bekijk alle achievements
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>
      </motion.div>

      {/* Recent Achievements - Carousel Style */}
      {achievements && achievements.length > 0 && (
        <motion.div
          className="ff-card rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ boxShadow: 'var(--ff-shadow-md)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-[var(--ff-text-primary)] flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--ff-accent-600)]" />
              Recente Achievements
            </h4>
            <NavLink
              to="/gamification"
              className="text-sm font-semibold text-[var(--ff-brand-600)] hover:text-[var(--ff-brand-700)] flex items-center gap-1 transition-colors"
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
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[var(--ff-brand-50)] to-[var(--ff-accent-50)] rounded-2xl border border-[var(--ff-border-subtle)] transition-all hover:shadow-md"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-brand-500)] to-[var(--ff-brand-700)] flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-2xl">{achievement.achievement_icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--ff-text-primary)] mb-1 truncate">
                    {achievement.achievement_name}
                  </div>
                  <div className="text-xs text-[var(--ff-text-secondary)] flex items-center gap-2">
                    <span>{new Date(achievement.unlocked_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</span>
                    <span>•</span>
                    <span className="font-semibold text-[var(--ff-brand-600)]">+{achievement.achievement_xp_reward} XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Milestones - Clean Design */}
      <motion.div
        className="ff-card rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ boxShadow: 'var(--ff-shadow-md)' }}
      >
        <h4 className="text-lg font-bold text-[var(--ff-text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--ff-accent-600)]" />
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
      </motion.div>
    </div>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'brand' | 'accent';
}) {
  const gradientClass = color === 'brand'
    ? 'from-[var(--ff-brand-500)] to-[var(--ff-brand-700)]'
    : 'from-[var(--ff-accent-500)] to-[var(--ff-accent-700)]';

  return (
    <motion.div
      className="bg-[var(--ff-bg-surface)] backdrop-blur-sm rounded-xl p-3 border border-[var(--ff-border-subtle)] transition-all"
      whileHover={{ y: -4, boxShadow: 'var(--ff-shadow-md)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white mb-2 shadow-sm`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-[var(--ff-text-primary)] tracking-tight">
        {value}
      </div>
      <div className="text-xs text-[var(--ff-text-secondary)] font-medium">
        {label}
      </div>
    </motion.div>
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
    <motion.div
      className="bg-gradient-to-r from-[var(--ff-brand-50)] to-[var(--ff-accent-50)] backdrop-blur-sm rounded-xl p-4 border border-[var(--ff-border-subtle)] transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="text-sm font-bold text-[var(--ff-text-primary)]">{title}</div>
            <div className="text-xs text-[var(--ff-text-secondary)] font-medium">
              {current} / {target}
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-gradient-to-r from-[var(--ff-brand-500)] to-[var(--ff-brand-700)] text-white text-xs font-bold rounded-lg shadow-sm">
          {reward}
        </div>
      </div>
      <div className="h-2 bg-[var(--ff-brand-100)] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isComplete
              ? 'bg-gradient-to-r from-[var(--ff-success-600)] to-[var(--ff-success-700)]'
              : 'bg-gradient-to-r from-[var(--ff-brand-600)] to-[var(--ff-accent-600)]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}
