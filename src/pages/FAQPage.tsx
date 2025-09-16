import React from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import ErrorBoundary from "@/components/ErrorBoundary";

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  { q: "Wat is FitFi precies?", a: "FitFi is een AI-stylist. We analyseren je stijlvoorkeuren en silhouet en genereren outfits met uitleg en shopbare suggesties." },
  { q: "Hoe snel krijg ik mijn AI Style Report?", a: "Binnen 2 minuten. Je doorloopt een korte stijlquiz en ontvangt direct je rapport met concrete outfits." },
  { q: "Is FitFi gratis?", a: "Je kunt gratis starten. Voor extra functies zoals onbeperkte outfits en diepgaande analyses kun je upgraden naar Pro." },
  { q: "Hoe gaan jullie om met privacy?", a: "We verwerken alleen de gegevens die nodig zijn om je outfits te genereren. Zie de Privacyverklaring voor details." },
  { q: "Kan ik outfits personaliseren op seizoen of gelegenheid?", a: "Ja. Je kunt filters instellen (seizoen, gelegenheid) en wij houden rekening met kleurtemperatuur, materiaal en archetype." },
  { q: "Wat zit er in het Pro-abonnement?", a: "Pro geeft je toegang tot onbeperkte outfits, seizoensupdates, PDF-rapporten en prioriteit support." },
  { q: "Kan ik mijn abonnement opzeggen?", a: "Ja, je kunt altijd opzeggen. Je behoudt toegang tot je content tot het einde van je betaalperiode." },
  { q: "Werkt FitFi ook voor mannen?", a: "Momenteel richten we ons op vrouwenmode. Mannenmode staat op onze roadmap voor 2025." }
];

const FAQPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <ErrorBoundary>
      <Seo 
        title="Veelgestelde vragen — FitFi" 
        description="Antwoorden op de meest gestelde vragen over FitFi en je AI-stijlrapport." 
        canonical="https://www.fitfi.ai/veelgestelde-vragen" 
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section">
          <div className="container max-w-3xl">
            <header className="text-center">
              <h1 className="hero__title">Veelgestelde vragen</h1>
              <p className="lead mt-3">Staat je vraag er niet bij? Neem gerust contact op via het formulier.</p>
            </header>

            <div className="mt-8 space-y-3" role="region" aria-label="Veelgestelde vragen">
              {ITEMS.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <div key={idx} className="card">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] rounded-[var(--radius-lg)]"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      onClick={() => setOpen(isOpen ? null : idx)}
                    >
                      <span className="font-medium">{item.q}</span>
                      <span className="text-[color:var(--color-muted)] text-xl" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div id={`faq-answer-${idx}`} className="px-4 pb-4">
                        <p className="text-[color:var(--color-muted)]">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Button as="a" href="/contact" variant="primary" size="lg">
                Stel je vraag
              </Button>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default FAQPage;