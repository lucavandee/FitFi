import React from "react";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";
import { NavLink } from "react-router-dom";

export default function ResultsPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-montserrat text-2xl sm:text-3xl">Resultaten</h1>
              <p className="mt-2 text-[var(--color-text)]/80">Jouw recente outfits en inzichten verschijnen hier.</p>
            </div>
            {/* Nieuw: snelle login-hint voor terugkerende gebruikers */}
            <div className="pt-1">
              <NavLink to="/login" className="underline hover:no-underline text-sm text-[var(--color-text)]/80">
                Al een account? Log in
              </NavLink>
            </div>
          </div>
        </header>

        <PremiumUpsellStrip />
      </section>
    </main>
  );
}