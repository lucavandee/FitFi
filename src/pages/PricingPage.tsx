import React from "react";
import Seo from "@/components/Seo";
import SkipLink from "@/components/a11y/SkipLink";

const tiers = [
  {
    name: "Gratis",
    price: "€0",
    features: [
      "AI Style Rapport (basis)",
      "3 outfits per scan",
      "Shop the look links",
    ],
    cta: "Start gratis",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Pro",
    price: "€9 /maand",
    features: [
      "Uitgebreid rapport met kleuren & silhouet",
      "10 outfits per scan",
      "Wishlist + seizoensupdates",
      "Prioriteit support",
    ],
    cta: "Upgrade naar Pro",
    href: "/onboarding",
    popular: true,
  },
  {
    name: "Team",
    price: "Custom",
    features: [
      "Whitelabel onboarding",
      "Styling voor events of merken",
      "API + integraties",
      "Dedicated support",
    ],
    cta: "Neem contact op",
    href: "/contact",
    popular: false,
  },
];

const PricingPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
        <Seo
          title="Prijzen — Ontdek het plan dat bij jou past | FitFi"
          description="Kies tussen Gratis, Pro of Team. Toegankelijke styling voor iedereen, van individueel tot professioneel."
          canonical="https://fitfi.ai/prijzen"
        />

        {/* HERO */}
        <section className="hero-wrap">
          <div className="ff-container text-center flow-sm">
            <p className="kicker">Prijzen</p>
            <h1 className="display-title">Eenvoudig & transparant</h1>
            <p className="lead">Start gratis. Upgrade wanneer je wilt.</p>
          </div>
        </section>

        {/* TIERS */}
        <section className="ff-section">
          <div className="ff-container grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`pricing-card card-hover flow-sm ${
                  tier.popular ? "pricing-card--popular" : ""
                }`}
              >
                <header className="flow-sm">
                  <h2 className="ff-h4">{tier.name}</h2>
                  <p className="pricing-price">{tier.price}</p>
                </header>
                <ul className="flow-sm" role="list">
                  {tier.features.map((f) => (
                    <li key={f} className="ff-body text-[var(--color-muted)]">
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={tier.href} className="btn btn-primary mt-auto">
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ff-section bg-[var(--color-surface)] text-center">
          <div className="ff-container flow-sm">
            <h2 className="section-title">Twijfel je nog?</h2>
            <p className="section-intro">
              Probeer gratis. Je kunt later altijd upgraden.
            </p>
            <a href="/onboarding" className="btn btn-primary">
              Start gratis
            </a>
          </div>
        </section>
      </main>
    </>
  );
};

export default PricingPage;