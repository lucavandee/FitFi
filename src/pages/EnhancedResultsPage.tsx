import React from "react";
import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  Info,
  SlidersHorizontal,
  Share2,
} from "lucide-react";

/**
 * Enhanced Results
 * Premium, rustig en uitlegbaar. Werkt 100% client-only, en degradeert gracieus
 * wanneer live resultaten (SSE) uit staan. Geen externe deps, tokens-first.
 */

// ---- Types
type OutfitItem = {
  name: string;
  brand?: string;
  price?: string; // "€129"
  href?: string;
};

type Outfit = {
  id: string;
  title: string;
  tags: string[];
  rationale: string[];
  items: OutfitItem[];
  imageId?: string; // optioneel voor SmartImage
};

// ---- Mock (kan vervangen worden door live feed)
const MOCK_OUTFITS: Outfit[] = [
  {
    id: "clean-smart-casual",
    title: "Clean smart-casual",
    tags: ["Minimalistisch", "Neutraal", "Slim fit"],
    rationale: [
      "Slanke lijnen verlengen je silhouet.",
      "Neutrale basis kleuren (koud-neutraal) houden het rustig.",
      "Sneakers met subtiele zool voor comfort + modern profiel.",
    ],
    items: [
      { name: "Merino crew knit", brand: "ARKET", price: "€89", href: "#" },
      { name: "Tapered chino", brand: "COS", price: "€99", href: "#" },
      { name: "Minimal sneaker", brand: "Etq", price: "€189", href: "#" },
    ],
  },
  {
    id: "athleisure-uniform",
    title: "Athleisure uniform",
    tags: ["Comfort", "Monochroom", "Relaxed"],
    rationale: [
      "Ton-sur-ton geeft rust en oogt premium.",
      "Relaxed top met strakkere broek: balans in volume.",
      "Technische stof = kreukvrij en travel-proof.",
    ],
    items: [
      { name: "Tech hoodie", brand: "Lululemon", price: "€128", href: "#" },
      { name: "Slim jogger", brand: "Lululemon", price: "€118", href: "#" },
      { name: "Running cap", brand: "Satisfy", price: "€65", href: "#" },
    ],
  },
  {
    id: "weekend-layering",
    title: "Weekend layering",
    tags: ["Casual", "Laagjes", "Koel"],
    rationale: [
      "Shacket voegt structuur toe zonder te stijf te zijn.",
      "Koele denim houdt de look fris.",
      "Laagjes creëren diepte en verhoudingen.",
    ],
    items: [
      { name: "Wool shacket", brand: "Uniqlo U", price: "€79", href: "#" },
      { name: "Heavy tee", brand: "Asket", price: "€45", href: "#" },
      { name: "Straight denim", brand: "Nudie", price: "€149", href: "#" },
    ],
  },
];

// ---- Mini helpers
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-sm text-[var(--color-text)]/80">
      {children}
    </span>
  );
}

function PlaceholderImage() {
  return (
    <div className="aspect-[4/3] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 grid place-items-center">
      <span className="text-[var(--color-text)]/50 text-sm">Afbeelding</span>
    </div>
  );
}

function useLocalWishlist() {
  const [ids, setIds] = React.useState<string[]>(
    () => JSON.parse(localStorage.getItem("ff-wishlist") || "[]") as string[]
  );
  React.useEffect(() => {
    localStorage.setItem("ff-wishlist", JSON.stringify(ids));
  }, [ids]);
  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  return { ids, toggle };
}

function copyToClipboard(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    // ignore
  }
}

