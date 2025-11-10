import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Shirt, AlertCircle, Calendar, ShoppingBag } from 'lucide-react';
import { track } from '@/utils/analytics';

type Props = {
  suggestions?: string[];
  className?: string;
  autoSubmit?: boolean;
};

const DEFAULTS = [
  { text: 'Welke kleuren passen bij mij?', icon: Palette },
  { text: 'Toon kleurencombinaties voor mijn undertone', icon: Sparkles },
  { text: 'Maak een casual vrijdag-outfit voor mij', icon: Shirt },
  { text: 'Welke kleuren moet ik vermijden?', icon: AlertCircle },
  { text: 'Geef 3 outfits voor een bruiloft (smart casual)', icon: Calendar },
  { text: 'Welke jas voor herfst 2025 met mijn stijlcode?', icon: ShoppingBag },
];

export default function SuggestionChips({ suggestions, className, autoSubmit = true }: Props) {
  const send = (text: string) => {
    window.dispatchEvent(new CustomEvent('nova:prefill', { detail: { prompt: text, submit: autoSubmit } }));
    track?.('nova_suggestion_click', { prompt: text });
  };

  const suggestionItems = suggestions
    ? suggestions.map(s => ({ text: s, icon: Sparkles }))
    : DEFAULTS;

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`} aria-label="Voorbeelden">
      {suggestionItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={i}
            onClick={() => send(item.text)}
            className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 rounded-xl border border-blue-200 dark:border-blue-800 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="relative">
              {item.text}
              <span className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}