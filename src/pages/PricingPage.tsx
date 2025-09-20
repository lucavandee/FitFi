import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import PricingHero from "@/components/pricing/PricingHero";
import PricingFaqTeaser from "@/components/pricing/PricingFaqTeaser";
import Footer from "@/components/layout/Footer";

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Prijzen — Start gratis, upgrade wanneer jij wil | FitFi"
        description="Begin met een gratis AI Style Report. Breid desgewenst uit met premium functies. Geen creditcard nodig."
        canonical="https://fitfi.ai/prijzen"
      />

      <PricingHero
        onStart={() => navigate("/onboarding")}
        onExample={() => navigate("/results")}
      />

      <section className="ff-section bg-white">
        <div className="ff-container grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-1">Gratis</h2>
            <p className="text-sm mb-4 opacity-80">AI Style Report • outfits + shoplinks</p>
            <p className="text-3xl font-semibold mb-4">€0</p>
            <ul className="space-y-2 text-sm">
              <li>✔ Stijlprofiel &amp; uitleg</li>
              <li>✔ 3 outfits met shoplinks</li>
              <li>✔ Privacy-first</li>
            </ul>
            <button className="btn btn-primary mt-6" onClick={() => navigate("/onboarding")} aria-label="Start gratis plan">
              Start gratis
            </button>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-1">Pro</h2>
            <p className="text-sm mb-4 opacity-80">Meer outfits, kleurenadvies &amp; garderobetips</p>
            <p className="text-3xl font-semibold mb-4">€—</p>
            <ul className="space-y-2 text-sm">
              <li>✔ Extra outfits &amp; varianten</li>
              <li>✔ Seizoen- &amp; materiaaladvies</li>
              <li>✔ Prioriteit updates</li>
            </ul>
            <button className="btn btn-ghost mt-6" onClick={() => navigate("/onboarding")} aria-label="Pro proberen">
              Proberen
            </button>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-1">Team</h2>
            <p className="text-sm mb-4 opacity-80">Voor brands &amp; stylists</p>
            <p className="text-3xl font-semibold mb-4">Op aanvraag</p>
            <ul className="space-y-2 text-sm">
              <li>✔ Co-branding &amp; integraties</li>
              <li>✔ API-toegang (op termijn)</li>
              <li>✔ Dedicated support</li>
            </ul>
            <button className="btn btn-ghost mt-6" onClick={() => navigate("/contact")} aria-label="Contact team">
              Contact
            </button>
          </div>
        </div>
      </section>

      <PricingFaqTeaser />

      <Footer />
    </main>
  );
};

export default PricingPage;