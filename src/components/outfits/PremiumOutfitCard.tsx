import React from "react";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumChip from "@/components/ui/PremiumChip";
import PremiumButton from "@/components/ui/PremiumButton";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { ExplainBadge } from "@/components/outfits/ExplainBadge";
import { useEnhancedNova } from "@/hooks/useEnhancedNova";
import { MatchFeedbackWidget } from "@/components/outfits/MatchFeedbackWidget";

interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}
import { trackOutfitExplain } from '@/hooks/useABTesting';
import { useEffect, useRef } from 'react';

interface PremiumOutfitCardProps {
  outfit: {
    id: string;
    name: string;
    items: OutfitItem[];
    totalPrice: number;
    occasion: string;
    style: string;
    explanation?: string;
    matchPercentage?: number;
  };
  onSave?: (outfitId: string) => void;
  onShare?: (outfitId: string) => void;
}

export default function PremiumOutfitCard({
  outfit,
  onSave,
  onShare
}: PremiumOutfitCardProps) {
  const explainRef = useRef<HTMLDivElement>(null);
  const { context: novaContext } = useEnhancedNova();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackOutfitExplain(outfit.id);
        }
      },
      { threshold: 0.5 }
    );

    if (explainRef.current) {
      observer.observe(explainRef.current);
    }

    return () => observer.disconnect();
  }, [outfit.id]);

  return (
    <PremiumCard>
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      data-kind="outfit-card"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {outfit.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <PremiumChip variant="accent" size="sm">
                {outfit.occasion}
              </PremiumChip>
              <PremiumChip variant="default" size="sm">
                {outfit.style}
              </PremiumChip>
              {novaContext && outfit.explanation && (
                <ExplainBadge
                  explanation={outfit.explanation}
                  reasons={[
                    `Past bij je ${novaContext.archetype} stijl`,
                    `Matcht met je ${novaContext.colorProfile.undertone} undertone`,
                    `Perfect voor ${outfit.occasion}`
                  ]}
                  compact={true}
                />
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              €{outfit.totalPrice}
            </div>
            <div className="text-sm text-[#AAB0C0]">
              {outfit.items.length} items
            </div>
          </div>
        </div>

        {/* Outfit Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {outfit.items.slice(0, 4).map((item) => (
            <div key={item.id} className="relative group/item">
              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                  fallbackCategory={item.category}
                />
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-white truncate">
                  {item.name}
                </div>
                <div className="text-xs text-[#AAB0C0] truncate">
                  {item.brand} • €{item.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        {outfit.explanation && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#67E8F9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-[#67E8F9]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-[#67E8F9] mb-1">
                  Waarom deze combinatie?
                </div>
                <p className="text-sm text-[#AAB0C0] leading-relaxed">
                  {outfit.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <PremiumButton
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onSave?.(outfit.id)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Bewaren
          </PremiumButton>

          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(outfit.id)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Delen
          </PremiumButton>
        </div>

        {/* Match Feedback */}
        {outfit.matchPercentage && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <MatchFeedbackWidget
              outfitId={outfit.id}
              shownScore={outfit.matchPercentage}
              compact
            />
          </div>
        )}
      </div>

      <div className="explain">
      <div ref={explainRef} className="explain text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
      </div>
      </div>
    </div>
    </PremiumCard>
  );
}