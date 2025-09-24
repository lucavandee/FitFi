import React from "react";
import { NavLink } from "react-router-dom";
import { Check } from "lucide-react";

type Plan = {
  id: "starter" | "pro" | "elite";
  title: string;
  tagline: string;
  monthly: number;
  yearly: number;
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
      "Wishlist (beperkt)"
    ],
    ctaLabel: "Start gratis"
  },
  {
    id: "pro",
    title: "Pro",
    tagline: "Voor bewuste keuzes",
    monthly: 12,
    yearly: 9,
    popular: true,
    features: [
      "AI Style Scan",
      "10 outfits per maand",
      "Seizoenscapsules & wishlist",
      "Kleur- & silhouetadvies",
      "Shoplinks"
    ],
    ctaLabel: "Ga voor Pro"
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
      "Premium support"
    ],
    ctaLabel: "Ga voor Elite"
  }
];

function PriceDisplay({ value }: { value: number }) {
  return value === 0 ? (
    <span className="ff-price-value">Gratis</span>
  ) : (
    <span className="ff-price-value">
      €{value}
      <span className="text-sm font-normal text-text/70"> / maand</span>
    </span>
  );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  return (
    <div className={`ff-price-card${plan.popular ? " is-featured" : ""}`}>
      <div className="ff-price-header">
        <div>
          <div className="ff-price-name">{plan.title}</div>
          <div className="text-text/70 text-sm">{plan.tagline}</div>
        </div>
        <PriceDisplay value={yearly ? plan.yearly : plan.monthly} />
      </div>
      
      <ul className="ff-feature-list">
        {plan.features.map((feature, index) => (
          <li key={index}>
            <span className="ff-badge">
              <Check className="w-3 h-3" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="ff-price-actions">
        <NavLink to="/register" className="ff-btn ff-btn-primary w-full">
          {plan.ctaLabel}
        </NavLink>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Transparant en eerlijk</p>
          <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Prijzen
          </h1>
          <p className="text-text/80 max-w-2xl">
            Begin gratis, upgrade wanneer je wilt. Geen verrassingen.
          </p>
          <div className="cta-row">
            <button 
              type="button" 
              className="ff-btn ff-btn-secondary" 
              aria-pressed={yearly}
              onClick={() => setYearly(!yearly)}
            >
              {yearly ? "Toon maandprijzen" : "Toon jaarprijzen"}
            </button>
          </div>
        </header>

        <div className="ff-price-grid">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} yearly={yearly} />
          ))}
        </div>

        <div className="cta-row justify-center">
          <NavLink to="/quiz" className="ff-btn ff-btn-primary">
            Start gratis
          </NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">
            FAQ
          </NavLink>
        </div>
      </section>
    </main>
  );
}