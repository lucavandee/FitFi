import React from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";

export type PlanId = "free" | "pro" | "premium";

type Props = {
  id: PlanId;
  title: string;
  price: number;
  billing: "monthly" | "yearly";
  ctaLabel: string;
  bullets: string[];
  subtext?: string;
  featured?: boolean;
};

const PricingCard: React.FC<Props> = ({
  id,
  title,
  price,
  billing,
  ctaLabel,
  bullets,
  subtext,
  featured = false,
}) => {
  const handleCTA = () => {
    // In productie: navigate naar checkout/onboarding met plan-id
    console.log(`Selected plan: ${id}`);
  };

  return (
    <article className={`pricing-card ${featured ? "featured" : ""}`}>
      {featured && (
        <div className="featured-badge">
          Meest populair
        </div>
      )}

      <header className="pricing-header">
        <h3 className="plan-title">{title}</h3>
        {subtext && (
          <p className="plan-subtext">{subtext}</p>
        )}
        
        <div className="price-display">
          <span className="price-amount">
            €{price}
          </span>
          {price > 0 && (
            <span className="price-period">
              /{billing === "monthly" ? "maand" : "jaar"}
            </span>
          )}
        </div>
      </header>

      <div className="pricing-body">
        <ul className="benefits-list" aria-label={`Voordelen van ${title} plan`}>
          {bullets.map((bullet, i) => (
            <li key={i} className="benefit-item">
              <Check size={16} className="benefit-check" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={featured ? "primary" : "ghost"}
          size="lg"
          className="w-full cta-raise"
          onClick={handleCTA}
          aria-label={`${ctaLabel} - ${title} plan selecteren`}
        >
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
};

export default PricingCard;