import React from "react";
import { NavLink } from "react-router-dom";

type Plan = {
  id: "starter" | "pro" | "elite";
  title: string; tagline: string;
  monthly: number; yearly: number;
  features: string[]; ctaLabel: string; popular?: boolean;
};

const PLANS: Plan[] = [
  { id: "starter", title: "Starter", tagline: "Probeer rustig uit", monthly: 0, yearly: 0,
    features: ["3 outfits per maand", "Basis kleur- & silhouetadvies", "Wishlist (beperkt)"], ctaLabel: "Start gratis" },
  { id: "pro", title: "Pro", tagline: "Voor bewuste keuzes", monthly: 12, yearly: 9, popular: true,
    features: ["AI Style Scan", "10 outfits per maand", "Seizoenscapsules & wishlist", "Kleur- & silhouetadvies", "Shoplinks"], ctaLabel: "Ga voor Pro" },
  { id: "elite", title: "Elite", tagline: "Voor stijl maximalisten", monthly: 24, yearly: 19,
    features: ["AI Style Scan (pro+)", "Onbeperkte outfits", "Seizoenscapsules & wishlist", "Kleur- & silhouetadvies", "Premium support"], ctaLabel: "Ga voor Elite" }
];

function Price({ value }: { value: number }) {
  return value === 0
    ? <span className="text-3xl font-semibold">Gratis</span>
    : <span className="text-3xl font-semibold">€{value}<span className="text-sm font-normal text-text/70"> / maand</span></span>;
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean; }) {
  return (
    <div className={`ff-price-card${plan.popular ? " is-featured" : ""}`}>
      <div className="ff-price-header">
        <div>
          <div className="ff-price-name">{plan.title}</div>
          <div className="text-text/70">{plan.tagline}</div>
        </div>
        <div className="ff-price-value"><Price value={yearly ? plan.yearly : plan.monthly} /></div>
      </div>
      <ul className="ff-feature-list">
        {plan.features.map((f, i) => (
          <li key={i}><span className="ff-badge">✓</span><span>{f}</span></li>
        ))}
      </ul>
      <div className="ff-price-actions">
        <NavLink to="/register" className="ff-btn ff-btn-primary">{plan.ctaLabel}</NavLink>
        <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <main id="main" className="ff-scope bg-bg text-text">
      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        <header className="ff-stack">
          <h1 className="font-heading text-2xl sm:text-3xl">Prijzen</h1>
          <div className="ff-pill-switch" role="group" aria-label="Prijsperiode">
            <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>Jaar</button>
            <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>Maand</button>
          </div>
        </header>

        <div className="ff-price-grid">
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} yearly={yearly} />)}
        </div>
      </section>

      <section className="ff-container">
        <div className="cta-row">
          <NavLink to="/register" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">FAQ</NavLink>
        </div>
      </section>
    </main>
  );
}