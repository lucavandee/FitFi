import React from "react";

const QAS = [
  { q: "Is FitFi echt gratis te proberen?", a: <>Ja. Met <strong>Starter</strong> kun je gratis starten. Later upgraden kan altijd.</> },
  { q: "Wat houdt het AI Style Report in?", a: <>Een helder overzicht van wat werkt voor jou (silhouet, kleur, materiaal) en waarom.</> },
  { q: "Wat doen jullie met mijn gegevens?", a: <>We minimaliseren data en verkopen niets door. Zie de privacyverklaring.</> },
  { q: "Kan ik op elk moment opzeggen?", a: <>Ja. Maandabonnementen zijn flexibel — geen gedoe.</> },
  { q: "Werken jullie met affiliate links?", a: <>Soms. Aanbevelingen blijven altijd stijl- en pasvorm-gedreven.</> }
];

export default function FAQPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Helder en nuchter</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Veelgestelde vragen</h1>
          <p className="text-text/80">Kort en duidelijk. Staat je vraag er niet bij? Stuur ons een bericht.</p>
        </header>

        <div className="ff-faq">
          {QAS.map((item, i) => (
            <details key={i} className="ff-accordion">
              <summary className="head"><span className="title">{item.q}</span></summary>
              <div className="content">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="cta-row mt-4">
          <a className="ff-btn ff-btn-secondary" href="mailto:support@fitfi.ai">Stel je vraag</a>
        </div>
      </section>
    </main>
  );
}