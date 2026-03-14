import React from "react";
import { Heart, Check, Sparkles } from "lucide-react";

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
  isFavorite,
  onSelect,
  onToggleFavorite,
  onImageError,
}: ResultsOutfitCardProps) {
  return (
    <article
      onClick={onSelect}
      className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#C2654A] transition-all duration-300 cursor-pointer group"
    >
      {/* Image area — 3:4 ratio */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EB]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={onImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F4E8E3] to-[#F5F0EB] flex items-center justify-center">
            <div className="text-center p-4">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#C2654A]" aria-hidden="true" />
              <p className="text-xs text-[#8A8A8A] font-medium">Outfit {index + 1}</p>
            </div>
          </div>
        )}

        {/* Occasion badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[1px] uppercase text-[#1A1A1A] shadow-sm">
          {occasionContext.label}
        </span>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          aria-label={isFavorite ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 hover:bg-white hover:scale-110 ${
            isFavorite
              ? "text-[#C2654A]"
              : "text-[#8A8A8A] hover:text-[#C2654A]"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#C2654A]" : ""}`} />
        </button>
      </div>

      {/* Info area */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-semibold text-[#1A1A1A] mb-1.5 group-hover:text-[#C2654A] transition-colors duration-200">
          {name}
        </h3>

        {/* Description — single line */}
        <p className="text-sm text-[#4A4A4A] leading-[1.5] line-clamp-1 mb-3">
          {description}
        </p>

        {/* Match score + style badge */}
        {(typeof matchScore === "number" || fitLabel) && (
          <div className="flex items-center gap-3">
            {typeof matchScore === "number" && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#C2654A]" strokeWidth={3} />
                </span>
                <span className="text-sm font-semibold text-[#C2654A]">{Math.round(matchScore)}% match</span>
              </span>
            )}
            {fitLabel && (
              <span className="px-2.5 py-1 rounded-full bg-[#F5F0EB] text-xs font-medium text-[#4A4A4A]">{fitLabel}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
