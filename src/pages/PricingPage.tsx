import React from "react";
import Seo from "@/components/Seo";
import PlanToggle from "@/components/pricing/PlanToggle";
import PricingCard, { PlanId } from "@/components/pricing/PricingCard";
import FaqTeaser from "@/components/pricing/FaqTeaser";

type Billing = "monthly" | "yearly";

const PricingPage: React.FC = () => {
  const [billing, setBilling] = React.useState<Billing>("monthly");

  // Basistarieven (maandelijks) — voorbeeldprijzen.
  const baseMonthly = (plan: PlanId) =>
    plan === "free" ? 0 : plan === "pro" ? 14 : 29;

  // Afgeleide prijs op basis van billing.
  const price = (plan: PlanId) => {
    const base = baseMonthly(plan);
    if (base === 0) return 0;
    return billing === "monthly" ? base : Math.round(base * 0.8);
  };

  const yearlySave = billing === "yearly";

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Prijzen — kies je FitFi plan | FitFi"
        description="Start gratis met je AI Style Report. Upgrade naar Pro of Premium voor wekelijkse updates, capsules en shoplinks. Jaarlijks = 20% korting."
        canonical="https://fitfi.ai/pricing"
        ogImage="/images/social/pricing-og.jpg"
      />

      {/* Intro + Toggle */}
      <section className="ff-section ff-container">
        <header className="flow-lg max-w-3xl">
          <h1 className="section-title">Prijzen</h1>
          <p className="text-[var(--color-muted)]">
            Start gratis. Upgrade wanneer je klaar bent voor meer: wekelijkse stijlupdates en extra tools om slimmer te shoppen.
          </p>

          <div className="cluster">
            <PlanToggle
              value={billing}
              onChange={(v) => setBilling(v)}
              note="Jaarlijks = 20% korting"
            />
          </div>
        </header>

        {/* Cards */}
        <div className="pricing-grid mt-10">
          <PricingCard
            id="free"
            title="Gratis"
            price={price("free")}
            baseMonthly={baseMonthly("free")}
            billing={billing}
            ctaLabel="Start gratis"
            bullets={[
              "AI Style Report",
              "3 voorbeeld-outfits",
              "Basis advies (silhouet + kleurtemp)",
            ]}
            subtext="Voor een snelle start"
          />

          <PricingCard
            id="pro"
            title="Pro"
            featured
            saveBadge={yearlySave ? "Bespaar 20%" : undefined}
            price={price("pro")}
            baseMonthly={baseMonthly("pro")}
            billing={billing}
            ctaLabel="Kies Pro"
            bullets={[
              "Volledig rapport + wekelijkse updates",
              "10+ outfits met shop-links",
              "Kleurenpalet + capsule opbouw",
            ]}
            subtext="Meest gekozen"
          />

          <PricingCard
            id="premium"
            title="Premium"
            saveBadge={yearlySave ? "Bespaar 20%" : undefined}
            price={price("premium")}
            baseMonthly={baseMonthly("premium")}
            billing={billing}
            ctaLabel="Ga Premium"
            bullets={[
              "Uitgebreide garderobe-adviezen",
              "Seizoens-capsules + prioriteitenlijst",
              "Early access nieuwe features",
            ]}
            subtext="Voor power users"
          />
        </div>

        {/* Reassurance rail */}
        <div className="cluster mt-6">
          <span className="badge badge-neutral">Geen verborgen kosten</span>
          <span className="badge badge-neutral">Opzeggen wanneer je wilt</span>
          <span className="badge badge-neutral">Privacy-first</span>
        </div>

        <p className="price-footnote text-[var(--color-muted)] mt-3">
          Prijzen zijn indicatief en inclusief btw. Kortingen worden verrekend bij jaarlijkse betaling.
        </p>
      </section>

      {/* FAQ teaser */}
      <section className="ff-section alt-bg">
        <div className="ff-container">
          <FaqTeaser />
        </div>
      </section>
    </main>
  );
};

export default PricingPage;