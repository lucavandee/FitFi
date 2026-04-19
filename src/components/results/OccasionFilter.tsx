import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Coffee, Heart, PartyPopper, Dumbbell, Plane, Sparkles } from 'lucide-react';
import type { Occasion } from '@/engine/occasionMatching';

interface OccasionFilterProps {
  value: Occasion | 'all';
  onChange: (occasion: Occasion | 'all') => void;
  className?: string;
}

const OCCASIONS: Array<{
  value: Occasion | 'all';
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'all',
    label: 'Alle',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Alle outfits'
  },
  {
    value: 'work',
    label: 'Kantoor',
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Zakelijke meeting of werkdag'
  },
  {
    value: 'casual',
    label: 'Casual dag uit',
    icon: <Coffee className="w-4 h-4" />,
    description: 'Lunch, koffie, boodschappen'
  },
  {
    value: 'date',
    label: 'Avondje uit',
    icon: <Heart className="w-4 h-4" />,
    description: 'Restaurant, borrel of diner'
  },
  {
    value: 'party',
    label: 'Feest / uitgaan',
    icon: <PartyPopper className="w-4 h-4" />,
    description: 'Bar, club, avondje uit'
  },
  {
    value: 'formal',
    label: 'Formeel event',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Gala, bruiloft, theater'
  },
  {
    value: 'sports',
    label: 'Sport / actief',
    icon: <Dumbbell className="w-4 h-4" />,
    description: 'Gym, hardlopen, workout'
  },
  {
    value: 'travel',
    label: 'Op reis',
    icon: <Plane className="w-4 h-4" />,
    description: 'Vliegtuig, stadstrip, vakantie'
  }
];

export function OccasionFilter({ value, onChange, className = '' }: OccasionFilterProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#1A1A1A]">
          Filter op gelegenheid
        </h3>
        {value !== 'all' && (
          <button
            onClick={() => onChange('all')}
            className="text-xs text-[#C2654A] hover:underline min-h-[44px] px-3"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((occasion) => {
          const isActive = value === occasion.value;

          return (
            <motion.button
              key={occasion.value}
              onClick={() => onChange(occasion.value)}
              className={`
                relative px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium
                transition-all duration-200
                flex items-center gap-2
                ${
                  isActive
                    ? 'bg-[#A8513A] text-white shadow-lg'
                    : 'bg-[#FFFFFF] text-[#1A1A1A] border border-[#E5E5E5] hover:border-[#D4856E]'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`${occasion.label} — ${occasion.description}`}
              aria-pressed={isActive}
            >
              {occasion.icon}
              <span>{occasion.label}</span>

              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-[#A8513A]/10 pointer-events-none"
                  layoutId="occasion-active"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {value !== 'all' && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#1A1A1A]/60"
        >
          {OCCASIONS.find(o => o.value === value)?.description}
        </motion.p>
      )}
    </div>
  );
}
