// src/pages/FAQPage.tsx
import React from "react";

/**
 * FAQPage — tokens-first + ff-utilities
 * - Micro-interactie: draaiende chevron via group-open, subtiele ff-fade-in op content.
 * - <details>/<summary> blijven toegankelijk; geen externe deps.
 */

type QA = { q: string; a: React.ReactNode };

const QAS: QA[] = [
  { q: "Is FitFi echt gratis te proberen?", a: <>Ja. Met <strong>Starter</strong> begin je direct gratis. Voor meer outfits en functies kies je Pro of Elite — je kunt op elk moment downgraden of annuleren.</> },
  { q: "Wat houdt het AI Style Report in?", a: <>Je ontvangt een persoonlijk stijlprofiel met outfitvoorstellen (per plan), inclusief uitleg <em>waarom</em> het werkt (silhouet, kleur, materiaal) en shoplinks.</> },
  { q: "Wat doen jullie met mijn gegevens?", a: <>We zijn <strong>privacy-first</strong>. Je antwoorden gebruiken we alleen om jouw stijl te personaliseren. Geen doorverkoop. Zie ook onze privacyverklaring.</> },
  { q: "Kan ik op elk moment opzeggen?", a: <>Ja. Maandabonnementen kun je maandelijks opzeggen. Jaarabonnementen lopen tot het einde van de periode en verlengen niet zonder jouw bevestiging.</> },
  { q: "Werken jullie met affiliate links?", a: <>Soms. We linken alleen naar betrouwbare shops. Aanbevelingen blijven altijd stijl- en pasvorm-gedreven.</> },
];

export default function FAQPage() {
  return (
    <main id="main" className="bg-surface text-text">
      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">Helder en nuchter</p>
          <h1 id="faq-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Veelgestelde vragen
          </h1>
          <p className="mt-2 text-text/80">
            Staat je vraag er niet tussen? Bekijk eerst onze uitlegpagina.
          </p>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {QAS.map(({ q, a }) => (
            <details key={q} className="group ff-card p-4">
              <summary className="cursor-pointer font-medium select-none flex items-center justify-between">
                <span>{q}</span>
                <svg className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.06l3.71-2.83a.75.75 0 0 1 .92 1.18l-4.2 3.2a.75.75 0 0 1-.92 0l-4.2-3.2a.75.75 0 0 1-.02-1.06z" />
                </svg>
              </summary>
              <div className="mt-2 text-sm text-text/80 ff-fade-in">{a}</div>
            </details>
          ))}
        </div>

        <aside className="mt-8 ff-glass p-4 sm:p-5">
          <p className="font-heading text-lg">Nog vragen?</p>
          <p className="text-sm text-text/80">Bekijk ook onze uitlegpagina — we helpen je graag verder.</p>
          <div className="mt-3 flex gap-2">
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary h-10">Hoe het werkt</a>
            <a href="/over-ons" className="ff-btn ff-btn-primary h-10">Over ons</a>
          </div>
        </aside>
      </section>
    </main>
  );
}