// src/pages/FAQPage.tsx
import React from "react";

/**
 * FAQPage — tokens-first + ff-utilities
 * - Compact, snel scanbaar, AA-contrast.
 * - <details>/<summary> voor toegankelijke accordeons.
 * - Geen externe imports, default export.
 */

type QA = { q: string; a: React.ReactNode };

const QAS: QA[] = [
  {
    q: "Is FitFi echt gratis te proberen?",
    a: (
      <>
        Ja. Met <strong>Starter</strong> begin je direct gratis. Wil je meer outfits en functies,
        kies dan voor Pro of Elite — je kunt op elk moment downgraden of annuleren.
      </>
    ),
  },
  {
    q: "Wat houdt het AI Style Report in?",
    a: (
      <>
        Je ontvangt een persoonlijk stijlprofiel met 3–10 outfitvoorstellen (per plan),
        inclusief uitleg <em>waarom</em> het werkt (silhouet, kleur, materiaal) en shoplinks.
      </>
    ),
  },
  {
    q: "Wat doen jullie met mijn gegevens?",
    a: (
      <>
        We zijn <strong>privacy-first</strong>. Je antwoorden worden uitsluitend gebruikt om jouw
        stijl te personaliseren. Geen doorverkoop. Meer in onze privacyverklaring.
      </>
    ),
  },
  {
    q: "Kan ik op elk moment opzeggen?",
    a: (
      <>
        Ja. Maandabonnementen zijn maandelijks opzegbaar. Jaarabonnementen lopen tot het einde van
        de periode; we verlengen niet zonder bevestiging.
      </>
    ),
  },
  {
    q: "Werken jullie met affiliate links?",
    a: (
      <>
        Ja, soms. We linken alleen naar betrouwbare shops. Dit beïnvloedt onze aanbevelingen niet:
        stijl & pasvorm gaan altijd voor.
      </>
    ),
  },
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
            Staat je vraag er niet tussen? Stuur ons gerust een bericht via het contactformulier.
          </p>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {QAS.map(({ q, a }) => (
            <details key={q} className="ff-card p-4">
              <summary className="cursor-pointer font-medium select-none">{q}</summary>
              <div className="mt-2 text-sm text-text/80">{a}</div>
            </details>
          ))}
        </div>

        <aside className="mt-8 ff-glass p-4 sm:p-5">
          <p className="font-heading text-lg">Nog vragen?</p>
          <p className="text-sm text-text/80">
            Bekijk ook onze uitlegpagina of neem contact met ons op — we helpen je graag verder.
          </p>
          <div className="mt-3 flex gap-2">
            <a href="/how-it-works" className="ff-btn ff-btn-secondary h-10">Hoe het werkt</a>
            <a href="/contact" className="ff-btn ff-btn-primary h-10">Contact</a>
          </div>
        </aside>
      </section>
    </main>
  );
}