import React, { useState } from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import FaqAccordion, { FaqItem } from "@/components/faq/FaqAccordion";
import FaqFilters from "@/components/faq/FaqFilters";
import FaqSearch from "@/components/faq/FaqSearch";
import SkipLink from "@/components/a11y/SkipLink";

const ITEMS: FaqItem[] = [
  {
    q: "Wat is FitFi precies?",
    a: "FitFi is een AI-stylist. We analyseren je stijlvoorkeuren en silhouet en genereren outfits met uitleg en shopbare suggesties.",
    tags: ["algemeen"],
  },
  {
    q: "Hoe snel krijg ik mijn AI Style Report?",
    a: "Binnen 2 minuten. Je doorloopt een korte stijlquiz en ontvangt direct je rapport met concrete outfits.",
    tags: ["algemeen"],
  },
  {
    q: "Is FitFi gratis?",
    a: "Je kunt gratis starten. Voor extra functies zoals onbeperkte outfits en diepgaande analyses kun je upgraden naar Premium.",
    tags: ["prijzen"],
  },
  {
    q: "Hoe gaan jullie om met privacy?",
    a: "We verwerken alleen gegevens die nodig zijn om je outfits te genereren. Je data wordt niet doorverkocht en je kunt altijd verwijderen.",
    tags: ["privacy"],
  },
];

const TAGS = ["algemeen", "prijzen", "privacy"];

const FAQPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Seo
          title="Veelgestelde vragen | FitFi"
          description="Antwoorden over je AI Style Report, privacy en prijzen. Vind snel wat je zoekt."
          canonical="https://fitfi.ai/veelgestelde-vragen"
        />

        <section className="ff-section bg-white">
          <div className="ff-container">
            <header className="section-header">
              <p className="kicker">Help</p>
              <h1 className="section-title">Veelgestelde vragen</h1>
              <p className="section-intro">Zoek of filter op onderwerp.</p>
            </header>

            <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
              <aside className="space-y-6">
                <FaqSearch value={query} onChange={setQuery} />
                <FaqFilters
                  tags={TAGS}
                  selected={selected}
                  onChange={setSelected}
                />
              </aside>

              <div>
                <FaqAccordion items={ITEMS} query={query} selectedTags={selected} />
                <div className="mt-10 text-center">
                  <Button as="a" href="/contact" variant="primary" size="lg">
                    Stel je vraag
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default FAQPage;