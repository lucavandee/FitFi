import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Bento Grid System
 *
 * Premium dashboard layout inspired by Linear, Arc, Notion
 *
 * Features:
 * - Responsive grid with smart breakpoints
 * - Consistent spacing (16px gap system)
 * - Auto-fit columns
 * - Staggered animations
 *
 * @example
 * <BentoGrid>
 *   <BentoCard size="large" />
 *   <BentoCard size="small" />
 * </BentoGrid>
 */
export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div
      className={`
        grid gap-4
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'hero';
  className?: string;
  onClick?: () => void;
  delay?: number;
}

/**
 * Bento Card
 *
 * Individual card in Bento Grid
 * Sizes:
 * - small: 1 column
 * - medium: 1 column (default)
 * - large: 2 columns
 * - wide: full width
 * - tall: 2 rows
 * - hero: 2 cols × 2 rows
 */
export function BentoCard({
  children,
  size = 'medium',
  className = '',
  onClick,
  delay = 0
}: BentoCardProps) {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1',
    large: 'sm:col-span-2',
    wide: 'col-span-full',
    tall: 'row-span-2',
    hero: 'sm:col-span-2 row-span-2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={`
        bg-[var(--color-surface)]
        rounded-2xl
        p-6
        border border-[var(--color-border)]
        shadow-sm
        hover:shadow-md
        transition-all
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:border-[var(--ff-color-primary-500)]' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

/**
 * Bento Stat Card
 * Compact stat display
 */
interface BentoStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function BentoStatCard({
  icon,
  label,
  value,
  trend,
  delay = 0
}: BentoStatCardProps) {
  return (
    <BentoCard size="small" delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-muted)] mb-2">{label}</p>
          <p className="text-3xl font-bold text-[var(--color-text)]">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {trend.value}%
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)]">
          {icon}
        </div>
      </div>
    </BentoCard>
  );
}

/**
 * Bento Action Card
 * CTA or action card
 */
interface BentoActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    label: string;
    onClick: () => void;
  };
  size?: 'medium' | 'large';
  delay?: number;
}

export function BentoActionCard({
  title,
  description,
  icon,
  action,
  size = 'medium',
  delay = 0
}: BentoActionCardProps) {
  return (
    <BentoCard size={size} delay={delay}>
      <div className="flex flex-col h-full">
        <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)] mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-4 flex-1">
          {description}
        </p>
        <button
          onClick={action.onClick}
          className="w-full px-4 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-600)] transition-colors"
        >
          {action.label}
        </button>
      </div>
    </BentoCard>
  );
}

/**
 * Bento Hero Card
 * Large hero section in bento style
 */
interface BentoHeroCardProps {
  greeting: string;
  userName: string;
  subtitle: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  delay?: number;
}

export function BentoHeroCard({
  greeting,
  userName,
  subtitle,
  actions,
  delay = 0
}: BentoHeroCardProps) {
  return (
    <BentoCard size="hero" delay={delay} className="relative overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent opacity-50" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-muted)] mb-2">{greeting}</p>
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-3">
            {userName}
          </h1>
          <p className="text-base text-[var(--color-muted)] mb-6">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${action.variant === 'primary'
                  ? 'bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)]'
                  : 'bg-[var(--ff-color-neutral-100)] text-[var(--color-text)] hover:bg-[var(--ff-color-neutral-200)]'
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}

/**
 * Bento List Card
 * Card with list of items
 */
interface BentoListCardProps {
  title: string;
  items: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    onClick?: () => void;
  }>;
  size?: 'medium' | 'large';
  delay?: number;
}

export function BentoListCard({
  title,
  items,
  size = 'medium',
  delay = 0
}: BentoListCardProps) {
  return (
    <BentoCard size={size} delay={delay}>
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--ff-color-neutral-100)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-700)]">
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {item.label}
              </p>
            </div>
            <span className="text-xs text-[var(--color-muted)]">
              {item.value}
            </span>
          </button>
        ))}
      </div>
    </BentoCard>
  );
}

/**
 * Bento Image Card
 * Card with image background
 */
interface BentoImageCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onClick: () => void;
  size?: 'medium' | 'large';
  delay?: number;
}

export function BentoImageCard({
  title,
  subtitle,
  imageUrl,
  onClick,
  size = 'medium',
  delay = 0
}: BentoImageCardProps) {
  return (
    <BentoCard size={size} delay={delay} onClick={onClick} className="p-0 overflow-hidden">
      <div className="relative h-full min-h-[200px]">
        {/* Image */}
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-white/80">
            {subtitle}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
