// src/pages/PricingPage.tsx
import React from "react";
import { Check, Sparkles } from "lucide-react";

const Plan = ({
  title, price, period, features, highlight, badge, cta,
}: {
  title: string; price: string; period: string; features: string[]; highlight?: boolean; badge?: string; cta: string;
}) => (
  <article className={`plan ${highlight ? "plan--hi" : ""}`} aria-labelledby={`${title}-title`}>
    <div className="plan__inner">
      <header className="flex items-start justify-between">
        <div>
          <h3 id={`${title}-title`} className="plan__title">{title}</h3>
          <div className="mt-1 text-sm muted">{highlight ? "Meest gekozen" : "\u00A0"}</div>
        </div>
        {badge ? <span className="chip chip--accent">{badge}</span> : null}
      </header>

      <div className="mt-5 flex items-end gap-2">
        <span className="plan__price">{price}</span>
        <span className="text-sm muted">/ {period}</span>
      </div>

      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[color:var(--color-success)]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a href={cta} className="btn btn-primary btn-full mt-6" aria-label={`Start ${title}`}>
        Start {title.toLowerCase()}
      </a>
    </div>
  </article>
);

const PricingPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section className="section" aria-labelledby="pricing-title">
        <div className="container">
          <header className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm muted mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Prijzen</span>
            </div>
            <h1 id="pricing-title" className="hero__title text-[clamp(2rem,5vw,3rem)]">
              Eenvoudige plannen, directe waarde
            </h1>
            <p className="lead mt-3">Kies wat past bij je doel: ontdekken, verdiepen of opschalen. Je kunt altijd upgraden.</p>
          </header>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Plan
              title="Starter" price="€0" period="eenmalig"
              features={["AI-stijltest","Basis stijlprofiel","3 outfit-richtingen"]}
              badge="Probeer gratis" cta="/dynamic-onboarding"
            />
            <Plan
              title="Pro" price="€29" period="maand"
              features={["Alles in Starter","Volledig stijlrapport (PDF)","Seizoen-updates","10+ outfits met uitleg"]}
              highlight badge="Meest gekozen" cta="/dynamic-onboarding"
            />
            <Plan
              title="Business" price="Op aanvraag" period="—"
              features={["Alles in Pro","Team/UGC outfitadvies","Merk/affiliate integratie","Priority support"]}
              badge="B2B" cta="/contact"
            />
          </div>

          <p className="text-xs muted mt-6">
            Alle prijzen incl. btw. Affiliate/partnerlinks worden transparant vermeld zodra actief.
          </p>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;