// /src/components/dashboard/FeaturedOutfitCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";

interface FeaturedOutfitCardProps {
  outfit?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage: number;
    archetype?: string;
    tags?: string[];
  };
  loading?: boolean;
  className?: string;
}

const NewHintChip: React.FC = () => (
  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] text-xs font-medium">
    <Sparkles className="w-3.5 h-3.5" />
    Nieuw: waarom dit werkt
  </span>
);

const FeaturedOutfitCard: React.FC<FeaturedOutfitCardProps> = ({
  outfit,
  loading = false,
  className = "",
}) => {
  const handleViewMore = () => {
    track("featured_outfit_view_more", {
      outfit_id: outfit?.id,
      outfit_title: outfit?.title,
      match_percentage: outfit?.matchPercentage,
      source: "dashboard",
    });
  };

  const handleOutfitClick = () => {
    track("featured_outfit_click", {
      outfit_id: outfit?.id,
      outfit_title: outfit?.title,
      match_percentage: outfit?.matchPercentage,
      source: "dashboard",
    });
  };

  if (loading || !outfit) {
    return (
      <div
        className={`rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-[var(--color-bg)]/60" />
            <div className="h-4 rounded bg-[var(--color-bg)]/60 w-32" />
          </div>
          <div className="h-5 rounded bg-[var(--color-bg)]/60 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[3/4] bg-[var(--color-bg)]/60 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-[var(--color-bg)]/60 rounded w-3/4" />
            <div className="h-4 bg-[var(--color-bg)]/60 rounded w-full" />
            <div className="h-4 bg-[var(--color-bg)]/60 rounded w-2/3" />
            <div className="h-10 bg-[var(--color-bg)]/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow animate-fade-in ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--color-text)]">Uitgelichte Outfit</h3>
            <p className="text-[var(--color-text)]/70 text-sm">Perfect voor jouw stijl</p>
          </div>
        </div>
        <NewHintChip />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cursor-pointer group" onClick={handleOutfitClick}>
          <SmartImage
            src={outfit.imageUrl}
            alt={outfit.title}
            id={outfit.id}
            kind="outfit"
            aspect="3/4"
            containerClassName="rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            imgClassName="group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-text)]">
                {outfit.matchPercentage}% Match
              </span>
            </div>

            <h4 className="text-xl font-medium text-[var(--color-text)] mb-3 leading-tight">
              {outfit.title}
            </h4>

            <p className="text-[var(--color-text)]/70 leading-relaxed mb-4">
              {outfit.description}
            </p>

            {outfit.tags && outfit.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {outfit.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            as={Link}
            to="/outfits"
            onClick={handleViewMore}
            variant="primary"
            size="lg"
            className="w-full"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
          >
            Bekijk meer outfits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedOutfitCard;