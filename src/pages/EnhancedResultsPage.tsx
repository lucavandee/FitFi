// /src/pages/EnhancedResultsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  SlidersHorizontal,
  Share2,
  Bookmark,
  BookmarkCheck,
  Info,
  ExternalLink,
  List as ListIcon,
  Grid3X3 as GridIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";
import Button from "@/components/ui/Button";

type Filter = "Alle" | "Casual" | "Smart" | "Minimal";
type ViewMode = "list" | "grid";

const DEMO_OUTFITS = [
  {
    id: "smart-italian-01",
    title: "Smart Casual — Italiaans",
    description:
      "Lichte polo met ongestructureerd jasje en tapered chino. Sandaal- of loafer-proof.",
    imageUrl: "/images/fallbacks/default.jpg",
    matchPercentage: 92,
    archetype: "Smart",
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
    archetype: "Casual",
    tags: ["Urban", "Comfort", "Weekend"],
  },
];

const StatChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div
    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm shadow-[var(--shadow-soft)]"
    aria-label={typeof label === "string" ? label : undefined}
  >
    <span className="opacity-80">{icon}</span>
    <span className="text-[var(--color-text)]">{label}</span>
  </div>
);

const ExplainList: React.FC<{ id: string; title: string; archetype?: string; isOpen: boolean }> = ({
  id,
  title,
  archetype,
  isOpen,
}) => {
  // Uitlegpunten (generiek, licht afgestemd op archetype)
  const points = useMemo(() => {
    const base = [
      { k: "Silhouet", v: "Bovenstuk iets ruimer, onderstuk tapered: heldere V-vorm en schone lijn." },
      { k: "Kleur", v: "Rustige taupe/monochroom basis — materiaal en fit krijgen de hoofdrol." },
      { k: "Schoen", v: "Loafer of minimal sneaker houdt het geheel licht en modern." },
      { k: "Fit", v: "Ongestructureerd jasje/overshirt geeft beweging zonder bulk." },
      { k: "Kapsel", v: "Netjes met lichte textuur; voorkomt conflict met kraag/schouderlijn." },
    ];
    if (archetype === "Smart") base[2].v = "Loafer/derby in glad leer voor een verfijnde finish.";
    if (archetype === "Minimal") base[1].v = "Monochroom palet versterkt minimalistische esthetiek.";
    if (archetype === "Casual") base[3].v = "Relaxte top + tapered broek: comfort zonder vorm te verliezen.";
    return base;
  }, [archetype]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={`exp-${id}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
          aria-live="polite"
        >
          <ul className="mt-3 grid gap-2 text-sm">
            {points.map((p) => (
              <li key={p.k} className="flex gap-2">
                <span className="min-w-20 text-[var(--color-text)]/70">{p.k}</span>
                <span className="text-[var(--color-text)]">{p.v}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const OutfitCard: React.FC<{
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  matchPercentage: number;
  archetype?: string;
  tags?: string[];
  view: ViewMode;
}> = ({ id, title, description, imageUrl, matchPercentage, archetype, tags, view }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-[var(--color-text)]">{title}</h3>
          {archetype ? <p className="text-sm text-[var(--color-text)]/70">{archetype}</p> : null}
        </div>
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
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

            <p className="text-[var(--color-text)]/80 leading-relaxed mb-3">{description}</p>

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

            {/* Explainability toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition-colors"
                aria-expanded={open}
                aria-controls={`explain-${id}`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">{open ? "Verberg uitleg" : "Toon uitleg"}</span>
              </button>
              <div id={`explain-${id}`}>
                <ExplainList id={id} title={title} archetype={archetype} isOpen={open} />
              </div>
            </div>
          </div>

          {/* CTA's */}
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
            <Button variant="secondary" size="lg" icon={<Bookmark className="w-4 h-4" />}>
              Bewaar
            </Button>
            <Button variant="secondary" size="lg" icon={<Share2 className="w-4 h-4" />}>
              Deel
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const EnhancedResultsPage: React.FC = () => {
  // Filters en weergave (persist in localStorage)
  const [filter, setFilter] = useState<Filter>(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("ff_results_filter") : null;
    return (saved as Filter) || "Alle";
  });

  const [view, setView] = useState<ViewMode>(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("ff_results_view") : null;
    return (saved as ViewMode) || "list";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("ff_results_filter", filter);
    } catch {}
  }, [filter]);

  useEffect(() => {
    try {
      window.localStorage.setItem("ff_results_view", view);
    } catch {}
  }, [view]);

  const outfits = useMemo(() => DEMO_OUTFITS, []);
  const filtered = useMemo(() => {
    if (filter === "Alle") return outfits;
    return outfits.filter((o) => (o.archetype || "").toLowerCase() === filter.toLowerCase());
  }, [outfits, filter]);

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
              {(["Casual", "Smart", "Minimal", "Alle"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  variant="secondary"
                  size="md"
                  className={f === filter ? "ring-2 ring-[var(--color-primary)]" : ""}
                  onClick={() => setFilter(f)}
                  aria-pressed={f === filter}
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                className={view === "list" ? "ring-2 ring-[var(--color-primary)]" : ""}
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                icon={<ListIcon className="w-4 h-4" />}
              >
                Lijst
              </Button>
              <Button
                variant="secondary"
                size="md"
                className={view === "grid" ? "ring-2 ring-[var(--color-primary)]" : ""}
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                icon={<GridIcon className="w-4 h-4" />}
              >
                Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Lijst met outfits */}
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8" : "grid grid-cols-1 gap-6 md:gap-8"}>
          <AnimatePresence initial={false}>
            {filtered.map((o) => (
              <OutfitCard key={o.id} {...o} view={view} />
            ))}
          </AnimatePresence>
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