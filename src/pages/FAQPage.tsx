import React from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: "Wat is FitFi precies?",
    a: "FitFi is een AI-stylist. We analyseren je stijlvoorkeuren en silhouet en genereren outfits met uitleg en shopbare suggesties."
  },
  {
    q: "Hoe snel krijg ik mijn AI Style Report?",
    a: "Binnen 2 minuten. Je doorloopt een korte stijlquiz en ontvangt direct je rapport met concrete outfits."
  },
  {
    q: "Is FitFi gratis?",
    a: "Je kunt gratis starten. Voor extra functies zoals onbeperkte outfits en diepgaande analyses kun je upgraden naar Premium."
  },
  {
    q: "Hoe gaan jullie om met privacy?",
    a: "We verwerken alleen de gegevens die nodig zijn om je outfits te genereren. Zie de Privacyverklaring voor details."
  },
  {
    q: "Kan ik outfits personaliseren op seizoen of gelegenheid?",
    a: "Ja. Je kunt filters instellen (seizoen, gelegenheid) en wij houden rekening met kleurtemperatuur, materiaal en archetype."
  }
];

const FAQPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <>
      <Seo title="Veelgestelde vragen — FitFi" description="Antwoorden op de meest gestelde vragen over FitFi en je AI-stijlrapport." />
      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="ff-heading text-[color:var(--color-text)] text-3xl sm:text-4xl font-extrabold text-center">Veelgestelde vragen</h1>
          <p className="text-[color:var(--color-muted)] text-center mt-3">
            Staat je vraag er niet bij? Neem gerust contact op via het formulier.
          </p>

          <div className="mt-8 space-y-3">
            {ITEMS.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <div key={idx} className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)]">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] rounded-[var(--radius-lg)]"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : idx)}
                  >
                    <span className="text-[color:var(--color-text)] font-medium">{item.q}</span>
                    <span className="text-[color:var(--color-muted)]" aria-hidden="true">{isOpen ? "–" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-[color:var(--color-text)]">{item.a}</p>
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
    </>
  );
};

export default FAQPage;