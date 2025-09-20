import React, { useState } from "react";
import Seo from "@/components/Seo";
import FaqSearch from "@/components/faq/FaqSearch";
import FaqAccordion, { FaqItem } from "@/components/faq/FaqAccordion";

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is het echt gratis?",
    a: "Ja. Je start met een gratis AI Style Report. Upgraden kan later — volledig optioneel.",
  },
  {
    q: "Heb ik een account of creditcard nodig?",
    a: "Nee. Je kunt zonder account en zonder creditcard starten en je rapport bekijken.",
  },
  {
    q: "Werkt het ook zonder foto?",
    a: "Ja. Een foto is optioneel. Je krijgt nog steeds een stijlprofiel met outfits en shoplinks.",
  },
  {
    q: "Wat gebeurt er met mijn data?",
    a: "We verzamelen alleen wat nodig is voor jouw advies en we delen geen persoonsgegevens met derden.",
  },
  {
    q: "Hoe snel krijg ik mijn rapport?",
    a: "Binnen 1–2 minuten. We houden de flow kort, helder en zonder ruis.",
  },
  {
    q: "Kan ik outfits direct shoppen?",
    a: "Ja. We tonen outfits met slimme shoplinks, afgestemd op jouw silhouet en kleurtemperatuur.",
  },
];

const FaqPage: React.FC = () => {
  const [query, setQuery] = useState("");

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="FAQ — Antwoorden zonder ruis | FitFi"
        description="Korte, heldere antwoorden over het AI Style Report, privacy en werken zonder foto. Vind snel wat je zoekt."
        canonical="https://fitfi.ai/faq"
      />

      <section className="ff-section" aria-labelledby="faq-title">
        <div className="ff-container">
          {/* Consistente editorial header */}
          <header className="section-header">
            <p className="kicker">FAQ</p>
            <h1 id="faq-title" className="section-title">Veelgestelde vragen</h1>
            <p className="section-intro">
              Kort en helder. Gebruik het zoekveld om direct het juiste antwoord te vinden.
            </p>
          </header>

          {/* Zoekveld */}
          <div className="mb-6">
            <FaqSearch query={query} onChange={setQuery} />
          </div>

          {/* Accordion-lijst (met filter) */}
          <FaqAccordion items={FAQ_ITEMS} query={query} />
        </div>
      </section>
    </main>
  );
};

export default FaqPage;