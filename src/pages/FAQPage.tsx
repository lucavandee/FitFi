import React from "react";
import PageHero from "@/components/marketing/PageHero";

const FAQS = [
  { q: "Is FitFi echt gratis?", a: "Ja. Je krijgt een persoonlijk stijlprofiel en outfits met shoplinks zonder kosten." },
  { q: "Wat gebeurt er met mijn data?", a: "We werken privacy-first. Alleen wat strikt nodig is voor je advies wordt tijdelijk verwerkt." },
  { q: "Krijg ik direct outfits te zien?", a: "Ja. Na 6 korte vragen tonen we direct meerdere looks, met uitleg en shoplinks." },
  { q: "Komt er Plus?", a: "Ja. Later kun je optioneel upgraden voor extra's als wishlist en updates." },
];

export default function FAQPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-faq"
        eyebrow="FAQ"
        title="Veelgestelde vragen"
        subtitle="Kort en duidelijk. Staat je vraag er niet tussen? Laat het ons weten."
        align="left"
        as="h1"
        size="sm"
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
          {FAQS.map((item, i) => (
            <details key={i} className="border-t border-[var(--color-border)] first:border-t-0 p-4">
              <summary className="cursor-pointer font-heading text-[var(--color-text)]">{item.q}</summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}