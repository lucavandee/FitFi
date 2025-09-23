// src/pages/ResultsPage.tsx
import React from "react";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";

export default function ResultsPage() {
  return (
    <main id="main" className="bg-surface text-text">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl">Resultaten</h1>
          <p className="mt-2 text-text/80">Jouw recente outfits en inzichten verschijnen hier.</p>
        </header>

      <PremiumUpsellStrip />

      </section>
    </main>
  );
}