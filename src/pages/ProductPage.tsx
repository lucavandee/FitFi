// src/pages/ProductPage.tsx
import React from "react";
import { Sparkles, Layers, Wand2, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

/**
 * Product/Features — premium look in lijn met de homepage:
 * - Heldere hero met CTA's (ff-btn)
 * - Feature cards (ff-card)
 * - Proof & geruststelling (privacy)
 */
export default function ProductPage() {
  return (
    <main id="main" className="bg-bg text-text">
      {/* Hero */}
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Voor wie minder wil twijfelen</p>
          <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Outfits die kloppen — elke dag
          </h1>
          <p className="text-text/80 max-w-2xl">
            FitFi vertaalt jouw smaak naar outfits per gelegenheid. Duidelijk, rustig en toepasbaar — zonder pushy verkoop.
          </p>
          <div className="cta-row">
            <NavLink to="/quiz" className="ff-btn ff-btn-primary">
              <Sparkles className="w-4 h-4" />
              <span className="ml-2">Start gratis</span>
            </NavLink>
            <NavLink to="/hoe-het-werks" className="ff-btn ff-btn-secondary">
              Hoe het werkt
            </NavLink>
          </div>
        </header>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <article className="ff-card p-5">
            <Wand2 className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">AI Style Scan</h2>
            <p className="text-text/80">
              In 6 vragen: jouw kleur- en silhouetprofiel, vertaald naar combinaties.
            </p>
          </article>
          <article className="ff-card p-5">
            <Layers className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">Capsules & outfits</h2>
            <p className="text-text/80">
              Per seizoen, werk/weekend/diner. Minder items, meer opties.
            </p>
          </article>
          <article className="ff-card p-5">
            <ShieldCheck className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">Privacy-by-default</h2>
            <p className="text-text/80">
              We minimaliseren data en verkopen niets door. Jij houdt regie.
            </p>
          </article>
        </div>

        {/* Proof strip */}
        <div className="ff-glass p-4 md:p-5 mt-4">
          <p className="text-text/80">
            "Eindelijk rust in keuzes — ik koop minder en draag meer." — ⭐️⭐️⭐️⭐️⭐️
          </p>
        </div>
      </section>
    </main>
  );
}