/**
 * ProfileQuickActions Component
 *
 * Quick access to common profile actions
 *
 * Key Principles:
 * - Clear, action-oriented labels ("Pas je stijl aan" niet "Update")
 * - Visual hierarchy (primary actions prominent)
 * - Context (explain what each action does)
 * - Control (user always knows what will happen)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Eye,
  ShoppingBag,
  Heart,
  Settings,
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface ProfileQuickActionsProps {
  /** Show quiz reset action? */
  canResetQuiz?: boolean;

  /** Show view results action? */
  hasResults?: boolean;

  /** Saved outfits count */
  savedCount?: number;

  /** Custom reset handler */
  onResetQuiz?: () => void;
}

export function ProfileQuickActions({
  canResetQuiz = true,
  hasResults = true,
  savedCount = 0,
  onResetQuiz
}: ProfileQuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    // Primary: Viewing results
    {
      id: 'view-results',
      icon: Eye,
      label: 'Bekijk je outfits',
      description: 'Zie je gepersonaliseerde aanbevelingen',
      action: () => navigate('/results'),
      variant: 'primary' as const,
      visible: hasResults,
      badge: null
    },
    // Secondary: Shop
    {
      id: 'shop',
      icon: ShoppingBag,
      label: 'Shop producten',
      description: 'Vind items die bij je passen',
      action: () => navigate('/shop'),
      variant: 'secondary' as const,
      visible: true,
      badge: null
    },
    // Secondary: Saved outfits
    {
      id: 'saved',
      icon: Heart,
      label: 'Favorieten',
      description: `${savedCount} opgeslagen outfits`,
      action: () => navigate('/dashboard'),
      variant: 'secondary' as const,
      visible: savedCount > 0,
      badge: savedCount > 0 ? savedCount : null
    },
    // Secondary: Quiz reset
    {
      id: 'reset-quiz',
      icon: RefreshCw,
      label: 'Pas je stijl aan',
      description: 'Doe de quiz opnieuw voor verse resultaten',
      action: onResetQuiz || (() => navigate('/onboarding')),
      variant: 'secondary' as const,
      visible: canResetQuiz,
      badge: null
    }
  ];

  const visibleActions = actions.filter(a => a.visible);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--color-text)]">Snelle Acties</h3>
        <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleActions.map((action, index) => {
          const Icon = action.icon;
          const isPrimary = action.variant === 'primary';

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all group
                ${isPrimary
                  ? 'bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] border-transparent text-white shadow-lg hover:shadow-xl'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:shadow-md'
                }
              `}
              aria-label={`${action.label}: ${action.description}`}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full">
                  {action.badge}
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isPrimary
                    ? 'bg-white/20'
                    : 'bg-[var(--ff-color-primary-100)]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isPrimary
                      ? 'text-white'
                      : 'text-[var(--ff-color-primary-600)]'
                  }`}
                  aria-hidden="true"
                />
              </div>

              {/* Content */}
              <div className="mb-3">
                <p
                  className={`font-bold mb-1 flex items-center gap-2 ${
                    isPrimary ? 'text-white' : 'text-[var(--color-text)]'
                  }`}
                >
                  {action.label}
                  <ArrowRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isPrimary ? 'text-white' : 'text-[var(--ff-color-primary-600)]'
                    }`}
                    aria-hidden="true"
                  />
                </p>
                <p
                  className={`text-sm ${
                    isPrimary ? 'text-white/80' : 'text-[var(--color-muted)]'
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)] pt-4 mt-6">
        <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" aria-hidden="true" />
          Instellingen
        </h4>

        {/* Settings Links */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => navigate('/profile#email-preferences')}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors text-left"
            aria-label="Pas je email voorkeuren aan"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Email voorkeuren</p>
              <p className="text-xs text-[var(--color-muted)]">Beheer meldingen en nieuwsbrieven</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-muted)]" aria-hidden="true" />
          </button>

          <button
            onClick={() => navigate('/profile#privacy')}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors text-left"
            aria-label="Bekijk privacy instellingen"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Privacy & cookies</p>
              <p className="text-xs text-[var(--color-muted)]">Beheer je privacy voorkeuren</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-muted)]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileQuickActions;
