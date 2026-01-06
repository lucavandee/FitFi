import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, User, Crown } from 'lucide-react';

/**
 * Premium Bento Components
 *
 * High-end visual components with:
 * - Gradient backgrounds
 * - Smooth animations (desktop only)
 * - Shadows and depth
 * - Scroll-optimized (no backdrop-blur)
 */

// Hook for detecting mobile
function useMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Premium Stat Card
 * Beautiful gradient cards for stats
 */
interface PremiumStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  variant?: 'success' | 'accent' | 'gold' | 'neutral' | 'purple' | 'pink';
  onClick?: () => void;
  delay?: number;
}

export function PremiumStatCard({
  icon,
  label,
  value,
  subValue,
  variant = 'neutral',
  onClick,
  delay = 0
}: PremiumStatCardProps) {
  const isMobile = useMobile();

  const variantClasses = {
    success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    accent: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
    gold: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
    pink: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white',
    neutral: 'bg-gradient-to-br from-[var(--ff-color-neutral-300)] to-[var(--ff-color-neutral-400)] dark:from-gray-700 dark:to-slate-700 text-gray-900 dark:text-white',
  };

  const content = (
    <div
      className={`${variantClasses[variant]} rounded-2xl p-5 text-left transition-all shadow-lg hover:shadow-xl ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        contain: 'layout style paint',
        willChange: onClick ? 'transform, box-shadow' : 'auto'
      }}
    >
      <div className="opacity-90 mb-3">
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold mb-1">
        {value}
      </div>
      <div className="text-sm opacity-80 truncate">
        {subValue}
      </div>
    </div>
  );

  if (isMobile || !onClick) {
    return (
      <button onClick={onClick} disabled={!onClick} className="w-full">
        {content}
      </button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className="w-full"
      style={{ contain: 'layout' }}
    >
      {content}
    </motion.button>
  );
}

/**
 * Premium Header Card
 * Hero-style user header with gradient
 * NO backdrop-blur for scroll performance
 */
interface PremiumHeaderCardProps {
  user: {
    name?: string;
    email: string;
    created_at?: string;
  };
  level: number;
  xp: number;
  nextLevelXP: number;
  onLogout?: () => void;
}

export function PremiumHeaderCard({
  user,
  level,
  xp,
  nextLevelXP,
  onLogout
}: PremiumHeaderCardProps) {
  const isMobile = useMobile();
  const xpProgress = ((xp % nextLevelXP) / nextLevelXP) * 100;

  const profileCreatedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })
    : null;

  const headerContent = (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-600)] shadow-2xl">
      {/* Subtle pattern overlay - NO backdrop-blur */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2%, transparent 0%), radial-gradient(circle at 75% 75%, white 2%, transparent 0%)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative p-6 md:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-6 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/20 flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                <User className="w-10 h-10 md:w-14 md:h-14 text-white" />
              </div>
              {level >= 5 && (
                <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ring-4 ring-white/30 shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 truncate">
                {user.name || user.email?.split('@')[0] || 'Jouw Profiel'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/90 text-sm mb-4">
                <span className="truncate">{user.email}</span>
                {profileCreatedDate && (
                  <>
                    <span className="opacity-60">•</span>
                    <span>Sinds {profileCreatedDate}</span>
                  </>
                )}
              </div>

              {/* XP Bar */}
              <div className="max-w-xs">
                <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                  <span className="font-semibold">Level {level}</span>
                  <span>{xp} / {nextLevelXP} XP</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return <div className="mb-6">{headerContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
      style={{ contain: 'layout' }}
    >
      {headerContent}
    </motion.div>
  );
}

/**
 * Premium Action Card
 * Gradient icon + hover effects
 */
interface PremiumActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  gradient: string;
}

export function PremiumActionCard({
  icon,
  title,
  description,
  to,
  onClick,
  gradient
}: PremiumActionCardProps) {
  const isMobile = useMobile();

  const content = (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-all group cursor-pointer">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-lg ${!isMobile && 'group-hover:scale-110'} transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[var(--color-text)] flex items-center gap-2">
          {title}
          <ChevronRight className={`w-4 h-4 text-[var(--color-muted)] ${!isMobile && 'group-hover:translate-x-1'} transition-transform`} />
        </div>
        <div className="text-sm text-[var(--color-muted)] truncate">
          {description}
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

/**
 * Premium Card
 * Clean card with header
 */
interface PremiumCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export function PremiumCard({
  title,
  icon,
  children,
  delay = 0
}: PremiumCardProps) {
  const isMobile = useMobile();

  const cardContent = (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[var(--color-border)]">
        <div className="text-[var(--ff-color-primary-600)]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );

  if (isMobile) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{ contain: 'layout' }}
    >
      {cardContent}
    </motion.div>
  );
}

/**
 * Premium Tab Button
 * Gradient active state
 */
interface PremiumTabButtonProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

export function PremiumTabButton({
  id,
  label,
  icon: Icon,
  isActive,
  onClick
}: PremiumTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
        isActive
          ? 'bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white shadow-lg'
          : 'bg-[var(--color-surface)] text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
