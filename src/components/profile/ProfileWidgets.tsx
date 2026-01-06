import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Crown,
  Award,
  Heart,
  Target,
  TrendingUp,
  Eye,
  ShoppingBag,
  RefreshCw,
  Settings,
  Zap,
  ArrowRight,
  Palette
} from 'lucide-react';
import { BentoCard } from '../dashboard/BentoGrid';
import { motion } from 'framer-motion';

/**
 * Profile Header Widget
 * Compact user info display
 */
interface ProfileHeaderWidgetProps {
  user: {
    name?: string;
    email: string;
    created_at?: string;
  };
  level: number;
  xp: number;
  nextLevelXP: number;
}

export function ProfileHeaderWidget({ user, level, xp, nextLevelXP }: ProfileHeaderWidgetProps) {
  const xpProgress = ((xp % nextLevelXP) / nextLevelXP) * 100;
  const profileCreatedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })
    : null;

  return (
    <BentoCard size="wide" className="relative overflow-hidden" disableAnimation>
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent opacity-30" />

      <div className="relative z-10 flex items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          {level >= 5 && (
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 truncate">
            {user.name || user.email.split('@')[0] || 'Jouw Profiel'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[var(--color-muted)] mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            {profileCreatedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Sinds {profileCreatedDate}</span>
              </div>
            )}
          </div>

          {/* XP Progress */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-2">
              <span className="font-semibold">Level {level}</span>
              <span>{xp} / {nextLevelXP} XP</span>
            </div>
            <div className="h-2 bg-[var(--ff-color-neutral-200)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

/**
 * Style Summary Widget
 * Compact style profile display
 */
interface StyleSummaryWidgetProps {
  archetype?: string;
  paletteName?: string;
  primaryColors: string[];
}

export function StyleSummaryWidget({ archetype, paletteName, primaryColors }: StyleSummaryWidgetProps) {
  return (
    <BentoCard size="large">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wide font-medium">
            Jouw Stijl
          </p>
          <h3 className="text-xl font-bold text-[var(--color-text)] truncate">
            {archetype || 'Nog niet ingevuld'}
          </h3>
          {paletteName && (
            <p className="text-sm text-[var(--color-muted)] mt-1">{paletteName}</p>
          )}
        </div>
      </div>

      {/* Color swatches */}
      {primaryColors.length > 0 && (
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">Kleuren</p>
          <div className="flex gap-2">
            {primaryColors.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      <NavLink
        to="/onboarding"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--ff-color-neutral-100)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:bg-[var(--ff-color-neutral-200)] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Quiz opnieuw
      </NavLink>
    </BentoCard>
  );
}

/**
 * Quick Stats Widget
 */
interface QuickStatsWidgetProps {
  stats: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    subValue?: string;
    onClick?: () => void;
  }>;
}

export function QuickStatsWidget({ stats }: QuickStatsWidgetProps) {
  return (
    <>
      {stats.map((stat, index) => (
        <BentoCard
          key={index}
          size="small"
          onClick={stat.onClick}
          disableAnimation
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--color-muted)] mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-[var(--color-text)] mb-1">{stat.value}</p>
              {stat.subValue && (
                <p className="text-xs text-[var(--color-muted)]">{stat.subValue}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)]">
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </BentoCard>
      ))}
    </>
  );
}

/**
 * Quick Actions Widget for Profile
 */
interface ProfileQuickActionsProps {
  actions: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    to: string;
  }>;
}

export function ProfileQuickActions({ actions }: ProfileQuickActionsProps) {
  return (
    <BentoCard size="large">
      <h3 className="text-base font-bold text-[var(--color-text)] mb-4">
        Snelle acties
      </h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <NavLink
            key={index}
            to={action.to}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--ff-color-neutral-100)] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)] group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
              <action.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] mb-0.5">
                {action.title}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {action.description}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors" />
          </NavLink>
        ))}
      </div>
    </BentoCard>
  );
}

/**
 * Recent Activity Widget
 */
interface RecentActivityWidgetProps {
  activities: Array<{
    action_type: string;
    created_at: string;
    metadata?: any;
  }>;
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return Target;
      case 'outfit_saved':
        return Heart;
      case 'outfit_viewed':
        return Eye;
      default:
        return TrendingUp;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return 'Quiz voltooid';
      case 'outfit_saved':
        return 'Outfit opgeslagen';
      case 'outfit_viewed':
        return 'Outfit bekeken';
      default:
        return type;
    }
  };

  return (
    <BentoCard size="large">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[var(--color-text)]">
          Recente activiteit
        </h3>
        <span className="text-xs text-[var(--color-muted)]">
          {activities.length} acties
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-8">
          Nog geen activiteit
        </p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, index) => {
            const Icon = getActivityIcon(activity.action_type);
            const date = new Date(activity.created_at);
            const timeAgo = getTimeAgo(date);

            return (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {getActivityLabel(activity.action_type)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {timeAgo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BentoCard>
  );
}

/**
 * Settings Widget
 */
export function SettingsWidget({ onLogout }: { onLogout: () => void }) {
  return (
    <BentoCard size="medium">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-neutral-100)] flex items-center justify-center mb-3">
          <Settings className="w-6 h-6 text-[var(--color-text)]" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">
          Account instellingen
        </h3>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Beheer je voorkeuren
        </p>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
        >
          Uitloggen
        </button>
      </div>
    </BentoCard>
  );
}

/**
 * Helper function for time ago
 */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Zojuist';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dagen geleden`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weken geleden`;
  const months = Math.floor(days / 30);
  return `${months} maanden geleden`;
}
