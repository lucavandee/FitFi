import React from "react";
import { Heart, Sparkles } from "lucide-react";

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
  isFavorite,
  onSelect,
  onToggleFavorite,
  onImageError,
}: ResultsOutfitCardProps) {
  return (
    <article
      onClick={onSelect}
      className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#A85740] transition-all duration-300 cursor-pointer group"
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
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#A85740]" aria-hidden="true" />
              <p className="text-xs text-[#6E6E6E] font-medium">Outfit {index + 1}</p>
            </div>
          </div>
        )}

        {/* Occasion badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[1px] uppercase text-[#1A1A1A] shadow-sm z-10">
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
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm z-10 transition-all duration-200 hover:bg-white hover:scale-110 ${
            isFavorite
              ? "text-[#A85740]"
              : "text-[#6E6E6E] hover:text-[#A85740]"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#A85740]" : ""}`} />
        </button>
      </div>

      {/* Info area */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-semibold text-[#1A1A1A] mb-1.5 group-hover:text-[#A85740] transition-colors duration-200">
          {name}
        </h3>

        {/* Description — up to two lines */}
        <p className="text-sm text-[#4A4A4A] leading-[1.5] line-clamp-3">
          {description}
        </p>
        {/* Hier stond "54% match" en het pasvormantwoord van de bezoeker als
            label. Het percentage was voor vrijwel elke outfit 53 of 54 en zei
            niets (keten-kritiek, 16 oktober 2026). */}
      </div>
    </article>
  );
}
