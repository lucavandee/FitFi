import React, { useState, useMemo } from 'react';
import { RefreshCw, Shirt, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { OutfitCard } from './OutfitCard';
import { remixOutfit } from '@/services/outfits/outfitRemixer';
import type { Outfit, Product } from '@/engine/types';

interface OutfitRemixerProps {
  outfit: Outfit;
  availableProducts: Product[];
  userProfile: {
    archetype?: string;
    colorPalette?: string[];
    preferences?: {
      styles?: string[];
      occasions?: string[];
    };
  };
  onSelectRemix?: (remixedOutfit: Outfit) => void;
}

export const OutfitRemixer: React.FC<OutfitRemixerProps> = ({
  outfit,
  availableProducts,
  userProfile,
  onSelectRemix
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);

  // Get categories that can be remixed
  const remixableCategories = useMemo(() => {
    const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory'];
    return categories.filter(cat => {
      const hasCurrentItem = outfit.products?.some(p => (p.category || p.type) === cat);
      const hasAlternatives = availableProducts.some(p => (p.category || p.type) === cat);
      return hasCurrentItem && hasAlternatives;
    });
  }, [outfit, availableProducts]);

  // Generate remixes for selected category
  const remixes = useMemo(() => {
    if (!selectedCategory) return [];

    return remixOutfit(
      outfit,
      availableProducts,
      userProfile,
      {
        targetCategory: selectedCategory as any,
        maxResults: 3,
        minMatchScore: 65
      }
    );
  }, [selectedCategory, outfit, availableProducts, userProfile]);

  const handleRemix = (category: string) => {
    setIsRemixing(true);
    setSelectedCategory(category);
    setTimeout(() => setIsRemixing(false), 300);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      top: 'Top',
      bottom: 'Broek',
      footwear: 'Schoenen',
      outerwear: 'Jas',
      accessory: 'Accessoires'
    };
    return labels[cat] || cat;
  };

  if (remixableCategories.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center">
        <Shirt className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Geen alternatieven beschikbaar voor dit outfit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-display font-semibold text-[var(--color-text)]">
            Remix dit outfit
          </h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Kies een item om te vervangen en zie direct alternatieve combinaties
        </p>

        <div className="flex flex-wrap gap-2">
          {remixableCategories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleRemix(cat)}
              disabled={isRemixing}
            >
              {getCategoryLabel(cat)}
            </Button>
          ))}
        </div>
      </div>

      {/* Remix Results */}
      {selectedCategory && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <TrendingUp className="w-4 h-4" />
            <span>
              {remixes.length} {remixes.length === 1 ? 'alternatief' : 'alternatieven'} gevonden
            </span>
          </div>

          {remixes.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Geen goede alternatieven gevonden voor {getCategoryLabel(selectedCategory).toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {remixes.map((remix, idx) => (
                <div key={idx} className="relative">
                  <OutfitCard
                    outfit={remix.outfit}
                    compact
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Match: {Math.round(remix.matchScore)}%
                    </span>
                    {onSelectRemix && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectRemix(remix.outfit)}
                      >
                        Kies dit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
