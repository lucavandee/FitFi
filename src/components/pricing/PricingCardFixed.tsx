/**
 * PricingCardFixed Component
 *
 * FIXED: Clear CTA hierarchy for pricing cards
 *
 * RULES:
 * - Only RECOMMENDED plan gets primary button
 * - All other plans use secondary buttons
 * - ONE primary CTA per page (recommended plan)
 *
 * BEFORE (❌ Wrong):
 *   All cards: <button className="bg-primary">Kies dit plan</button>
 *   → User confusion, no clear choice
 *
 * AFTER (✅ Correct):
 *   Recommended: <button className="...primary">Start gratis</button>
 *   Others: <button className="...secondary">Kies dit plan</button>
 *   → Clear visual hierarchy, obvious best choice
 */

import React from 'react';
import { Check, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  /** Plan name */
  name: string;

  /** Price (monthly) */
  price: number;

  /** Is this the recommended plan? (ONLY ONE should be true) */
  recommended?: boolean;

  /** Features list */
  features: string[];

  /** Click handler */
  onSelect: () => void;

  /** Is this plan currently active? */
  active?: boolean;
}

export function PricingCardFixed({
  name,
  price,
  recommended = false,
  features,
  onSelect,
  active = false
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        relative p-8 rounded-2xl transition-all
        ${recommended
          ? 'border-4 border-[#C2654A] shadow-xl scale-105 bg-[#FAF5F2]'
          : 'border-2 border-[#E5E5E5] bg-white hover:border-[#F4E8E3] hover:shadow-lg'
        }
      `}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#C2654A] text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
          <Star className="w-4 h-4 fill-white" aria-hidden="true" />
          Aanbevolen
        </div>
      )}

      {/* Active Badge */}
      {active && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
          Actief
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
        {name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-[#1A1A1A]">
            €{price}
          </span>
          <span className="text-lg text-[#8A8A8A]">/maand</span>
        </div>
        {price === 0 && (
          <p className="text-sm text-[#8A8A8A] mt-1">
            Altijd gratis
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8" role="list">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3" role="listitem">
            <Check
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-[#1A1A1A]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA - Hierarchy based on recommended status */}
      {recommended ? (
        <button
          onClick={onSelect}
          disabled={active}
          className="w-full group inline-flex items-center justify-center gap-2 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-60"
          aria-label={`Selecteer ${name} plan - Aanbevolen optie`}
        >
          {active ? (
            'Huidig plan'
          ) : (
            <>
              Start gratis
              <ArrowRight
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onSelect}
          disabled={active}
          className="w-full bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-60"
          aria-label={`Selecteer ${name} plan`}
        >
          {active ? 'Huidig plan' : 'Kies dit plan'}
        </button>
      )}

      {/* Additional Info Link (Tertiary) */}
      {recommended && (
        <a
          href="#features"
          className="block text-center mt-4 text-sm text-[#8A8A8A] hover:text-[#C2654A] transition-colors duration-200"
        >
          Bekijk alle features →
        </a>
      )}
    </motion.div>
  );
}

export default PricingCardFixed;
