// /src/pages/EnhancedResultsPage.tsx
import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Sparkles, SlidersHorizontal, Share2, Bookmark, BookmarkCheck, Info, ExternalLink, List as ListIcon, Grid3x3 as GridIcon, ShoppingBag, ImageDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import ResultsQuizGate from "@/components/results/ResultsQuizGate";
import FoundersWall from "@/components/results/FoundersWall";
import { generateOutfitShareImage } from "@/utils/shareImage";

// LCP: lazy-load niet-kritische strip
const PremiumUpsellStrip = lazy(() => import("@/components/results/PremiumUpsellStrip"));

type Filter = "Alle" | "Casual" | "Smart" | "Minimal";
type ViewMode = "list" | "grid";

type DemoOutfit = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  matchPercentage: number;
  archetype: "Casual" | "Smart" | "Minimal";
  tags: string[];
};

const DEMO_OUTFITS: DemoOutfit[] = [
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

const NewHintChip: React.FC = () => (
  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] text-xs font-medium">
    <Sparkles className="w-3.5 h-3.5" />
    Nieuw: waarom dit werkt
  </span>
);

const ExplainList: React.FC<{ id: string; archetype?: string; isOpen: boolean }> = ({
  id,
  archetype,
  isOpen,
}) => {
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

/** Voorbereiding Shop-de-look (zonder echte deeplinks) */
type ShopItem = { part: string; productId?: string };
const buildDeeplink = (_productId?: string): string | null => {
  return null; // disabled tot we echte data/tagging hebben
};

const ShopTheLookStrip: React.FC<{ outfit: DemoOutfit }> = ({ outfit }) => {
  const items: ShopItem[] = [
    { part: outfit.archetype === "Smart" ? "Jasje" : "Overshirt" },
    { part: outfit.archetype === "Minimal" ? "Knitted tee" : "Polo" },
    { part: "Pantalon / Chino" },
    { part: outfit.archetype === "Smart" ? "Loafer" : "Minimal sneaker" },
  ];
  const links = items.map((it) => ({ ...it, href: buildDeeplink(it.productId) }));
  return (
    <div className="mt-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <ShoppingBag className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="font-medium text-[var(--color-text)]">Shop de look</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {links.map((l, idx) => {
          const disabled = !l.href;
          return (
            <div
              key={`${l.part}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <span className="text-sm text-[var(--color-text)]">{l.part}</span>
              <a
                href={l.href ?? "#"}
                aria-disabled={disabled}
                onClick={(e) => disabled && e.preventDefault()}
                className={`text-sm underline ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                Shop
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OutfitCard: React.FC<{
  outfit: DemoOutfit;
  view: ViewMode;
  index: number;
}> = ({ outfit, view, index }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [downloading, setDownloading] = useState(false);

  const onShare = async () => {
    try {
      setDownloading(true);
      const dataUrl = await generateOutfitShareImage({
        title: outfit.title,
        match: outfit.matchPercentage,
        archetype: outfit.archetype,
        imageUrl: outfit.imageUrl,
        pageUrl: typeof window !== "undefined" ? window.location.origin + "/results" : "https://fitfi.ai/results",
      });
      // Native share indien beschikbaar
      if (navigator.share && dataUrl) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "fitfi-outfit.png", { type: "image/png" });
        await navigator.share({
          title: "Mijn FitFi outfit",
          text: `${outfit.title} — ${outfit.matchPercentage}% match`,
          files: [file],
        });
      } else if (dataUrl) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "fitfi-outfit.png";
        a.click();
      }
    } catch {
      // stil falen; UI blijft rustig
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-[var(--color-text)]">{outfit.title}</h3>
            <p className="text-sm text-[var(--color-text)]/70">{outfit.archetype}</p>
          </div>
        </div>
        <NewHintChip />
      </div>

      <div className={view === "grid" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        <div className="rounded-2xl overflow-hidden">
          {/* LCP: eerste kaart is vaak in viewport; geef hem voorrang door eager te laden indien SmartImage dit doorzet */}
          <SmartImage
            src={outfit.imageUrl}
            alt={outfit.title}
            id={outfit.id}
            kind="outfit"
            aspect="3/4"
            containerClassName="rounded-2xl"
            imgClassName="transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 480px"
            // @ts-expect-error: indien SmartImage passthrough toepast gaan deze mee naar <img>; anders genegeerd (non-breaking)
            loading={index === 0 ? "eager" : undefined}
            // @ts-expect-error
            fetchpriority={index === 0 ? "high" : undefined}
            // @ts-expect-error
            decoding={index === 0 ? "sync" : undefined}
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatChip icon={<BookmarkCheck className="w-4 h-4" />} label={`${outfit.matchPercentage}% match`} />
              <StatChip icon={<Info className="w-4 h-4" />} label="Waarom dit werkt" />
            </div>

            <p className="text-[var(--color-text)]/80 leading-relaxed mb-3">{outfit.description}</p>

            {outfit.tags && outfit.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {outfit.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Explainability */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition-colors"
                aria-expanded={open}
                aria-controls={`explain-${outfit.id}`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">{open ? "Verberg uitleg" : "Toon uitleg"}</span>
              </button>
              <div id={`explain-${outfit.id}`}>
                <ExplainList id={outfit.id} archetype={outfit.archetype} isOpen={open} />
              </div>
            </div>

            {/* Shop de look — disabled tot deeplinks live zijn */}
            <ShopTheLookStrip outfit={outfit} />
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
            <Button
              variant="secondary"
              size="lg"
              icon={<Share2 className="w-4 h-4" />}
              onClick={onShare}
              disabled={downloading}
            >
              {downloading ? "Genereren…" : "Deel kaart"}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const EnhancedResultsPage: React.FC = () => {
  // Persistente voorkeuren (filter + weergave)
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

  // Quiz Gate v2 (client-side, opt-in via flag)
  const quizEnabled = (import.meta as any).env?.VITE_QUIZ_GATE === "on";
  const [quizOpen, setQuizOpen] = useState<boolean>(() => {
    if (!quizEnabled) return false;
    try {
      return !window.localStorage.getItem("ff_quiz_done");
    } catch {
      return false;
    }
  });

  // Founders-Wall e-mailcapture (flag optioneel, standaard aan)
  const foundersEnabled = (import.meta as any).env?.VITE_FOUNDERS_WALL !== "off";

  return (
    <main>
      <PageHero
        eyebrow="Jouw resultaten"
        title="Outfits op maat — rustig, clean en premium"
        subtitle="Geïnspireerd door jouw voorkeuren en archetype. Minimalistisch gepresenteerd zodat je blik op stijl en silhouet blijft."
      />

      <section className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-8">
        {/* Toolbar: Filters & view */}
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
              <Button
                variant="secondary"
                size="md"
                icon={<ImageDown className="w-4 h-4" />}
                as="a"
                href="#share-help"
              >
                Delen
              </Button>
            </div>
          </div>
        </div>

        {/* Result cards + Founders Wall */}
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8" : "grid grid-cols-1 gap-6 md:gap-8"}>
          <AnimatePresence initial={false}>
            {filtered.map((o, i) => (
              <React.Fragment key={o.id}>
                <OutfitCard outfit={o} view={view} index={i} />
                {foundersEnabled && i === 2 && (
                  <FoundersWall key="founders-wall" />
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>

        {/* Premium upsell — lazy voor betere LCP */}
        <div className="mt-10 md:mt-12">
          <Suspense fallback={<div className="h-24 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />}>
            <PremiumUpsellStrip />
          </Suspense>
        </div>

        {/* Deel-instructie anker (visueel subtiel) */}
        <div id="share-help" className="sr-only">Gebruik "Deel kaart" op een outfit om een deelbare afbeelding te maken.</div>
      </section>

      {/* Quiz Gate v2 */}
      {quizOpen && quizEnabled && (
        <ResultsQuizGate
          onClose={() => {
            setQuizOpen(false);
            try {
              window.localStorage.setItem("ff_quiz_done", "1");
            } catch {}
          }}
        />
      )}
    </main>
  );
};

export default EnhancedResultsPage;