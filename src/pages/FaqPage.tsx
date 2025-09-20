import React, { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import FaqSearch from "@/components/faq/FaqSearch";
import FaqAccordion, { FaqItem } from "@/components/faq/FaqAccordion";
import FaqFilters from "@/components/faq/FaqFilters";

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is het echt gratis?",
    a: "Ja. Je start met een gratis AI Style Report. Upgraden kan later — volledig optioneel.",
    tags: ["Algemeen", "Prijs"],
  },
  {
    q: "Heb ik een account of creditcard nodig?",
    a: "Nee. Je kunt zonder account en zonder creditcard starten en je rapport bekijken.",
    tags: ["Algemeen", "Account"],
  },
  {
    q: "Werkt het ook zonder foto?",
    a: "Ja. Een foto is optioneel. Je krijgt nog steeds een stijlprofiel met outfits en shoplinks.",
    tags: ["Rapport", "Privacy"],
  },
  {
    q: "Wat gebeurt er met mijn data?",
    a: "We verzamelen alleen wat nodig is voor jouw advies en we delen geen persoonsgegevens met derden.",
    tags: ["Privacy"],
  },
  {
    q: "Hoe snel krijg ik mijn rapport?",
    a: "Binnen 1–2 minuten. We houden de flow kort, helder en zonder ruis.",
    tags: ["Rapport", "Snelheid"],
  },
  {
    q: "Kan ik outfits direct shoppen?",
    a: "Ja. We tonen outfits met slimme shoplinks, afgestemd op jouw silhouet en kleurtemperatuur.",
    tags: ["Outfits", "Shoplinks"],
  },
];

const FaqPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    FAQ_ITEMS.forEach((i) => (i.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "nl"));
  }, []);

  const toggle = (t: string) =>
    setSelected((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const clear = () => setSelected([]);

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="FAQ — Antwoorden zonder ruis | FitFi"
        description="Korte, heldere antwoorden over het AI Style Report, privacy en werken zonder foto. Vind snel wat je zoekt."
        canonical="https://fitfi.ai/faq"
      />

      <section className="ff-section" aria-labelledby="faq-title">
        <div className="ff-container">
          <header className="section-header">
            <p className="kicker">FAQ</p>
            <h1 id="faq-title" className="section-title">Veelgestelde vragen</h1>
            <p className="section-intro">
              Filter op onderwerp of gebruik het zoekveld om direct het juiste antwoord te vinden.
            </p>
          </header>

          {/* Chips-filter */}
          <div className="mb-4">
            <FaqFilters tags={tags} selected={selected} onToggle={toggle} onClear={clear} />
          </div>

          {/* Zoekveld */}
          <div className="mb-6">
            <FaqSearch query={query} onChange={setQuery} />
          </div>

          {/* Accordion (filter + search) */}
          <FaqAccordion items={FAQ_ITEMS} query={query} selectedTags={selected} />
        </div>
      </section>
    </main>
  );
};

export default FaqPage;