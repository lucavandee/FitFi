/**
 * MissingItemPlaceholder Component
 *
 * Visual placeholder for missing outfit items (shoes, accessories, etc.)
 * with "Style with your own X" messaging.
 *
 * Prevents empty boxes in outfit cards when items are unavailable.
 */

import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export type MissingCategory = 'top' | 'bottom' | 'footwear' | 'accessory' | 'outerwear' | 'dress' | 'jumpsuit';

interface MissingItemPlaceholderProps {
  category: MissingCategory;
  reason?: 'budget' | 'filters' | 'availability' | 'preference';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const CATEGORY_CONFIG: Record<MissingCategory, {
  label: string;
  icon: string;
  suggestion: string;
  gradient: string;
}> = {
  top: {
    label: 'Bovenstuk',
    icon: '👕',
    suggestion: 'Style met een eigen top',
    gradient: 'from-blue-100 via-blue-50 to-white'
  },
  bottom: {
    label: 'Onderstuk',
    icon: '👖',
    suggestion: 'Style met eigen broek of rok',
    gradient: 'from-indigo-100 via-indigo-50 to-white'
  },
  footwear: {
    label: 'Schoenen',
    icon: '👟',
    suggestion: 'Style met eigen schoenen',
    gradient: 'from-purple-100 via-purple-50 to-white'
  },
  accessory: {
    label: 'Accessoire',
    icon: '👜',
    suggestion: 'Voeg eigen accessoire toe',
    gradient: 'from-pink-100 via-pink-50 to-white'
  },
  outerwear: {
    label: 'Jas',
    icon: '🧥',
    suggestion: 'Style met eigen jas',
    gradient: 'from-teal-100 via-teal-50 to-white'
  },
  dress: {
    label: 'Jurk',
    icon: '👗',
    suggestion: 'Kies eigen jurk',
    gradient: 'from-rose-100 via-rose-50 to-white'
  },
  jumpsuit: {
    label: 'Jumpsuit',
    icon: '🩱',
    suggestion: 'Kies eigen jumpsuit',
    gradient: 'from-amber-100 via-amber-50 to-white'
  }
};

const REASON_MESSAGES: Record<NonNullable<MissingItemPlaceholderProps['reason']>, string> = {
  budget: 'Buiten budget',
  filters: 'Gefilterd',
  availability: 'Niet beschikbaar',
  preference: 'Niet in voorkeur'
};

const SIZE_VARIANTS = {
  sm: {
    container: 'h-24 text-xs',
    icon: 'text-2xl',
    spacing: 'gap-1'
  },
  md: {
    container: 'h-32 text-sm',
    icon: 'text-3xl',
    spacing: 'gap-2'
  },
  lg: {
    container: 'h-40 text-base',
    icon: 'text-4xl',
    spacing: 'gap-3'
  }
};

export function MissingItemPlaceholder({
  category,
  reason,
  size = 'md',
  className,
  onClick
}: MissingItemPlaceholderProps) {
  const config = CATEGORY_CONFIG[category];
  const sizeClasses = SIZE_VARIANTS[size];
  const reasonMessage = reason ? REASON_MESSAGES[reason] : null;

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden transition-all',
        'hover:border-gray-400 hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        sizeClasses.container,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'presentation'}
      aria-label={config.suggestion}
    >
      {/* Gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', config.gradient)} />

      {/* Content */}
      <div className={cn('relative h-full flex flex-col items-center justify-center p-3', sizeClasses.spacing)}>
        {/* Icon */}
        <div className={cn('flex-shrink-0', sizeClasses.icon)} aria-hidden="true">
          {config.icon}
        </div>

        {/* Label */}
        <div className="text-center">
          <div className="font-semibold text-gray-700">{config.label}</div>
          <div className="text-gray-500 text-xs mt-0.5">{config.suggestion}</div>

          {/* Reason badge */}
          {reasonMessage && (
            <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-full text-[10px] font-medium text-gray-600 border border-gray-200">
              <ShoppingBag className="w-2.5 h-2.5" />
              {reasonMessage}
            </div>
          )}
        </div>

        {/* Sparkle indicator (shows this is intentional, not an error) */}
        <div className="absolute top-2 right-2 text-gray-400">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
        </div>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
    </div>
  );
}

/**
 * Compact variant for grid layouts
 */
export function MissingItemCompact({ category, className }: { category: MissingCategory; className?: string }) {
  const config = CATEGORY_CONFIG[category];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50',
        className
      )}
      role="presentation"
    >
      <span className="text-xl" aria-hidden="true">{config.icon}</span>
      <div className="text-xs">
        <div className="font-medium text-gray-700">{config.label}</div>
        <div className="text-gray-500">Eigen item</div>
      </div>
    </div>
  );
}

/**
 * Helper: Determine why an item is missing
 */
export function determineMissingReason(
  category: MissingCategory,
  context: {
    budgetFiltered?: boolean;
    userFilters?: string[];
    availableProducts?: number;
  }
): MissingItemPlaceholderProps['reason'] | undefined {
  if (context.budgetFiltered) return 'budget';
  if (context.userFilters && context.userFilters.length > 0) return 'filters';
  if (context.availableProducts === 0) return 'availability';
  return undefined;
}
