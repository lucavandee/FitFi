import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { getStyleDNAExplanation } from '@/data/styleDNAExplanations';
import type { StyleDNAExplanation } from '@/data/styleDNAExplanations';

interface StyleDNATooltipProps {
  attribute: 'season' | 'contrast' | 'chroma' | 'temperature';
  value: string;
  variant?: 'inline' | 'modal';
}

/**
 * StyleDNATooltip - Explains technical color theory terms in plain Dutch
 *
 * Purpose:
 * - Educate users about their style DNA
 * - Provide actionable shopping guidance
 * - Convert jargon into practical advice
 *
 * UX Pattern:
 * - Inline: Expandable card below Style DNA attribute
 * - Modal: Full-screen explanation (for mobile)
 */
export function StyleDNATooltip({
  attribute,
  value,
  variant = 'inline'
}: StyleDNATooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const explanation = getStyleDNAExplanation(attribute, value);

  if (!explanation) return null;

  if (variant === 'inline') {
    return (
      <div className="relative">
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors font-medium"
          aria-label="Meer informatie"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Wat betekent dit?</span>
        </button>

        {/* Expandable Explanation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl p-6 border-2 border-[var(--ff-color-primary-200)] shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <h4 className="font-bold text-lg text-[var(--color-text)]">
                      {explanation.label}
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Sluiten"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Betekent (What it means) */}
                <div className="mb-4">
                  <p className="text-[var(--color-text)] leading-relaxed">
                    {explanation.betekent}
                  </p>
                </div>

                {/* Visual Hint */}
                {explanation.visualHint && (
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      {explanation.visualHint}
                    </p>
                  </div>
                )}

                {/* Voorbeelden (Examples) */}
                <div className="mb-4">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2">
                    Voorbeelden van kleuren:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {explanation.voorbeelden.map((color, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* DO */}
                  <div>
                    <h5 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Draag dit:
                    </h5>
                    <ul className="space-y-1.5">
                      {explanation.do.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DON'T */}
                  <div>
                    <h5 className="font-semibold text-sm text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Vermijd dit:
                    </h5>
                    <ul className="space-y-1.5">
                      {explanation.dont.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Why (Educational) */}
                <div className="p-4 bg-gradient-to-r from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] rounded-lg">
                  <h5 className="font-semibold text-sm text-[var(--ff-color-primary-800)] mb-1">
                    Waarom is dit belangrijk?
                  </h5>
                  <p className="text-sm text-[var(--ff-color-primary-700)] leading-relaxed">
                    {explanation.why}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Modal variant (for future use)
  return null;
}

/**
 * Compact variant - Just show quick tip on hover
 */
export function StyleDNAQuickTip({
  attribute,
  value
}: {
  attribute: 'season' | 'contrast' | 'chroma' | 'temperature';
  value: string;
}) {
  const explanation = getStyleDNAExplanation(attribute, value);
  if (!explanation) return null;

  return (
    <div className="group relative inline-block">
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-[var(--ff-color-primary-600)] transition-colors cursor-help" />

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        <p className="leading-relaxed">{explanation.betekent}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </div>
  );
}

/**
 * UX Psychology Notes:
 *
 * 1. Progressive Disclosure:
 *    - Start with simple label
 *    - Expand on demand
 *    - Don't overwhelm immediately
 *
 * 2. Layered Information:
 *    - WHAT (label)
 *    - BETEKENT (meaning)
 *    - VOORBEELDEN (examples)
 *    - DO/DON'T (practical)
 *    - WHY (educational)
 *
 * 3. Visual Hierarchy:
 *    - Color coding (green = do, red = don't)
 *    - Icons for scannability
 *    - Whitespace for breathing room
 *
 * 4. Actionable Content:
 *    - Not just theory
 *    - Practical shopping advice
 *    - Immediate applicability
 *
 * 5. Educational Value:
 *    - Teach, don't just tell
 *    - Build color literacy
 *    - Empower decision-making
 *
 * References:
 * - Nielsen Norman Group: Progressive Disclosure
 * - Material Design: Tooltips & Explanations
 * - Apple HIG: Help & Onboarding
 */
