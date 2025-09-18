import React from "react";
import Seo from "@/components/Seo";
import PlanToggle from "@/components/pricing/PlanToggle";
import PricingCard, { PlanId } from "@/components/pricing/PricingCard";
import FaqTeaser from "@/components/pricing/FaqTeaser";

type Billing = "monthly" | "yearly";

const PricingPage: React.FC = () => {
  const [billing, setBilling] = React.useState<Billing>("monthly");

  // Prijzen (voorbeeld). Yearly krijgt -20%.
  const price = (plan: PlanId) => {
    const base =
      plan === "free" ? 0 :
      plan === "pro" ? 14 :
      29; // premium
    if (plan === "free") return 0;
    return billing === "monthly" ? base : Math.round(base * 0.8);
  };

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Prijzen — kies je FitFi plan | FitFi"
        description="Kies het plan dat bij je past: gratis AI Style Report, Pro met wekelijkse updates of Premium met extra functies. Altijd tokens-first, privacy-first."
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
            price={price("pro")}
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
            price={price("premium")}
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