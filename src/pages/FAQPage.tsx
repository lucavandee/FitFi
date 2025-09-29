import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

const QA = [
  { q: "Is FitFi echt gratis te proberen?", a: "Ja. Met Starter kun je gratis starten. Later upgraden kan altijd." },
  { q: "Wat is het AI Style Report?", a: "Een helder overzicht van wat werkt voor jou (silhouet, kleur, materiaal) en waarom." },
  { q: "Wat doen jullie met mijn gegevens?", a: "We minimaliseren data en verkopen niets door. Zie onze privacyverklaring." },
  { q: "Kan ik op elk moment opzeggen?", a: "Ja. Maandabonnementen zijn flexibel — geen gedoe." },
  { q: "Werken jullie met affiliate links?", a: "Soms. Aanbevelingen blijven altijd stijl- en pasvormgedreven." }
];

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>Veelgestelde vragen — FitFi</title>
        <link rel="canonical" href="https://fitfi.ai/veelgestelde-vragen" />
      </Helmet>

      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageHero
          id="page-faq"
          eyebrow="FAQ"
          title="Veelgestelde vragen"
          subtitle="De snelste weg naar je antwoord."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Stel je vraag", to: "/contact", variant: "primary", "data-event": "cta_faq_contact" },
            { label: "Start gratis", to: "/results", variant: "secondary", "data-event": "cta_faq_start" }
          ]}
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid gap-3">
            {QA.map((item, i) => (
              <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}