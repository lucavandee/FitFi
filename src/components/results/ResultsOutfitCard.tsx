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
      className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(30,35,51,0.09)]"
    >
      {/* Image area — 4:5 ratio keeps the card proportionate without tower effect */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ff-color-neutral-100)]">
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
            <div className="text-center p-4">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-[var(--ff-color-primary-400)]" aria-hidden="true" />
              <p className="text-[11px] text-[var(--color-muted)] font-medium">Outfit {index + 1}</p>
            </div>
          </div>
        )}

        {/* Favorite toggle — top right, smaller footprint */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
          className={`absolute top-2 right-2 w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm transition-colors ${
            isFavorite
              ? "bg-[var(--ff-color-danger-500)] text-white"
              : "bg-[var(--color-surface)]/85 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </motion.button>

        {/* CTA overlay — decorative gradient + slim action bar, no heavy block */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none h-20 bg-gradient-to-t from-[rgba(10,10,10,0.45)] to-transparent" />
        <button
          type="button"
          onClick={onSelect}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] bg-[var(--ff-color-primary-700)]/95 text-white text-[11px] font-semibold hover:bg-[var(--ff-color-primary-600)] active:scale-[0.99] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-0"
        >
          <ShoppingBag className="w-3 h-3 shrink-0" />
          <span>Bekijk &amp; shop</span>
          {productCount > 0 && (
            <span className="px-1.5 py-px bg-white/25 rounded-full text-[9px] font-bold leading-none">
              {productCount}
            </span>
          )}
        </button>
      </div>

      {/* Info area */}
      <div className="px-3 pt-2.5 pb-3">
        {/* Occasion — leading meta, stays small */}
        <div className="mb-1.5">
          <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wide leading-none">
            {occasionContext.label}
          </span>
        </div>

        {/* Title — scannable anchor */}
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2 mb-1 group-hover:text-[var(--ff-color-primary-600)] transition-colors">
          {name}
        </h3>

        {/* Description — supporting, compact */}
        <p className="text-[11px] text-[var(--color-muted)] line-clamp-2 leading-normal mb-2">
          {description}
        </p>

        {/* Meta pills — subordinate, only if data exists */}
        {(typeof matchScore === "number" || fitLabel) && (
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
