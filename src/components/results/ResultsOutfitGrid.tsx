import React from 'react';
import { motion } from 'framer-motion';
import PremiumOutfitCard from '@/components/outfits/PremiumOutfitCard';
import type { Outfit } from '@/services/data/types';

interface ResultsOutfitGridProps {
  outfits: Outfit[];
  onSave?: (outfit: Outfit) => void;
  onShare?: (outfit: Outfit) => void;
  onZoom?: (outfit: Outfit) => void;
}

export const ResultsOutfitGrid: React.FC<ResultsOutfitGridProps> = ({
  outfits,
  onSave,
  onShare,
  onZoom
}) => {
  if (outfits.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {outfits.map((outfit, index) => (
        <motion.div
          key={outfit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.05,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <PremiumOutfitCard
            outfit={{
              id: outfit.id,
              name: outfit.title || 'Outfit',
              items: (outfit.products || []).map(product => ({
                id: product.id,
                name: product.title || product.name || '',
                brand: product.brand || '',
                price: product.price || 0,
                image: product.imageUrl || product.image || '',
                category: product.category || '',
              })),
              totalPrice:
                outfit.priceMax ??
                outfit.priceMin ??
                (outfit.products || []).reduce((sum, product) => sum + (product.price || 0), 0),
              occasion: outfit.tags?.[0] || '',
              style: outfit.tags?.[1] || outfit.tags?.[0] || '',
              explanation: outfit.explanation,
              matchPercentage: outfit.match,
            }}
            onSave={onSave ? () => onSave(outfit) : undefined}
            onShare={onShare ? () => onShare(outfit) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
};
