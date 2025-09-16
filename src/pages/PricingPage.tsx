import React from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
import SwipeCarousel from "@/components/ui/SwipeCarousel";
import Seo from "@/components/Seo";

const Plan = ({
  title, price, period, features, highlight, badge, cta,
}: {
  title: string; price: string; period: string; features: string[]; highlight?: boolean; badge?: string; cta: string;
}) => (
  <article className={`plan ${highlight ? "plan--hi" : ""} interactive-elevate`} aria-labelledby={`${title}-title`}>
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

const faqRail = [
  { q: "Wat krijg ik gratis?", a: "Korte stijltest, basisprofiel en 3 outfit-richtingen." },
  { q: "Wat zit er in Pro?", a: "Volledig stijlrapport (PDF), seizoensupdates en 10+ outfits met uitleg." },
  { q: "Kan ik upgraden?", a: "Ja, je kunt altijd upgraden of pauzeren." },
  { q: "B2B mogelijkheden?", a: "Integraties, UGC-outfitadvies en priority support." },
];

const PricingPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Prijzen — Eenvoudig en eerlijk"
        description="Gratis starten. Upgrade voor volledige rapporten, outfits en updates."
        canonical="https://www.fitfi.ai/prijzen"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section" aria-labelledby="pricing-title">
          <div className="container">
            <header className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-sm muted mb-3">
                <Sparkles className="w-4 h-4" />
                <span>Prijzen</span>
              </div>
              <h1 id="pricing-title" className="hero__title">Eenvoudige plannen, directe waarde</h1>
              <p className="lead mt-3">Kies wat past bij je doel: ontdekken, verdiepen of opschalen. Je kunt altijd upgraden.</p>
            </header>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Plan
                title="Gratis" price="€0" period="altijd"
                features={["Stijltest","Basisprofiel","3 outfit-richtingen"]}
                cta="/registreren"
              />
              <Plan
                title="Pro" price="€9" period="maand"
                features={["Volledig AI Style Report (PDF)","10+ outfits met uitleg","Seizoensupdates","Wishlist & feed"]}
                highlight badge="Meest gekozen" cta="/registreren"
              />
              <Plan
                title="Business" price="Op aanvraag" period="—"
                features={["Alles in Pro","Team/UGC outfitadvies","Merk/affiliate integratie","Priority support"]}
                badge="B2B" cta="/contact"
              />
            </div>

            <section className="mt-12" aria-labelledby="pricing-faq-title">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 muted" aria-hidden="true" />
                <h2 id="pricing-faq-title" className="card__title">Veelgestelde vragen</h2>
              </div>
              <SwipeCarousel ariaLabel="Prijzen FAQ carrousel">
                {faqRail.map((f) => (
                  <article key={f.q} className="subcard">
                    <div className="subcard__inner">
                      <h3 className="subcard__title">{f.q}</h3>
                      <p className="subcard__kicker">{f.a}</p>
                    </div>
                  </article>
                ))}
              </SwipeCarousel>
            </section>

            <p className="text-xs muted mt-6">
              Alle prijzen incl. btw. Affiliate/partnerlinks worden transparant vermeld zodra actief.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default PricingPage;