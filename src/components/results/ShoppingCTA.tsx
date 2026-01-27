/**
 * ShoppingCTA Component
 *
 * Optimized CTA for Results → Shopping flow
 *
 * Key Principles:
 * - Concrete, benefit-driven copy ("Ontdek je outfits" niet "Verder")
 * - Prominent position + whitespace
 * - Sticky op mobiel (thumb zone)
 * - Clear visual hierarchy
 * - Micro-interactions for engagement
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles, Heart, TrendingUp } from 'lucide-react';

interface ShoppingCTAProps {
  /** Outfit count for personalization */
  outfitCount?: number;

  /** Show sticky version on mobile? */
  sticky?: boolean;

  /** Custom route */
  route?: string;

  /** Show secondary actions? */
  showSecondary?: boolean;
}

export function ShoppingCTA({
  outfitCount = 12,
  sticky = true,
  route = '/shop',
  showSecondary = true
}: ShoppingCTAProps) {
  const { scrollY } = useScroll();
  const stickyOpacity = useTransform(scrollY, [100, 200], [0, 1]);

  return (
    <>
      {/* Desktop/Inline CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl p-8 sm:p-10 md:p-12 border-2 border-[var(--ff-color-primary-200)]"
      >
        <div className="text-center max-w-3xl mx-auto">
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg"
          >
            <ShoppingBag className="w-8 h-8 text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Klaar om je{' '}
            <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
              perfecte outfits
            </span>{' '}
            te shoppen?
          </h2>

          {/* Value Proposition */}
          <p className="text-base sm:text-lg text-[var(--color-muted)] mb-8 leading-relaxed">
            Ontdek {outfitCount} gepersonaliseerde outfits met producten die perfect bij jouw stijl passen.
            Alle items direct te bestellen bij topmerken.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to={route}
                className="inline-flex items-center justify-center gap-3 px-8 py-5 min-h-[60px] bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto group"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span>Ontdek je outfits</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </NavLink>
            </motion.div>

            {/* Secondary Actions */}
            {showSecondary && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/profile"
                  className="inline-flex items-center justify-center gap-2 px-6 py-5 min-h-[60px] bg-white border-2 border-[var(--color-border)] rounded-xl font-semibold text-base hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--color-surface)] transition-all w-full sm:w-auto"
                >
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  <span>Bewaar resultaten</span>
                </NavLink>
              </motion.div>
            )}
          </div>

          {/* Trust Signals */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[var(--ff-color-primary-600)] mb-1">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span className="font-bold text-sm">100%</span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">Op maat</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[var(--ff-color-primary-600)] mb-1">
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  <span className="font-bold text-sm">{outfitCount}</span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">Outfits</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[var(--ff-color-primary-600)] mb-1">
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span className="font-bold text-sm">Direct</span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">Bestelbaar</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Mobile CTA - Thumb Zone Optimized */}
      {sticky && (
        <motion.div
          style={{ opacity: stickyOpacity }}
          className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-[var(--ff-color-primary-200)] shadow-2xl"
        >
          <div className="ff-container py-3">
            <div className="flex items-center gap-3">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-text)] truncate">
                  {outfitCount} outfits klaar
                </p>
                <p className="text-xs text-[var(--color-muted)] truncate">
                  100% op jouw stijl afgestemd
                </p>
              </div>

              {/* CTA Button - Thumb-friendly position */}
              <NavLink
                to={route}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex-shrink-0"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Ontdek</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default ShoppingCTA;
