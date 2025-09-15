// src/pages/PricingPage.tsx
import React from "react";
import { Check, Sparkles } from "lucide-react";

type Feature = { label: string };

const featuresStarter: Feature[] = [
  { label: "AI-stijltest" },
  { label: "Basis stijlprofiel" },
  { label: "3 outfit-richtingen" },
];

const featuresPro: Feature[] = [
  { label: "Alles in Starter" },
  { label: "Volledig stijlrapport (PDF)" },
  { label: "Seizoen-updates" },
  { label: "10+ outfits met uitleg" },
];

const featuresBusiness: Feature[] = [
  { label: "Alles in Pro" },
  { label: "Team/UGC outfitadvies" },
  { label: "Merk/affiliate integratie" },
  { label: "Priority support" },
];

const PriceCard: React.FC<{
  title: string;
  price: string;
  period: string;
  features: Feature[];
  highlighted?: boolean;
  badge?: string;
  ctaHref: string;
}> = ({ title, price, period, features, highlighted, badge, ctaHref }) => {
  return (
    <article
      className={`plan-card ${highlighted ? "plan-card--highlight" : ""}`}
      aria-labelledby={`${title}-title`}
    >
      <div className="plan-inner">
        <header className="flex items-start justify-between">
          <div>
            <h3 id={`${title}-title`} className="plan-title">
              {title}
            </h3>
            <div className="mt-1 text-sm text-[color:var(--color-muted)]">
              {highlighted ? "Meest gekozen" : "\u00A0"}
            </div>
          </div>
          {badge ? <span className="chip chip-accent">{badge}</span> : null}
        </header>

        <div className="mt-5">
          <div className="flex items-end gap-2">
            <span className="plan-price">{price}</span>
            <span className="text-sm text-[color:var(--color-muted)]">
              / {period}
            </span>
          </div>
        </div>

        <ul className="mt-6 space-y-2">
          {features.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[color:var(--color-success)]" />
              <span>{f.label}</span>
            </li>
          ))}
        </ul>

        <a href={ctaHref} className="btn btn-primary w-full mt-6" aria-label={`Start ${title}`}>
          Start {title.toLowerCase()}
        </a>
      </div>
    </article>
  );
};

const PricingPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        aria-labelledby="pricing-title"
      >
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Prijzen</span>
          </div>
          <h1
            id="pricing-title"
            className="font-heading text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.02em]"
          >
            Eenvoudige plannen, directe waarde
          </h1>
          <p className="mt-4 text-[color:var(--color-muted)]">
            Kies wat past bij je doel: ontdekken, verdiepen of opschalen. Je kunt
            altijd upgraden.
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PriceCard
            title="Starter"
            price="€0"
            period="eenmalig"
            features={featuresStarter}
            ctaHref="/dynamic-onboarding"
            badge="Probeer gratis"
          />

          <PriceCard
            title="Pro"
            price="€29"
            period="maand"
            features={featuresPro}
            ctaHref="/dynamic-onboarding"
            highlighted
            badge="Meest gekozen"
          />

          <PriceCard
            title="Business"
            price="Op aanvraag"
            period="—"
            features={featuresBusiness}
            ctaHref="/contact"
            badge="B2B"
          />
        </div>

        <p className="text-xs text-[color:var(--color-muted)] mt-6">
          Alle prijzen incl. btw. Affiliate/partnerlinks worden transparant
          vermeld zodra actief.
        </p>
      </section>
    </main>
  );
};

export default PricingPage;