import React from "react";
import { Helmet } from 'react-helmet-async';
import PageHero from "@/components/marketing/PageHero";
import { FaqAccordion } from '@/components/faq/FaqAccordion';

const QAS = [
  { q: "Is FitFi echt gratis te proberen?", a: <>Ja. Met <strong>Starter</strong> kun je gratis starten. Later upgraden kan altijd.</> },
  { q: "Wat houdt het AI Style Report in?", a: <>Een helder overzicht van wat werkt voor jou (silhouet, kleur, materiaal) en waarom.</> },
  { q: "Wat doen jullie met mijn gegevens?", a: <>We minimaliseren data en verkopen niets door. Zie de privacyverklaring.</> },
  { q: "Kan ik op elk moment opzeggen?", a: <>Ja. Maandabonnementen zijn flexibel — geen gedoe.</> },
  { q: "Werken jullie met affiliate links?", a: <>Soms. Aanbevelingen blijven altijd stijl- en pasvorm-gedreven.</> }
];

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>Veelgestelde vragen — FitFi</title>
        <link rel="canonical" href="https://fitfi.ai/veelgestelde-vragen" />
      </Helmet>

      <main id="main" className="bg-bg text-text">
        <PageHero
          id="page-faq"
          eyebrow="FAQ"
          title="Veelgestelde vragen"
          subtitle="De snelste weg naar je antwoord."
          align="left"
          as="h1"
          size="sm"
        />

        <div className="ff-container py-10 sm:py-12">
          {QAS.map((item, i) => (
            <details key={i} className="ff-accordion">
              <summary className="head"><span className="title">{item.q}</span></summary>
              <div className="content">{item.a}</div>
            </details>
          ))}

          <div className="cta-row mt-4">
            <a className="ff-btn ff-btn-secondary" href="mailto:support@fitfi.ai">Stel je vraag</a>
          </div>
        </div>
      </main>
    </>
  );
}