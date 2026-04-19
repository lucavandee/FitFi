import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SortOption = 'relevance' | 'match' | 'recent' | 'price_low' | 'price_high';

interface OutfitSorterProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  visibleCount: number;
  className?: string;
}

const sortOptions: Array<{
  value: SortOption;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'relevance',
    label: 'Top keuzes',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Best passend bij jouw profiel'
  },
  {
    value: 'match',
    label: 'Hoogste match',
    icon: <Star className="w-4 h-4" />,
    description: 'Gerangschikt op match percentage'
  },
  {
    value: 'recent',
    label: 'Nieuwste eerst',
    icon: <Clock className="w-4 h-4" />,
    description: 'Laatst toegevoegde outfits'
  },
  {
    value: 'price_low',
    label: 'Prijs (laag-hoog)',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Voordeligste eerst'
  },
  {
    value: 'price_high',
    label: 'Prijs (hoog-laag)',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Duurste eerst'
  }
];

export default function OutfitSorter({
  currentSort,
  onSortChange,
  totalCount,
  visibleCount,
  className = ''
}: OutfitSorterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentOption = sortOptions.find(opt => opt.value === currentSort) || sortOptions[0];

  return (
    <div className={cn('relative', className)}>
      {/* Header with Count + Sort */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Jouw outfits
          </h3>
          <p className="text-sm text-[#1A1A1A]/60">
            {visibleCount} van {totalCount} outfits
          </p>
        </div>

        {/* Sort Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all',
            'hover:border-[#C2654A] focus:outline-none focus:ring-4 focus:ring-[#C2654A]/20',
            isOpen
              ? 'border-[#C2654A] bg-[#FAF5F2]'
              : 'border-[#E5E5E5] bg-[#FFFFFF]'
          )}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{currentOption.label}</span>
          <span className="text-sm font-medium sm:hidden">Sorteer</span>
        </button>
      </div>

      {/* Sort Dropdown Menu */}
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-2 z-50 bg-[#FFFFFF] rounded-xl border-2 border-[#E5E5E5] shadow-lg overflow-hidden min-w-[280px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="p-2">
            {sortOptions.map((option) => {
              const isActive = option.value === currentSort;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                    isActive
                      ? 'bg-[#FAF5F2] text-[#C2654A]'
                      : 'hover:bg-[#FAFAF8] text-[#1A1A1A]'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      isActive ? 'text-[#C2654A]' : 'text-[#1A1A1A]/60'
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium">{option.label}</span>
                      {isActive && (
                        <span className="text-xs font-bold bg-[#C2654A] text-white px-2 py-0.5 rounded-full">
                          Actief
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-80">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E5E5E5]">
            <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
              Standaard worden de meest relevante outfits eerst getoond op basis van je stijlprofiel en voork euren
            </p>
          </div>
        </motion.div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
