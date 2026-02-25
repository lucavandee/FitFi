import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, TrendingUp, Camera, Crown, ArrowRight, Zap, Target } from 'lucide-react';
import { BentoCard } from './BentoGrid';
import { motion } from 'framer-motion';

/**
 * Quick Insights Widget
 * Compact Nova insights display
 */
interface QuickInsightsWidgetProps {
  insights: Array<{
    type: string;
    insight: string;
    action?: string;
    actionLink?: string;
  }>;
  onDismiss: (type: string, insight: string) => void;
}

export function QuickInsightsWidget({ insights, onDismiss }: QuickInsightsWidgetProps) {
  if (insights.length === 0) return null;

  const topInsight = insights[0];

  return (
    <BentoCard size="large">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-muted)] mb-1 font-medium uppercase tracking-wide">
            Nova Styling Tip
          </p>
          <p className="text-sm text-[var(--color-text)] mb-3 leading-relaxed">
            {topInsight.insight}
          </p>
          {topInsight.actionLink && (
            <NavLink
              to={topInsight.actionLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
            >
              {topInsight.action || 'Bekijk'}
              <ArrowRight className="w-3 h-3" />
            </NavLink>
          )}
        </div>
      </div>
    </BentoCard>
  );
}

/**
 * Photo Upload Widget
 * Compact photo analysis CTA
 */
export function PhotoUploadWidget() {
  return (
    <BentoCard size="medium">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">
          Upload je foto
        </h3>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Krijg AI-styling advies
        </p>
        <NavLink
          to="/onboarding?step=photo"
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          Upload foto
        </NavLink>
      </div>
    </BentoCard>
  );
}

/**
 * Style Profile Widget
 * Compact archetype display
 */
interface StyleProfileWidgetProps {
  archetype: {
    name: string;
    description?: string;
  };
  colorPalette: string[];
}

export function StyleProfileWidget({ archetype, colorPalette }: StyleProfileWidgetProps) {
  return (
    <BentoCard size="medium">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-muted)] mb-0.5 uppercase tracking-wide font-medium">
            Jouw Stijl
          </p>
          <h3 className="text-base font-bold text-[var(--color-text)] truncate">
            {archetype.name}
          </h3>
        </div>
      </div>

      {colorPalette.length > 0 && (
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">Kleuren</p>
          <div className="flex gap-1.5">
            {colorPalette.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      <NavLink
        to="/profile"
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--ff-color-neutral-100)] text-[var(--color-text)] rounded-lg text-xs font-semibold hover:bg-[var(--ff-color-neutral-200)] transition-colors"
      >
        Bekijk profiel
        <ArrowRight className="w-3 h-3" />
      </NavLink>
    </BentoCard>
  );
}

/**
 * Quick Actions Widget
 * Compact action links
 */
interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

export function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
  return (
    <BentoCard size="large">
      <h3 className="text-base font-bold text-[var(--color-text)] mb-4">
        Snelle acties
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <NavLink
            key={index}
            to={action.href}
            className="p-3 rounded-xl bg-[var(--ff-color-neutral-50)] hover:bg-[var(--ff-color-neutral-100)] border border-[var(--color-border)] transition-colors group"
          >
            <action.icon className="w-5 h-5 text-[var(--ff-color-primary-700)] mb-2" />
            <p className="text-xs font-semibold text-[var(--color-text)] mb-0.5">
              {action.label}
            </p>
            <p className="text-xs text-[var(--color-muted)] line-clamp-1">
              {action.description}
            </p>
          </NavLink>
        ))}
      </div>
    </BentoCard>
  );
}

/**
 * Gamification Widget (Compact)
 * Shows level and XP progress
 */
interface GamificationWidgetProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
}

export function GamificationWidget({
  level,
  xp,
  xpToNextLevel,
  streak
}: GamificationWidgetProps) {
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <BentoCard size="medium">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wide font-medium">
            Niveau
          </p>
          <p className="text-3xl font-bold text-[var(--color-text)]">
            {level}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--color-muted)]">
            {xp} / {xpToNextLevel} XP
          </span>
          <span className="text-xs font-semibold text-[var(--ff-color-primary-700)]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-[var(--ff-color-neutral-200)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
          <span className="text-lg">🔥</span>
          <span className="text-xs font-semibold text-orange-900">
            {streak} dagen streak
          </span>
        </div>
      )}
    </BentoCard>
  );
}

/**
 * Recent Outfits Widget
 * Compact outfit preview
 */
interface RecentOutfitsWidgetProps {
  outfitCount: number;
  featuredImage?: string;
}

export function RecentOutfitsWidget({ outfitCount, featuredImage }: RecentOutfitsWidgetProps) {
  return (
    <BentoCard size="large" className="p-0 overflow-hidden">
      {/* Background image if available */}
      {featuredImage ? (
        <div className="relative h-48">
          <img
            src={featuredImage}
            alt="Featured outfit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-sm text-white/80 mb-1">Jouw Outfits</p>
            <p className="text-2xl font-bold text-white mb-3">
              {outfitCount} looks
            </p>
            <NavLink
              to="/results"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Bekijk alles
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wide font-medium">
                Jouw Outfits
              </p>
              <p className="text-3xl font-bold text-[var(--color-text)]">
                {outfitCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center">
              <Target className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
            </div>
          </div>
          <NavLink
            to="/results"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Bekijk alles
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      )}
    </BentoCard>
  );
}

/**
 * Empty State Widget
 * When no quiz data yet
 */
export function EmptyStateWidget() {
  return (
    <BentoCard size="hero" className="text-center">
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Start je stijlreis
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-sm">
          Beantwoord een paar vragen en ontdek welke outfits bij jou passen — in 2 minuten
        </p>
        <NavLink
          to="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Start gratis stijlquiz
          <ArrowRight className="w-5 h-5" />
        </NavLink>
      </div>
    </BentoCard>
  );
}