// ---- Page
export default function EnhancedResultsPage() {
  const enableSSE = import.meta.env.VITE_NOVA_ENABLE === "1";
  const [loading, setLoading] = React.useState(false);
  const [year, setYear] = React.useState<"all" | "now">("all"); // demofilter
  const { ids: wishlist, toggle } = useLocalWishlist();

  // Simuleer (optioneel) laden
  function refresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  }

  const visibleOutfits = MOCK_OUTFITS.filter(() => true); // plek voor filters
  const fadeGrid = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.12 });

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-results"
        eyebrow="RESULTATEN"
        title="Jouw stijl, zonder ruis"
        subtitle="Outfits met korte uitleg waarom dit werkt — direct toepasbaar, privacy-first."
        align="left"
        as="h1"
        size="sm"
        note={enableSSE ? "Live resultaten ingeschakeld" : "Demoresultaten (SSE uit)"}
        ctas={[
          { label: "Herstart vragenlijst", to: "/", variant: "secondary" },
          { label: "Bekijk prijzen", to: "/prijzen", variant: "secondary" },
        ]}
      />

      {/* Controls */}
      <section className="ff-container pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--color-text)]/70">Filters</span>
          <button
            className={[
              "ff-btn ff-btn-secondary h-8",
              year === "now" && "bg-[color-mix(in oklab,var(--color-primary) 12%,transparent)] border-[var(--color-primary)]",
            ].join(" ")}
            onClick={() => setYear((v) => (v === "now" ? "all" : "now"))}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" aria-hidden /> Seizoen: nu
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="ff-btn ff-btn-secondary h-8" onClick={refresh}>
              Vernieuwen
            </button>
            <button
              className="ff-btn ff-btn-secondary h-8"
              onClick={() => copyToClipboard(location.href)}
              title="Deel deze pagina"
            >
              <Share2 className="h-4 w-4 mr-1" aria-hidden /> Deel
            </button>
          </div>
        </div>
      </section>

      {/* Grid / Skeleton */}
      <section className="ff-container py-6">
        <div
          ref={fadeGrid.ref as any}
          style={{
            opacity: fadeGrid.visible ? 1 : 0,
            transform: fadeGrid.visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ResultCardSkeleton key={i} />)
            : visibleOutfits.map((o) => (
                <ResultCard
                  key={o.id}
                  data={o}
                  saved={wishlist.includes(o.id)}
                  onToggleSave={() => toggle(o.id)}
                />
              ))}
        </div>
      </section>

      {/* Uitleg / belofte */}
      <section className="ff-container pb-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
            <div>
              <h2 className="font-heading text-xl">Waarom dit werkt</h2>
              <p className="mt-2 text-[var(--color-text)]/80">
                We combineren jouw antwoorden met beproefde stijlprincipes (silhouet, kleur, proportie).
                Bij elke look krijg je kort de redenatie — helder, nuchter en toepasbaar.
                Shoplinks kunnen affiliate bevatten; dat verandert het advies niet.{" "}
                <a href="/disclosure" className="underline hover:no-underline">Meer hierover</a>.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</a>
                <a href="/hoe-het-werkt" className="ff-btn ff-btn-quiet">Hoe het werkt</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ---- Cards

function ResultCard({
  data,
  saved,
  onToggleSave,
}: {
  data: Outfit;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { ref, visible } = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.2 });

  return (
    <article
      ref={ref as any}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 600ms ease, transform 600ms ease",
      }}
      className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]"
    >
      {/* Media */}
      {data.imageId ? (
        <SmartImage
          id={data.imageId}
          alt={data.title}
          width={1280}
          height={960}
          className="aspect-[4/3] w-full rounded-[var(--radius-lg)]"
          loading="lazy"
        />
      ) : (
        <PlaceholderImage />
      )}

      {/* Header */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg">{data.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)]"
          aria-pressed={saved}
          aria-label={saved ? "Verwijder uit wishlist" : "Bewaar in wishlist"}
          title={saved ? "Verwijder uit wishlist" : "Bewaar in wishlist"}
        >
          {saved ? <BookmarkCheck className="h-5 w-5" aria-hidden /> : <Bookmark className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* Rationale */}
      <details className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-2">
        <summary className="cursor-pointer inline-flex items-center gap-2">
          <Info className="h-4 w-4" aria-hidden />
          <span className="font-medium">Waarom dit werkt</span>
        </summary>
        <ul className="mt-2 list-disc pl-5 text-[var(--color-text)]/85">
          {data.rationale.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </details>

      {/* Items */}
      <ul className="mt-3 divide-y divide-[var(--color-border)]">
        {data.items.map((it, i) => (
          <li key={i} className="py-2 flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-[var(--color-text)]/70">
                {it.brand ?? "—"} {it.price ? `• ${it.price}` : ""}
              </div>
            </div>
            {it.href && (
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ff-btn ff-btn-secondary h-9 inline-flex items-center gap-1"
              >
                Shop <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

function ResultCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="aspect-[4/3] w-full rounded-[var(--radius-lg)] bg-[var(--color-bg)]/60" />
      <div className="mt-3 h-5 w-2/3 rounded bg-[var(--color-bg)]/60" />
      <div className="mt-2 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-[var(--color-bg)]/60" />
        <div className="h-6 w-16 rounded-full bg-[var(--color-bg)]/60" />
        <div className="h-6 w-24 rounded-full bg-[var(--color-bg)]/60" />
      </div>
      <div className="mt-3 h-24 w-full rounded bg-[var(--color-bg)]/60" />
    </div>
  );
}