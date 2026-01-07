import { ShoppingBag, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { getShoppingGuidance } from '@/data/styleDNAExplanations';

interface ShoppingGuidanceProps {
  season: string;
  contrast: string;
  chroma: string;
}

/**
 * ShoppingGuidance - Practical, actionable shopping tips
 *
 * Purpose:
 * - Translate Style DNA into shopping list
 * - Provide immediate actionability
 * - Reduce decision paralysis
 *
 * UX: One-glance cheat sheet for shopping
 */
export function ShoppingGuidance({
  season,
  contrast,
  chroma
}: ShoppingGuidanceProps) {
  const guidance = getShoppingGuidance(season, contrast, chroma);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] rounded-3xl border-2 border-[var(--ff-color-primary-200)] p-8 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[var(--color-text)]">
            Jouw Shopping Cheat Sheet
          </h3>
          <p className="text-sm text-gray-600">
            Neem dit mee als je gaat shoppen
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Must-Haves */}
        <div className="bg-white rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-green-900">Zoek deze kleuren</h4>
          </div>
          <ul className="space-y-2">
            {guidance.musthaves.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Avoid */}
        <div className="bg-white rounded-2xl p-6 border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-red-900">Vermijd deze</h4>
          </div>
          <ul className="space-y-2">
            {guidance.avoid.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Styling Tips */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-amber-900">Styling Tips</h4>
          </div>
          <ul className="space-y-2">
            {guidance.styling_tips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] rounded-xl">
        <p className="text-sm text-[var(--ff-color-primary-800)] leading-relaxed">
          <strong>Pro tip:</strong> Screenshot deze sectie en bewaar hem in je telefoon.
          Zo heb je altijd je persoonlijke kleurgids bij de hand tijdens het shoppen!
        </p>
      </div>
    </motion.div>
  );
}

/**
 * UX Psychology:
 *
 * 1. Reduce Cognitive Load:
 *    - Simple 3-column layout
 *    - Color-coded (green/red/amber)
 *    - Bullet points for scannability
 *
 * 2. Actionable Format:
 *    - "Zoek deze kleuren" (not "you could wear")
 *    - "Vermijd deze" (direct instruction)
 *    - Screenshot-friendly
 *
 * 3. Mobile-First:
 *    - Screenshot and save
 *    - Use in store
 *    - No need to remember
 *
 * 4. Confidence Building:
 *    - Clear do's and don'ts
 *    - No ambiguity
 *    - Decision support
 *
 * 5. Practical Application:
 *    - Not theory
 *    - Immediate use
 *    - Real-world context
 *
 * References:
 * - Don Norman: Design of Everyday Things
 * - Krug: Don't Make Me Think
 * - Nielsen: Usability Engineering
 */
