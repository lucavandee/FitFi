import React from "react";
import Seo from "@/components/Seo";
import OutfitCard from "@/components/results/OutfitCard";
import Button from "@/components/ui/Button";

/**
 * ResultsPage (premium, editorial)
 * - Toont header met samenvatting van het stijlprofiel
 * - Grid met outfit-cards
 * - Explainability per outfit (1–2 zinnen)
 * - Werkt met echte resultaten als die bestaan; anders een dev-friendly mock
 * - Tokens-first; geen hex in componenten
 */

type Outfit = {
  id: string;
  title: string;
  imageSrc?: string;
  season?: string;
  colorTemp?: string;
  archetype?: string;
  why: string;
};

type ResultsModel = {
  persona: string;              // bijv. "Modern Minimal"
  palette: string;              // bijv. "Koel neutraal"
  body: string;                 // bijv. "Rechthoek"
  outfits: Outfit[];
};

// === MOCK FALLBACK ===
// Gebruik alleen als er geen echte resultaten (SSE/state) beschikbaar zijn.
const USE_MOCK = import.meta.env.VITE_DEV_MOCK_NOVA !== "0";

const mockResults: ResultsModel = {
  persona: "Modern Minimal",
  palette: "Koel neutraal",
  body: "Rechthoek",
  outfits: [
    {
      id: "o1",
      title: "Monochrome city casual",
      imageSrc: "/images/results/o1.jpg", // als dit niet bestaat: toont gewoon een rustige bg
      season: "Herfst/Winter",
      colorTemp: "Koel",
      archetype: "Minimal",
      why:
        "De rechte lijnen en langere laagjes verlengen het silhouet. De koele, gedempte tinten sluiten aan bij je kleurtemperatuur en houden de look coherent.",
    },
    {
      id: "o2",
      title: "Soft tailoring",
      imageSrc: "/images/results/o2.jpg",
      season: "Lente/Herfst",
      colorTemp: "Koel-neutraal",
      archetype: "Modern",
      why:
        "Lichte structuur in de blazer creëert vorm zonder te verzwaren. Neutrale basis maakt combineren simpel en tijdloos.",
    },
    {
      id: "o3",
      title: "Weekend clean",
      imageSrc: "/images/results/o3.jpg",
      season: "Hele jaar",
      colorTemp: "Koel",
      archetype: "Casual-clean",
      why:
        "Minimal layers met subtiel contrast; materialen met zachte handfeel versterken het cleane karakter en passen bij je stijlprofiel.",
    },
  ],
};

// TODO: vervang dit door jullie echte selector/sse-state zodra aanwezig.
function useResultsData(): ResultsModel | null {
  // Voor nu: geen globale store? Val terug op mock indien toegestaan.
  return USE_MOCK ? mockResults : null;
}

const chip =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs border border-[var(--color-border)] " +
  "bg-[var(--color-surface)] text-[var(--color-text)]";

const ResultsPage: React.FC = () => {
  const data = useResultsData();

  return (
    <main className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Jouw AI Style Report — Resultaten | FitFi"
        description="Bekijk je gepersonaliseerde outfits en lees in 1–2 zinnen per look waarom dit past bij jouw silhouet, materialen en kleurtemperatuur."
        canonical="https://www.fitfi.ai/results"
      />

      {/* Header */}
      <section aria-labelledby="report-heading" className="pt-14 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header>
            <h1
              id="report-heading"
              className="font-semibold tracking-tight text-[var(--color-text)]"
              style={{ fontSize: "clamp(2rem, 2.3vw + 1rem, 3rem)", lineHeight: 1.08 }}
            >
              Jouw AI Style Report
            </h1>

            {data ? (
              <>
                <p className="mt-4 text-[var(--color-muted)]">
                  Samenvatting op basis van je antwoorden — klaar om te shoppen of te verfijnen.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={chip}>Persona: {data.persona}</span>
                  <span className={chip}>Palette: {data.palette}</span>
                  <span className={chip}>Silhouet: {data.body}</span>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-[var(--color-muted)]">
                  We genereren je resultaten… Als dit te lang duurt, bekijk dan een voorbeeldrapport.
                </p>
                <div className="mt-5">
                  <Button
                    variant="ghost"
                    onClick={() => (window.location.href = "/results")}
                    aria-label="Bekijk voorbeeldrapport"
                  >
                    Bekijk voorbeeld
                  </Button>
                </div>
              </>
            )}
          </header>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.outfits.map((o) => (
                <OutfitCard
                  key={o.id}
                  title={o.title}
                  imageSrc={o.imageSrc}
                  season={o.season}
                  colorTemp={o.colorTemp}
                  archetype={o.archetype}
                  why={o.why}
                  onShop={() => {
                    // Hier kan jullie bestaande analytics/affiliate redirect in
                    // Bijvoorbeeld: navigate('/shop-redirect?...')
                  }}
                  onSave={() => {
                    // Bewaar in favorieten / profiel (later)
                  }}
                />
              ))}
            </div>
          ) : (
            // Lightweight skeleton — geen extra libs nodig
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] h-[420px]"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;