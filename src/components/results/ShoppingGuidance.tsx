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
      className="bg-gradient-to-br from-[#FAF5F2] via-white to-[#FAF5F2] rounded-2xl border-2 border-[#F4E8E3] p-8 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2654A] to-[#C2654A] flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#1A1A1A]">
            Jouw Shopping Cheat Sheet
          </h3>
          <p className="text-sm text-gray-600">
            Neem dit mee als je gaat shoppen
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Must-Haves */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-[#C2654A]" />
            <h4 className="font-bold text-[#1A1A1A]">Zoek deze kleuren</h4>
          </div>
          <ul className="space-y-2">
            {guidance.musthaves.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-[#4A4A4A]"
              >
                <div className="w-2 h-2 rounded-full bg-[#C2654A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Avoid */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5]">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-[#C24A4A]" />
            <h4 className="font-bold text-[#1A1A1A]">Vermijd deze</h4>
          </div>
          <ul className="space-y-2">
            {guidance.avoid.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-[#4A4A4A]"
              >
                <div className="w-2 h-2 rounded-full bg-[#C24A4A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Styling Tips */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5]">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#D4913D]" />
            <h4 className="font-bold text-[#1A1A1A]">Styling Tips</h4>
          </div>
          <ul className="space-y-2">
            {guidance.styling_tips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-[#4A4A4A]"
              >
                <div className="w-2 h-2 rounded-full bg-[#D4913D] mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#FAF5F2] to-[#FAF5F2] rounded-xl">
        <p className="text-sm text-[#8A3D28] leading-relaxed">
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
