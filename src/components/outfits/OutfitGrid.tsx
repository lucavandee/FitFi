import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, Sparkles, TrendingUp, Star } from 'lucide-react';
import UnifiedOutfitCard from '@/components/outfits/UnifiedOutfitCard';
import OutfitSorter, { SortOption } from '@/components/outfits/OutfitSorter';
import { track } from '@/utils/telemetry';
import { cn } from '@/utils/cn';

interface Product {
  id: string;
  name: string;
  brand?: string;
  imageUrl: string;
  price?: number;
  currency?: string;
  retailer?: string;
  affiliateUrl?: string;
  productUrl?: string;
  category?: string;
  color?: string;
  colors?: string[];
}

interface Outfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  matchPercentage?: number;
  currentSeasonLabel?: string;
  dominantColorName?: string;
  archetype?: string;
  tags?: string[];
  products?: Product[];
  occasion?: string;
  totalPrice?: number;
  explanation?: string;
  relevanceScore?: number; // 0-100, for sorting
  createdAt?: string; // ISO date string
}

interface OutfitGridProps {
  outfits: Outfit[];
  initialCount?: number;
  loadMoreCount?: number;
  variant?: 'default' | 'pro' | 'premium' | 'compact';
  layout?: 'vertical' | 'horizontal';
  theme?: 'light' | 'dark';
  showSorter?: boolean;
  showRelevanceBadges?: boolean;
  className?: string;
  onOutfitClick?: (outfit: Outfit) => void;
}

export default function OutfitGrid({
  outfits,
  initialCount = 6,
  loadMoreCount = 6,
  variant = 'default',
  layout = 'vertical',
  theme = 'light',
  showSorter = true,
  showRelevanceBadges = true,
  className = '',
  onOutfitClick
}: OutfitGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isLoading, setIsLoading] = useState(false);

  // Sort outfits based on current sort option
  const sortedOutfits = useMemo(() => {
    const sorted = [...outfits];

    switch (sortBy) {
      case 'relevance':
        return sorted.sort((a, b) => {
          const scoreA = a.relevanceScore || a.matchPercentage || 0;
          const scoreB = b.relevanceScore || b.matchPercentage || 0;
          return scoreB - scoreA;
        });

      case 'match':
        return sorted.sort((a, b) => {
          const matchA = a.matchPercentage || 0;
          const matchB = b.matchPercentage || 0;
          return matchB - matchA;
        });

      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

      case 'price_low':
        return sorted.sort((a, b) => {
          const priceA = a.totalPrice || 0;
          const priceB = b.totalPrice || 0;
          return priceA - priceB;
        });

      case 'price_high':
        return sorted.sort((a, b) => {
          const priceA = a.totalPrice || 0;
          const priceB = b.totalPrice || 0;
          return priceB - priceA;
        });

      default:
        return sorted;
    }
  }, [outfits, sortBy]);

  const visibleOutfits = sortedOutfits.slice(0, visibleCount);
  const hasMore = visibleCount < sortedOutfits.length;

  const handleLoadMore = async () => {
    setIsLoading(true);

    track('load_more_outfits', {
      current_count: visibleCount,
      total_count: sortedOutfits.length,
      sort_by: sortBy
    });

    // Simulate loading delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setVisibleCount(prev => Math.min(prev + loadMoreCount, sortedOutfits.length));
    setIsLoading(false);
  };

  const handleSortChange = (newSort: SortOption) => {
    track('change_outfit_sort', {
      from: sortBy,
      to: newSort,
      outfit_count: sortedOutfits.length
    });

    setSortBy(newSort);
  };

  // Get relevance badge for outfit
  const getRelevanceBadge = (outfit: Outfit, index: number) => {
    if (!showRelevanceBadges || sortBy !== 'relevance') return null;

    const score = outfit.relevanceScore || outfit.matchPercentage || 0;

    // Top 3 get special badges
    if (index === 0 && score >= 90) {
      return (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-xs font-bold shadow-lg">
          <Star className="w-3 h-3 fill-current" />
          <span>Perfect voor jou</span>
        </div>
      );
    }

    if (index <= 2 && score >= 85) {
      return (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-lg">
          <Sparkles className="w-3 h-3" />
          <span>Top keuze</span>
        </div>
      );
    }

    if (index <= 5 && score >= 80) {
      return (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
          <TrendingUp className="w-3 h-3" />
          <span>Sterk aanbevolen</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Sorter */}
      {showSorter && (
        <OutfitSorter
          currentSort={sortBy}
          onSortChange={handleSortChange}
          totalCount={sortedOutfits.length}
          visibleCount={visibleCount}
          className="mb-6"
        />
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visibleOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative"
            >
              {/* Relevance Badge */}
              {getRelevanceBadge(outfit, index)}

              <UnifiedOutfitCard
                outfit={outfit}
                variant={variant}
                layout={layout}
                theme={theme}
                onSave={() => {
                  track('save_outfit_from_grid', {
                    outfit_id: outfit.id,
                    position: index,
                    sort_by: sortBy
                  });
                }}
                onDislike={() => {
                  track('dislike_outfit_from_grid', {
                    outfit_id: outfit.id,
                    position: index,
                    sort_by: sortBy
                  });
                }}
                onMoreLikeThis={() => {
                  track('like_outfit_from_grid', {
                    outfit_id: outfit.id,
                    position: index,
                    sort_by: sortBy
                  });
                }}
                onClick={() => onOutfitClick?.(outfit)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold',
              'bg-[var(--color-primary)] text-white',
              'hover:shadow-lg hover:scale-105',
              'focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20',
              'transition-all duration-200',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Laden...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span>
                  Meer outfits laden ({sortedOutfits.length - visibleCount} resterend)
                </span>
              </>
            )}
          </button>

          <p className="mt-3 text-sm text-[var(--color-text)]/60">
            {visibleCount} van {sortedOutfits.length} outfits getoond
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {sortedOutfits.length === 0 && (
        <motion.div
          className="py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-4 text-6xl">🎨</div>
          <h3 className="text-xl font-semibold mb-2 text-[var(--color-text)]">
            Geen outfits gevonden
          </h3>
          <p className="text-[var(--color-text)]/60">
            Probeer andere filter- of sorteercriteria
          </p>
        </motion.div>
      )}

      {/* All Loaded State */}
      {!hasMore && sortedOutfits.length > 0 && visibleCount >= sortedOutfits.length && (
        <motion.div
          className="mt-8 py-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-50)] text-[var(--color-primary)] rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Je hebt alle {sortedOutfits.length} outfits bekeken!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
