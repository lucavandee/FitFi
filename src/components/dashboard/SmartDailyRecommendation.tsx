import React, { useMemo } from 'react';
import { Sparkles, Sun, Cloud, Calendar } from 'lucide-react';
import OutfitCard from '@/components/outfits/OutfitCard';
import type { Outfit } from '@/engine/types';

interface SmartDailyRecommendationProps {
  outfits: Outfit[];
  userProfile?: {
    archetype?: string;
    colorPalette?: string[];
  };
}

export const SmartDailyRecommendation: React.FC<SmartDailyRecommendationProps> = ({
  outfits,
  userProfile
}) => {
  const recommendation = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;

    // Determine time context
    let timeContext: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 12 && hour < 17) timeContext = 'afternoon';
    if (hour >= 17) timeContext = 'evening';

    // Determine occasion based on time and day
    let occasion = 'Casual';
    if (!isWeekend && hour >= 7 && hour < 17) {
      occasion = 'Werk';
    } else if (hour >= 18) {
      occasion = 'Uitgaan';
    }

    // Score outfits based on context
    const scoredOutfits = outfits.map(outfit => {
      let score = outfit.matchPercentage || 70;

      // Boost for matching occasion
      if (outfit.occasion === occasion) score += 10;

      // Boost for current season
      const month = now.getMonth();
      const season = month >= 2 && month <= 4 ? 'spring' :
                     month >= 5 && month <= 7 ? 'summer' :
                     month >= 8 && month <= 10 ? 'fall' : 'winter';

      if (outfit.season === season) score += 8;

      // Boost for archetype match
      if (userProfile?.archetype && outfit.archetype === userProfile.archetype) {
        score += 12;
      }

      // Time-based preferences
      if (timeContext === 'morning' && outfit.style?.includes('fresh')) score += 5;
      if (timeContext === 'evening' && outfit.style?.includes('elegant')) score += 5;

      return { outfit, score };
    });

    // Sort and pick best
    scoredOutfits.sort((a, b) => b.score - a.score);
    return scoredOutfits[0];
  }, [outfits, userProfile]);

  if (!recommendation) {
    return null;
  }

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return <Sun className="w-5 h-5 text-amber-500" />;
    if (hour >= 12 && hour < 18) return <Cloud className="w-5 h-5 text-blue-500" />;
    return <Sparkles className="w-5 h-5 text-purple-500" />;
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Goedemorgen';
    if (hour >= 12 && hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const getContextMessage = () => {
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const hour = new Date().getHours();

    if (isWeekend) {
      return 'Perfect voor een ontspannen weekend';
    }
    if (hour >= 7 && hour < 17) {
      return 'Ideaal voor een productieve werkdag';
    }
    return 'Geschikt voor een avondje uit';
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        {getTimeIcon()}
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
            {getTimeGreeting()}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Nova stelt voor om dit te dragen
          </p>
        </div>
      </div>

      <div className="mb-4">
        <OutfitCard outfit={recommendation.outfit} compact />
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Calendar className="w-4 h-4" />
        <span>{getContextMessage()}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>Match score</span>
          <span className="font-semibold text-[var(--color-primary)]">
            {Math.round(recommendation.score)}%
          </span>
        </div>
      </div>
    </div>
  );
};
