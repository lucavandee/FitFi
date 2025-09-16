// src/pages/LandingPage.tsx
import React from "react";
import Hero from "@/components/landing/Hero";
import { CheckCircle } from "lucide-react";
import BrandStrip from "@/components/brand/BrandStrip";
import HowItWorksRail from "@/components/home/HowItWorksRail";

const LandingPage: React.FC = () => {
  return (
    <main>
      <Hero />

      {/* Brand strip */}
      <BrandStrip />
      <section className="section bg-[color:var(--color-bg)]">
      {/* Proof strip */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { v: "97%", l: "tevredenheid na eerste outfits" },
              { v: "2 min", l: "van test naar stijlprofiel" },
              { v: "10+", l: "outfits met uitleg in Pro" },
            ].map((m) => (
              <div key={m.l} className="card interactive-elevate">
                <div className="card__inner">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[color:var(--color-primary)]">{m.v}</div>
                    <div className="text-sm muted mt-1">{m.l}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works rail (swipe) */}
      <HowItWorksRail />

      {/* Waarom het werkt */}
      <section className="section bg-[color:var(--color-bg)]">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="card interactive-elevate">
            <div className="card__inner">
              <h2 className="card__title">Waarom dit werkt</h2>
              <p className="card__text">
                We combineren je silhouet, kleurtemperatuur en stijlvoorkeuren. Per outfit krijg je
                1–2 zinnen uitleg — precies genoeg om zelfverzekerd te kiezen.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Silhouet-vriendelijke fits",
                  "Materialen die vallen zoals jij wilt",
                  "Kleuren die je huid laten spreken",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="subcard interactive-elevate">
            <div className="subcard__inner">
              <h3 className="subcard__title">Seizoen-ready</h3>
              <p className="subcard__kicker">
                Outfits variëren automatisch per seizoen en gelegenheid.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {["Werk", "Weekend", "Diner", "Reizen"].map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      </section>
    </main>
  );
};
export default LandingPage;