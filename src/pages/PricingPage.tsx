// src/pages/PricingPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * PricingPage — tokens-first + ff-utilities
 * - Premium pricing cards, AA-contrast, CTA-regels toegepast
 * - Geen globale overrides; alleen opt-in classes
 */

type Plan = {
  id: "starter" | "pro" | "elite";
  title: string;
  tagline: string;
  monthly: number; // in EUR
  yearly: number;  // in EUR p/m
  features: string[];
  ctaLabel: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    title: "Starter",
    tagline: "Probeer rustig uit",
    monthly: 0,
    yearly: 0,
    features: [
      "3 outfits per maand",
      "Basis kleur- & silhouetadvies",
      "Wishlist (beperkt)",
    ],
    ctaLabel: "Start gratis",
  },
  {
    id: "pro",
    title: "Pro",
    tagline: "Voor bewuste keuzes",
    monthly: 12,
    yearly: 9,
    features: [
      "AI Style Scan",
      "10 outfits per maand",
      "Seizoenscapsules & wishlist",
      "Kleur- & silhouetadvies",
      "Shoplinks",
    ],
    ctaLabel: "Ga voor Pro",
    popular: true,
  },
  {
    id: "elite",
    title: "Elite",
    tagline: "Voor stijl maximalisten",
    monthly: 24,
    yearly: 19,
    features: [
      "AI Style Scan (pro+)",
      "Onbeperkte outfits",
      "Seizoenscapsules & wishlist",
      "Kleur- & silhouetadvies",
      "Premium support",
    ],
    ctaLabel: "Ga voor Elite",
  },
];

function Price({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-3xl font-semibold">Gratis</span>;
  }
  return (
    <span className="text-3xl font-semibold">
      €{value}
      <span className="text-sm font-normal text-text/70"> / maand</span>
    </span>
  );
}

function PlanCard({
  plan,
  yearlyBilling,
}: {
  plan: Plan;
  yearlyBilling: boolean;
}) {
  const featured = plan.popular ? " is-featured" : "";
  return (
    <div className={`ff-price-card${featured}`}>
      <div className="ff-price-header">
        <div>
          <div className="ff-price-name">{plan.title}</div>
          <div className="text-text/70">{plan.tagline}</div>
        </div>
        <div className="ff-price-value">
          <Price value={yearlyBilling ? plan.yearly : plan.monthly} />
        </div>
      </div>

      <ul className="ff-feature-list">
        {plan.features.map((f, i) => (
          <li key={i}>
            <span aria-hidden="true" className="ff-badge">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="ff-price-actions">
        <NavLink to="/register" className="ff-btn ff-btn-primary">
          {plan.ctaLabel}
        </NavLink>
        <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">
          Hoe het werkt
        </NavLink>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearlyBilling, setYearlyBilling] = React.useState(true);

  return (
    <main id="main" className="ff-container ff-stack-lg bg-surface text-text">
      <section aria-labelledby="pricing-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <h1 id="pricing-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Prijzen
          </h1>

          {/* Billing toggle (simpel) */}
          <div className="mt-4 cta-row">
            <button
              type="button"
              className="ff-btn ff-btn-secondary"
              aria-pressed={yearlyBilling}
              onClick={() => setYearlyBilling(!yearlyBilling)}
            >
              {yearlyBilling ? "Toon maandprijzen" : "Toon jaarprijzen"}
            </button>
          </div>
        </header>

        <div className="ff-price-grid">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} yearlyBilling={yearlyBilling} />
          ))}
        </div>
      </section>

      {/* Extra CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="cta-row">
          <NavLink to="/register" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">FAQ</NavLink>
        </div>
      </section>
    </main>
  );
}