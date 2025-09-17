import React from "react";
import { ShoppingBag, Bookmark, Info } from "lucide-react";
import Button from "@/components/ui/Button";

export interface OutfitCardProps {
  title: string;
  imageSrc?: string;
  season?: string;            // bijv. "Herfst/Winter"
  colorTemp?: string;         // bijv. "Koel"
  archetype?: string;         // bijv. "Minimal"
  why?: string;               // 1–2 zinnen explainability
  onShop?: () => void;
  onSave?: () => void;
}

const badgeCls =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs border border-[color:var(--color-border)] " +
  "bg-[color:var(--color-surface)] text-[color:var(--color-text)]";

const OutfitCard: React.FC<OutfitCardProps> = ({
  title,
  imageSrc,
  season,
  colorTemp,
  archetype,
  why,
  onShop,
  onSave,
}) => {
  return (
    <article
      className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden hover:shadow-md transition-shadow"
      aria-label={`Outfit: ${title}`}
    >
      <div className="relative w-full aspect-[3/4] bg-[color:var(--color-bg)]">
        {imageSrc ? (
          // Als de afbeelding ontbreekt in /public tonen we gewoon de achtergrond — geen kapot icoon.
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-[color:var(--color-text)]">{title}</h3>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {season ? <span className={badgeCls}>{season}</span> : null}
          {colorTemp ? <span className={badgeCls}>Kleurtemp: {colorTemp}</span> : null}
          {archetype ? <span className={badgeCls}>Archetype: {archetype}</span> : null}
        </div>

        {/* Explainability */}
        {why ? (
          <p className="mt-3 text-sm text-[color:var(--color-muted)] leading-relaxed">
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-text)]">
              <Info size={14} aria-hidden="true" /> Waarom dit past:
            </span>{" "}
            {why}
          </p>
        ) : null}

        {/* CTA rail */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            aria-label={`Shop deze look: ${title}`}
            onClick={onShop}
          >
            <ShoppingBag size={18} className="mr-2" aria-hidden="true" />
            Shop de look
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            aria-label={`Bewaar outfit: ${title}`}
            onClick={onSave}
          >
            <Bookmark size={18} className="mr-2" aria-hidden="true" />
            Bewaar
          </Button>
        </div>
      </div>
    </article>
  );
};

export default OutfitCard;