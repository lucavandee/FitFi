import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import OutfitCard from "@/components/results/OutfitCard";
import OutfitSkeleton from "@/components/results/OutfitSkeleton";
import Button from "@/components/ui/Button";

export type Outfit = {
  id: string;
  title: string;
  season: "lente" | "zomer" | "herfst" | "winter";
  colorTemp: "koel" | "neutraal" | "warm";
  archetype: "minimal" | "sportief" | "klassiek" | "creatief";
  explanation: string;      // 1–2 zinnen waarom dit past
  items: string[];          // high-level items in de outfit
  imageId?: string;         // SmartImage id (optioneel; valt terug op Generic)
  priceHint?: string;       // optioneel
};

const sampleOutfits: Outfit[] = [
  {
    id: "look-01",
    title: "Clean minimal — smart casual",
    season: "lente",
    colorTemp: "neutraal",
    archetype: "minimal",
    explanation:
      "Strakke lijnen en mattere stoffen benadrukken je rechte schouders. Neutrale tinten houden het geheel rustig én veelzijdig.",
    items: ["Wollen overshirt", "Merino crewneck", "Slim chino", "Minimal sneaker"],
    imageId: "outfit-minimal-1",
    priceHint: "€€",
  },
  {
    id: "look-02",
    title: "Sportief modern — laagjes",
    season: "herfst",
    colorTemp: "koel",
    archetype: "sportief",
    explanation:
      "Technische laagjes leggen de nadruk op een V-silhouet zonder bulk. Koele blauwtinten matchen je kleurtemperatuur.",
    items: ["Softshell jas", "Dryknit hoodie", "Tapered jogger", "Retro runner"],
    imageId: "outfit-sport-1",
    priceHint: "€–€€",
  },
  {
    id: "look-03",
    title: "Klassiek met structuur",
    season: "winter",
    colorTemp: "warm",
    archetype: "klassiek",
    explanation:
      "Warme camel-tinten en textuur (flanel, suède) voegen diepte toe en flatteren je huidtint — formeel én comfortabel.",
    items: ["Flanellen blazer", "Oxford shirt", "Wollen pantalon", "Suède loafer"],
    imageId: "outfit-classic-1",
    priceHint: "€€€",
  },
];

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450); // gesimuleerd; in prod via fetch/react-query
    return () => clearTimeout(t);
  }, []);

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Jouw AI Style Report — outfits die werken | FitFi"
        description="Bekijk je gepersonaliseerde outfits met uitleg waarom ze werken voor je silhouet en kleurtemperatuur. Shop slimmer met FitFi."
        canonical="https://fitfi.ai/results"
        preloadImages={[]}
        ogImage="/images/social/results-og.jpg"
      />

      <section className="ff-section ff-container">
        <header className="flow-lg">
          <h1 className="section-title">Jouw outfits</h1>
          <p className="text-[var(--color-muted)] max-w-prose">
            Dit is een voorbeeldrapport. Elk look-advies bevat 1–2 zinnen waarom het past bij je silhouet, materialen
            en kleurtemperatuur — helder, zonder ruis.
          </p>

          <div className="cluster gap-2">
            <span className="badge badge-soft">Seizoen: all-year</span>
            <span className="badge badge-soft">Kleurtemperatuur: neutraal</span>
            <span className="badge badge-soft">Archetype: modern minimal</span>
          </div>
        </header>

        {/* Grid */}
        <div className="results-grid mt-8" role="list">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <OutfitSkeleton key={i} />)
            : sampleOutfits.map((o) => (
                <OutfitCard
                  key={o.id}
                  outfit={o}
                  onShop={() => navigate("/onboarding")}
                  onViewItems={() => navigate("/onboarding")}
                />
              ))}
        </div>

        <div className="mt-10 cluster">
          <Button variant="primary" size="lg" onClick={() => navigate("/onboarding")}>
            Start gratis — maak mijn echte rapport
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate("/hoe-het-werkt")}>
            Hoe het werkt
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;