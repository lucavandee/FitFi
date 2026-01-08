/**
 * InsufficientProductsWarning Component
 *
 * Surfaces insufficientProductsHandler suggestions to UI.
 * Explains WHY user sees no/few outfits and provides actionable solutions.
 *
 * Prevents silent failures where validation blocks outfits without user feedback.
 */

import React, { useState } from 'react';
import { AlertCircle, X, ChevronRight, TrendingUp, Filter, DollarSign, ShoppingBag, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface InsufficientProductsSuggestion {
  title: string;
  message: string;
  suggestions: string[];
  severity: 'warning' | 'info' | 'error';
  canContinue: boolean;
  stats?: {
    totalProducts: number;
    filteredProducts: number;
    retentionRate: number;
    missingCategories?: string[];
  };
}

interface InsufficientProductsWarningProps {
  suggestion: InsufficientProductsSuggestion;
  onDismiss?: () => void;
  onAction?: (action: string) => void;
  variant?: 'modal' | 'banner' | 'inline';
  className?: string;
}

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    accentColor: 'bg-red-500'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-500',
    accentColor: 'bg-amber-500'
  },
  info: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-500',
    accentColor: 'bg-blue-500'
  }
};

/**
 * Suggestion action button icons
 */
function getSuggestionIcon(suggestion: string): React.ReactNode {
  const lower = suggestion.toLowerCase();

  if (lower.includes('budget') || lower.includes('prijs')) {
    return <DollarSign className="w-4 h-4" />;
  }
  if (lower.includes('filter') || lower.includes('voorkeuren')) {
    return <Filter className="w-4 h-4" />;
  }
  if (lower.includes('winkel') || lower.includes('retailer')) {
    return <ShoppingBag className="w-4 h-4" />;
  }
  if (lower.includes('contact') || lower.includes('support')) {
    return <Mail className="w-4 h-4" />;
  }
  return <TrendingUp className="w-4 h-4" />;
}

