/**
 * ResultsStickyCTAFixed Component
 *
 * FIXED: Clear primary CTA on results page
 *
 * PROBLEM (Before):
 * - Multiple "Shop" buttons per outfit card
 * - "Save outfit" buttons equally prominent
 * - No clear primary action
 * → User confusion: "Should I shop or save?"
 *
 * SOLUTION (After):
 * - ONE sticky "Shop favoriete items" primary CTA
 * - Individual "Bewaar" buttons are secondary (smaller, outlined)
 * - Clear hierarchy: Shop (primary) > Save (secondary)
 *
 * WCAG 2.1 AA Compliant:
 * - Mobile thumb zone (bottom bar)
 * - Touch target ≥ 52px
 * - Clear focus states
 */

import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsStickyCTAFixedProps {
  /** Number of saved outfits */
  savedCount: number;

  /** Handler for shop CTA */
  onShopClick: () => void;

  /** Show the bar? (hide if scrolled to top) */
  visible: boolean;
}

export function ResultsStickyCTAFixed({
  savedCount,
  onShopClick,
  visible
}: ResultsStickyCTAFixedProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
          role="region"
          aria-label="Hoofd acties"
        >
          {/* Mobile-optimized sticky CTA bar */}
          <div className="bg-white/95 backdrop-blur-lg border-t-2 border-[var(--color-border)] shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                {/* ✅ PRIMARY CTA - The main goal (shop) */}
                <button
                  onClick={onShopClick}
                  className="ff-btn ff-btn--primary ff-btn--lg flex-1 sm:flex-initial sm:min-w-[280px]"
                  aria-label={`Shop je favoriete items uit ${savedCount} opgeslagen outfits`}
                >
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                  Shop je favoriete items
                  {savedCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-sm font-bold">
                      {savedCount}
                    </span>
                  )}
                </button>

                {/* Saved Count Badge (info only, not a CTA) */}
                {savedCount > 0 && (
                  <div
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-xl border-2 border-pink-200"
                    role="status"
                    aria-live="polite"
                  >
                    <Heart className="w-5 h-5 text-pink-600 fill-pink-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-pink-900">
                      {savedCount} opgeslagen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Helper Text (desktop only) */}
          <div className="hidden sm:block bg-[var(--ff-color-primary-50)] border-t border-[var(--ff-color-primary-100)]">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <p className="text-xs text-[var(--color-muted)] text-center">
                💡 Tip: Bewaar je favoriete outfits met het ❤️ icoon op elke outfit card
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ResultsStickyCTAFixed;
