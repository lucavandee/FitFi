import React from "react";
import { Check, Minus, Crown, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export type PlanId = "free" | "pro" | "premium";

const iconFor = (id: PlanId) => (id === "premium" ? Crown : id === "pro" ? Sparkles : Check);
const accentTone = (id: PlanId) => (id === "premium" ? "badge-premium" : id === "pro" ? "badge-pro" : "badge-neutral");

const PricingCard: React.FC<{
  id: PlanId;
  title: string;
  price: number;                    // actuele prijs obv billing
  baseMonthly: number;              // basisprijs per maand (voor 'was'-prijs)
  billing: "monthly" | "yearly";
  bullets: string[];
  ctaLabel: string;
  featured?: boolean;
  subtext?: string;
  saveBadge?: string;               // bij yearly: "Bespaar 20%"
}> = ({ id, title, price, baseMonthly, billing, bullets, ctaLabel, featured = false, subtext, saveBadge }) => {
  const Icon = iconFor(id);
  const isFree = price === 0;

  const showWas = billing === "yearly" && baseMonthly > 0;

  return (
    <article className={`pricing-card ${featured ? "is-featured" : ""}`}>
      <header className="pricing-head">
        <div className="pricing-badges cluster">
          {subtext ? <span className={`badge ${accentTone(id)}`}>{subtext}</span> : null}
          {saveBadge ? <span className="badge save-badge">{saveBadge}</span> : null}
        </div>

        <div className="pricing-title-row">
          <Icon size={18} className="text-[var(--color-text)]" aria-hidden />
          <h3 className="pricing-title">{title}</h3>
        </div>

        <div className="pricing-price">
          {isFree ? (
            <span className="price-free">€0</span>
          ) : (
            <>
              {showWas ? <span className="price-was">€{baseMonthly}</span> : null}
              <span className="price-currency">€</span>
              <span className="price-amount">{price}</span>
              <span className="price-period">/{billing === "monthly" ? "mnd" : "jr"}</span>
            </>
          )}
        </div>
      </header>

      <ul className="pricing-benefits" aria-label={`Wat zit er in ${title}`}>
        {bullets.map((b) => (
          <li key={b} className="benefit-row">
            <Check size={16} className="benefit-icon ok" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
        <li className="benefit-row dim">
          <Minus size={16} className="benefit-icon" aria-hidden />
          <span>Rustige, maandelijkse upgrades</span>
        </li>
      </ul>

      <div className="pricing-cta">
        <Button
          variant={featured ? "primary" : "ghost"}
          size="lg"
          className={featured ? "w-full cta-raise" : "w-full"}
          onClick={() => (window.location.href = "/onboarding")}
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
};

export default PricingCard;