export function InsufficientProductsWarning({
  suggestion,
  onDismiss,
  onAction,
  variant = 'banner',
  className
}: InsufficientProductsWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = SEVERITY_CONFIG[suggestion.severity];
  const Icon = config.icon;

  // Modal variant
  if (variant === 'modal') {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className={cn(
              'relative max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden',
              config.bgColor,
              className
            )}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className={cn('h-1.5', config.accentColor)} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={cn('p-3 rounded-full', config.bgColor, 'ring-4 ring-white')}>
                  <Icon className={cn('w-6 h-6', config.iconColor)} />
                </div>

                <div className="flex-1">
                  <h3 className={cn('text-lg font-bold mb-1', config.textColor)}>{suggestion.title}</h3>
                  <p className={cn('text-sm', config.textColor, 'opacity-80')}>{suggestion.message}</p>
                </div>

                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className={cn('p-1.5 rounded-lg hover:bg-black/5 transition-colors', config.textColor)}
                    aria-label="Sluiten"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Stats (if available) */}
              {suggestion.stats && (
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{suggestion.stats.totalProducts}</div>
                    <div className="text-xs text-gray-600">Totaal producten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{suggestion.stats.filteredProducts}</div>
                    <div className="text-xs text-gray-600">Na filters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{suggestion.stats.retentionRate}%</div>
                    <div className="text-xs text-gray-600">Behouden</div>
                  </div>
                </div>
              )}

              {/* Missing categories (if any) */}
              {suggestion.stats?.missingCategories && suggestion.stats.missingCategories.length > 0 && (
                <div className="mb-4 p-3 bg-white/50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Onvoldoende items in:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.stats.missingCategories.map(cat => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-700 border border-gray-200"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestion.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Wat je kunt doen:</div>
                  {suggestion.suggestions.map((sug, index) => (
                    <button
                      key={index}
                      onClick={() => onAction?.(sug)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all text-left group',
                        'hover:shadow-md hover:scale-[1.02]'
                      )}
                    >
                      <div className={cn('p-2 rounded-lg', config.bgColor, config.iconColor)}>
                        {getSuggestionIcon(sug)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-900">{sug}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              {!suggestion.canContinue && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Tip:</strong> We kunnen momenteel geen outfits genereren met de huidige filters. Pas de
                    bovenstaande suggesties toe om te kunnen doorgaan.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant (collapsible)
  if (variant === 'banner') {
    return (
      <motion.div
        className={cn(
          'rounded-xl border-2 overflow-hidden shadow-lg',
          config.bgColor,
          config.borderColor,
          className
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Compact header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors"
        >
          <Icon className={cn('w-5 h-5 flex-shrink-0', config.iconColor)} />
          <div className="flex-1 text-left">
            <div className={cn('font-bold text-sm', config.textColor)}>{suggestion.title}</div>
            {!isExpanded && (
              <div className={cn('text-xs opacity-75', config.textColor)}>
                {suggestion.suggestions.length} suggestie{suggestion.suggestions.length !== 1 ? 's' : ''} beschikbaar
              </div>
            )}
          </div>
          <ChevronRight
            className={cn('w-5 h-5 transition-transform', config.textColor, isExpanded && 'rotate-90')}
          />
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-black/10">
                <p className={cn('text-sm mb-3', config.textColor, 'opacity-80')}>{suggestion.message}</p>

                {/* Stats */}
                {suggestion.stats && (
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="p-2 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{suggestion.stats.filteredProducts}</div>
                      <div className="text-[10px] text-gray-600">Producten</div>
                    </div>
                    <div className="p-2 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{suggestion.stats.retentionRate}%</div>
                      <div className="text-[10px] text-gray-600">Behouden</div>
                    </div>
                    <div className="p-2 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {suggestion.stats.missingCategories?.length || 0}
                      </div>
                      <div className="text-[10px] text-gray-600">Ontbreekt</div>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="space-y-1.5">
                  {suggestion.suggestions.map((sug, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-white/50 rounded-lg text-sm text-gray-700"
                    >
                      <div className={cn('p-1 rounded', config.iconColor)}>{getSuggestionIcon(sug)}</div>
                      <span className="flex-1">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Inline variant (compact)
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <div className={cn('font-semibold text-sm mb-1', config.textColor)}>{suggestion.title}</div>
        <p className={cn('text-xs', config.textColor, 'opacity-75')}>{suggestion.message}</p>
        {suggestion.suggestions.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            💡 {suggestion.suggestions[0]}
            {suggestion.suggestions.length > 1 && ` +${suggestion.suggestions.length - 1} meer`}
          </div>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={cn('p-1 rounded hover:bg-black/10', config.textColor)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Helper: Create suggestion from insufficientProductsHandler result
 */
export function createInsufficientProductsSuggestion(
  handlerResult: {
    message: string;
    suggestions: string[];
    stats: {
      totalProducts: number;
      filteredProducts: number;
      retentionRate: number;
      categoryCounts: Record<string, number>;
    };
  }
): InsufficientProductsSuggestion {
  const { message, suggestions, stats } = handlerResult;

  // Determine missing categories (< 2 items)
  const missingCategories = Object.entries(stats.categoryCounts)
    .filter(([, count]) => count < 2)
    .map(([cat]) => cat);

  // Determine severity based on retention rate
  let severity: 'error' | 'warning' | 'info' = 'warning';
  if (stats.retentionRate < 5) severity = 'error';
  else if (stats.retentionRate > 20) severity = 'info';

  return {
    title: stats.filteredProducts === 0 ? 'Geen producten gevonden' : 'Beperkte producten beschikbaar',
    message,
    suggestions,
    severity,
    canContinue: stats.filteredProducts >= 12, // Need ~12+ products for 3 outfits
    stats: {
      ...stats,
      missingCategories: missingCategories.length > 0 ? missingCategories : undefined
    }
  };
}
