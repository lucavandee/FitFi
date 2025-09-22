import React from "react";
import Seo from "@/components/Seo";

const tiers = [
  {
    id: "free",
    name: "Gratis",
    price: "€0",
    period: "",
    cta: { href: "/onboarding", label: "Start gratis" },
    features: [
      "AI Style Report (basis)",
      "3 outfits met shoplinks",
      "Opslaan & delen",
    ],
    accent: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "€9",
    period: "per maand",
    cta: { href: "/onboarding", label: "Probeer Plus" },
    features: [
      "Volledig AI Style Report",
      "9 outfits + alternatieven",
      "Kleur- & silhouetadvies",
      "Voorstel per gelegenheid",
    ],
    accent: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "€19",
    period: "per maand",
    cta: { href: "/onboarding", label: "Kies Pro" },
    features: [
      "Alles van Plus",
      "Seizoenscapsules & combinaties",
      "Persoonlijke voorkeuren (fine-tune)",
      "Early access nieuwe features",
    ],
    accent: false,
  },
];

const PricingPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Prijzen — Kies je plan | FitFi"
        description="Kies het FitFi-plan dat past bij jouw stijl: Gratis, Plus of Pro. Upgrade wanneer je wilt."
        canonical="https://fitfi.ai/prijzen"
      />

      <section className="ff-section bg-white">
        <div className="ff-container">
          <header className="max-w-3xl">
            <h1 className="ff-h1">Prijzen</h1>
            <p className="ff-lead text-[var(--color-muted)]">
              Begin gratis. Upgrade wanneer jij meer detail of outfits wilt.
            </p>
          </header>

          <div
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
            role="list"
            aria-label="Abonnementen"
          >
            {tiers.map((t) => (
              <article
                key={t.id}
                className={`ff-card ${t.accent ? "ff-card--accent" : ""}`}
                aria-label={`Plan ${t.name}`}
              >
                <div className="ff-card__inner">
                  <h2 className="ff-h3">{t.name}</h2>
                  <p className="mt-2 ff-price">
                    <span className="ff-price__value">{t.price}</span>{" "}
                    <span className="ff-price__period">{t.period}</span>
                  </p>
                  <ul className="ff-list mt-4">
                    {t.features.map((f) => (
                      <li key={f} className="ff-list__item">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    className={`btn ${t.accent ? "btn-cta" : "btn-ghost"} mt-6`}
                    href={t.cta.href}
                    aria-label={t.cta.label}
                  >
                    {t.cta.label}
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* FAQ-teaser */}
          <div className="ff-rail mt-12">
            <div className="ff-rail__left">
              <p className="ff-body text-[var(--color-muted)]">
                Vragen over betalingen, upgrades of opzeggen?
              </p>
            </div>
            <div className="ff-rail__right">
              <a href="/faq" className="ff-link">
                Bekijk de veelgestelde vragen
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingPage;