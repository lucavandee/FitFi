// /src/pages/EnhancedResultsPage.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  SlidersHorizontal,
  Share2,
  Bookmark,
  BookmarkCheck,
  Info,
  ExternalLink,
} from "lucide-react";

import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";
import Button from "@/components/ui/Button";

// Dummy outfits voor demo-vulling (visueel rijk, maar rustig gepresenteerd)
const DEMO_OUTFITS = [
  {
    id: "smart-italian-01",
    title: "Smart Casual — Italiaans",
    description:
      "Lichte polo met ongestructureerd jasje en tapered chino. Sandaal- of loafer-proof.",
    imageUrl: "/images/fallbacks/default.jpg",
    matchPercentage: 92,
    archetype: "Smart Casual",
    tags: ["Italiaans", "Semi-formeel", "Lente/Zomer"],
  },
  {
    id: "elevated-minimal-02",
    title: "Elevated Minimal",
    description:
      "Monochroom pak in zachte taupe-tint met knitted tee. Clean, subtiel en modern.",
    imageUrl: "/images/fallbacks/default.jpg",
    matchPercentage: 88,
    archetype: "Minimal",
    tags: ["Monochroom", "Business-lite", "Vier seizoenen"],
  },
  {
    id: "street-tailored-03",
    title: "Street × Tailored",
    description:
      "Boxy overshirt met cropped pantalon; sneaker-vriendelijk zonder in te leveren op lijn.",
    imageUrl: "/images/fallbacks/default.jpg",
    matchPercentage: 85,
    archetype: "Street Tailored",
    tags: ["Urban", "Comfort", "Weekend"],
  },
];

const StatChip: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div
    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm shadow-[var(--shadow-soft)]"
    aria-label={typeof label === "string" ? label : undefined}
  >
    <span className="opacity-80">{icon}</span>
    <span className="text-[var(--color-text)]">{label}</span>
  </div>
);

const OutfitCard: React.FC<{
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  matchPercentage: number;
  archetype?: string;
  tags?: string[];
}> = ({ id, title, description, imageUrl, matchPercentage, archetype, tags }) => {
  return (
    <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-[var(--color-text)]">{title}</h3>
          {archetype ? (
            <p className="text-sm text-[var(--color-text)]/70">{archetype}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden">
          <SmartImage
            src={imageUrl}
            alt={title}
            id={id}
            kind="outfit"
            aspect="3/4"
            containerClassName="rounded-2xl"
            imgClassName="transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 480px"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatChip icon={<BookmarkCheck className="w-4 h-4" />} label={`${matchPercentage}% match`} />
              <StatChip icon={<Info className="w-4 h-4" />} label="Waarom dit werkt" />
            </div>
            <p className="text-[var(--color-text)]/80 leading-relaxed mb-4">{description}</p>
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              as={Link}
              to="/outfits"
              variant="primary"
              size="lg"
              icon={<ExternalLink className="w-4 h-4" />}
              iconPosition="right"
            >
              Bekijk vergelijkbare outfits
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<Bookmark className="w-4 h-4" />}
            >
              Bewaar
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<Share2 className="w-4 h-4" />}
            >
              Deel
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

const EnhancedResultsPage: React.FC = () => {
  // Filters en ording (dummy voor visuele polish; geen harde logica nodig in polish-modus)
  const outfits = useMemo(() => DEMO_OUTFITS, []);

  return (
    <main>
      <PageHero
        eyebrow="Jouw resultaten"
        title="Outfits op maat — rustig, clean en premium"
        subtitle="Geïnspireerd door jouw voorkeuren en archetype. Minimalistisch gepresenteerd zodat je blik op stijl en silhouet blijft."
      />

      {/* Filter/acties */}
      <section className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-8">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-[var(--shadow-soft)] mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-[var(--color-text)]">Filters & voorkeuren</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md">Casual</Button>
              <Button variant="secondary" size="md">Smart</Button>
              <Button variant="secondary" size="md">Minimal</Button>
              <Button variant="secondary" size="md">Alle</Button>
            </div>
          </div>
        </div>

        {/* Lijst met outfits */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {outfits.map((o) => (
            <OutfitCard key={o.id} {...o} />
          ))}
        </div>

        {/* Premium upsell */}
        <div className="mt-10 md:mt-12">
          <PremiumUpsellStrip />
        </div>
      </section>
    </main>
  );
};

export default EnhancedResultsPage;