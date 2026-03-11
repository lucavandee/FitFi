import React from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Check, Sparkles } from "lucide-react";
import { SurfaceCard, BadgePill } from "@/components/ui/primitives";

interface OutfitContext {
  emoji: string;
  label: string;
}

export interface ResultsOutfitCardProps {
  id: string;
  index: number;
  name: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  occasionContext: OutfitContext;
  matchScore: number | null;
  fitLabel: string | null;
  productCount: number;
  isFavorite: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function ResultsOutfitCard({
  index,
  name,
  description,
  imageUrl,
  imageAlt,
  occasionContext,
  matchScore,
  fitLabel,
  productCount,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onImageError,
}: ResultsOutfitCardProps) {
  return (
    <SurfaceCard
      as="article"
      hover={false}
      padding="none"
      className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,35,51,0.10)]"
    >
      {/* Image area — aspect 3:4, dominates the card */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={onImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
            <div className="text-center p-6">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              <p className="text-xs text-[var(--color-muted)] font-medium">Outfit {index + 1}</p>
            </div>
          </div>
        )}

        {/* Favorite toggle — top right */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
          className={`absolute top-3 right-3 w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors ${
            isFavorite
              ? "bg-[var(--ff-color-danger-500)] text-white"
              : "bg-[var(--color-surface)]/90 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </motion.button>

        {/* Shop CTA — slim overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(18,18,18,0.60)] to-transparent pt-6">
          <button
            type="button"
            onClick={onSelect}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[40px] bg-[var(--ff-color-primary-700)] text-white text-xs font-semibold hover:bg-[var(--ff-color-primary-600)] active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>Bekijk &amp; shop</span>
            {productCount > 0 && (
              <span className="px-1.5 py-px bg-white/20 rounded-full text-[10px] font-bold leading-none">
                {productCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Info area — compact */}
      <div className="px-3 pt-3 pb-3.5">
        {/* Occasion */}
        <BadgePill variant="soft" className="mb-2">
          <span className="text-xs mr-0.5">{occasionContext.emoji}</span>
          {occasionContext.label}
        </BadgePill>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2 mb-1 group-hover:text-[var(--ff-color-primary-600)] transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed mb-2.5">
          {description}
        </p>

        {/* Meta pills */}
        {(matchScore !== null || fitLabel) && (
          <div className="flex flex-wrap gap-1">
            {typeof matchScore === "number" && (
              <BadgePill variant="success" icon={<Check className="w-2.5 h-2.5" strokeWidth={3} />}>
                {Math.round(matchScore)}% match
              </BadgePill>
            )}
            {fitLabel && (
              <BadgePill variant="arch">{fitLabel}</BadgePill>
            )}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
