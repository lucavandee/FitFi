import React from "react";

type QA = { q: string; a: string; };
const FAQS: QA[] = [
  { q: "Is FitFi echt gratis?", a: "Ja. Je krijgt een persoonlijk stijlprofiel en outfits met shoplinks zonder kosten." },
  { q: "Wat gebeurt er met mijn data?", a: "We werken privacy-first. We verwerken tijdelijk wat strikt nodig is om je te adviseren en bewaren niets onnodigs." },
  { q: "Krijg ik direct outfits te zien?", a: "Ja. Na 6 korte vragen tonen we direct meerdere looks, inclusief uitleg en shoplinks." },
  { q: "Kan ik later upgraden?", a: "Ja. Plus-functies worden later geactiveerd. Tot die tijd blijft de gratis ervaring volledig bruikbaar." },
];

export default function FAQPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">FAQ</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Veelgestelde vragen</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Kort en duidelijk. Staat je vraag er niet tussen? Laat het ons weten.
        </p>
      </section>

      <section className="ff-container ff-section">
        <div className="ff-accordion">
          {FAQS.map((item, i) => (
            <details key={i} className="ff-accordion">
              <summary className="row">
                <span className="font-medium">{item.q}</span>
              </summary>
              <div className="content">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}