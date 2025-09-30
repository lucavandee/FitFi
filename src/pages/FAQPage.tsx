import React from "react";

const faqs = [
  { q: "Is FitFi echt gratis?", a: "Ja. Je krijgt een persoonlijk stijlprofiel en outfits met shoplinks zonder kosten." },
  { q: "Wat gebeurt er met mijn data?", a: "We werken privacy-first. Alleen wat strikt nodig is voor je advies wordt tijdelijk verwerkt." },
  { q: "Krijg ik direct outfits te zien?", a: "Ja. Na 6 korte vragen tonen we direct meerdere looks, met uitleg en shoplinks." },
];

export default function FAQPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)]">
      <section className="ff-container px-4 md:px-6 ff-page-hero">
        <span className="ff-eyebrow">FAQ</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Veelgestelde vragen</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Kort en duidelijk. Staat je vraag er niet tussen? Laat het ons weten.
        </p>
      </section>

      <section className="ff-container px-4 md:px-6 ff-section">
        <div className="divide-y divide-[var(--color-border)] ff-card">
          {faqs.map((item, idx) => (
            <details key={idx} className="group open:bg-[var(--color-surface)]">
              <summary
                className="list-none cursor-pointer px-4 md:px-5 py-4 flex items-center justify-between gap-4"
                aria-controls={`faq-${idx}`}
              >
                <span className="font-medium text-[var(--color-text)]">{item.q}</span>
                <span className="inline-block transition-transform group-open:rotate-45" aria-hidden>＋</span>
              </summary>
              <div id={`faq-${idx}`} className="px-4 md:px-5 pb-5 text-[var(--color-muted)]">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}