// src/pages/FAQPage.tsx
import React from "react";

/**
 * FAQPage — tokens-first + ff-utilities
 * - <details>/<summary> toegankelijk; ff-accordion styling
 */

type QA = { q: string; a: React.ReactNode };

const QAS: QA[] = [
  { q: "Is FitFi echt gratis te proberen?", a: <>Ja. Met <strong>Starter</strong> kun je gratis starten. Je kunt later upgraden naar Pro of Elite — en op elk moment opzeggen.</> },
  { q: "Wat houdt het AI Style Report in?", a: <>Je krijgt een beknopt, helder overzicht van wat werkt voor jou (silhouet, kleur, materiaal) en waarom.</> },
  { q: "Wat doen jullie met mijn gegevens?", a: <>We minimaliseren data en verkopen niets door. Zie onze privacyverklaring voor details.</> },
  { q: "Kan ik op elk moment opzeggen?", a: <>Ja. Maandabonnementen zijn flexibel — geen gedoe.</> },
  { q: "Werken jullie met affiliate links?", a: <>Soms. Aanbevelingen blijven altijd stijl- en pasvorm-gedreven.</> },
];

export default function FAQPage() {
  return (
    <main id="main" className="ff-container ff-faq ff-stack-lg bg-surface text-text">
      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">Helder en nuchter</p>
          <h1 id="faq-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">Veelgestelde vragen</h1>
          <p className="mt-2 text-text/80">Kort en duidelijk. Staat je vraag er niet bij? Stuur ons een bericht.</p>
        </header>

        <div className="ff-faq">
          {QAS.map((item, i) => (
            <details key={i} className="ff-accordion">
              <summary className="head">
                <span className="title">{item.q}</span>
              </summary>
              <div className="content">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}