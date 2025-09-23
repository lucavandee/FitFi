// src/pages/OverOnsPage.tsx
import React from "react";

const OverOnsPage: React.FC = () => {
  return (
    <main className="bg-bg text-text">
      {/* Hero */}
      <section className="relative py-24 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
            Wij zijn <span className="text-primary">FitFi</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto">
            Wij combineren AI en stijl om jou te laten schitteren. 
            Geen algoritmes die je beperken, maar technologie die je vooruit brengt.
          </p>
        </div>
      </section>

      {/* Nova Intro */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center px-6">
          <div>
            <img
              src="/images/nova-portrait.png"
              alt="Nova – jouw AI stylist"
              className="rounded-2xl shadow-soft"
            />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-semibold">Ontmoet Nova</h2>
            <p className="mt-4 text-lg text-muted">
              Nova is onze AI-stylist. Ze begrijpt wie jij bent en vertaalt dit
              naar outfits die je zelfvertrouwen geven. Altijd persoonlijk, altijd
              stijlvol.
            </p>
            <p className="mt-4 text-lg text-muted">
              Nova leert van duizenden stijlen, maar focust altijd op jou. Zij is
              jouw gids naar een garderobe die klopt.
            </p>
          </div>
        </div>
      </section>

      {/* Missie */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl font-heading font-semibold">Onze missie</h2>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
            Mode moet je kracht geven, geen onzekerheid. Met FitFi maken we
            styling toegankelijk, persoonlijk en slim met AI.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-sm uppercase tracking-wide text-muted">
            Vertrouwd door honderden gebruikers
          </p>
          <h2 className="mt-4 text-3xl font-heading font-semibold">
            Klaar om je stijl te ontdekken?
          </h2>
          <button className="mt-8 btn-primary">Start gratis</button>
        </div>
      </section>
    </main>
  );
};

export default OverOnsPage;