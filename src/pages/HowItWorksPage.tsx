import React from "react";
import Seo from "@/components/Seo";
import SkipLink from "@/components/a11y/SkipLink";

const steps = [
  {
    nr: "1",
    title: "Beantwoord enkele slimme vragen",
    text:
      "Context is key: gelegenheid, pasvorm, comfort en materiaalvoorkeur. Zo snapt Nova jouw stijltaal.",
  },
  {
    nr: "2",
    title: "Ontvang je AI Style Rapport",
    text:
      "Direct inzicht in silhouet, kleurtemperatuur en combinaties die rust brengen in je garderobe.",
  },
  {
    nr: "3",
    title: "Shop the look — zonder ruis",
    text:
      "Kies uit samengestelde outfits met duidelijke shoplinks. Jij beslist; Nova onderbouwt.",
  },
];

const deliverables = [
  { h: "3+ Outfits per scan", p: "Complete looks met varianten per gelegenheid." },
  { h: "Uitleg bij keuzes", p: "Waarom iets past: silhouet, materiaal, kleur — kort en helder." },
  { h: "Shoplinks die kloppen", p: "Geen overload; geselecteerde retailers en items." },
];

const HowItWorksPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
        <Seo
          title="Hoe het werkt — Jouw stijl in 3 stappen | FitFi"
          description="Beantwoord enkele vragen, ontvang direct je AI Style Rapport en shop rustig de look. Premium styling, zonder ruis."
          canonical="https://fitfi.ai/hoe-het-werkt"
        />

        {/* HERO */}
        <section className="hero-wrap">
          <div className="ff-container text-center flow-sm">
            <p className="kicker">Hoe het werkt</p>
            <h1 className="display-title">Rustig, helder en direct toepasbaar</h1>
            <p className="lead">
              In drie stappen van voorkeuren naar outfits die kloppen — met uitleg, niet alleen advies.
            </p>
            <div role="group" aria-label="Acties" className="cluster" style={{ marginTop: "0.75rem" }}>
              <a href="/onboarding" className="btn btn-primary">Start gratis</a>
              <a href="/results" className="btn btn-ghost">Bekijk voorbeeld</a>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="ff-section">
          <div className="ff-container grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <article key={s.nr} className="how-card card-hover flow-sm" aria-label={s.title}>
                <div className="how-step" aria-hidden="true">{s.nr}</div>
                <h2 className="ff-h4">{s.title}</h2>
                <p className="ff-body text-[var(--color-muted)]">{s.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* WAT JE KRIJGT */}
        <section className="ff-section bg-[var(--color-surface)]" aria-labelledby="deliverables">
          <div className="ff-container">
            <header className="section-header text-center flow-sm">
              <p className="kicker">Wat je krijgt</p>
              <h2 id="deliverables" className="section-title">Concreet resultaat, zonder gedoe</h2>
              <p className="section-intro">Uitleg, outfits en shoplinks — alles in één rustig rapport.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {deliverables.map((d) => (
                <article key={d.h} className="how-card card-hover flow-sm">
                  <h3 className="ff-h4">{d.h}</h3>
                  <p className="ff-body text-[var(--color-muted)]">{d.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA EIND */}
        <section className="ff-section">
          <div className="ff-container text-center flow-sm">
            <h2 className="section-title">Probeer het nu — gratis</h2>
            <p className="section-intro">Klaar in 2 minuten. Geen account nodig.</p>
            <a href="/onboarding" className="btn btn-primary">Start gratis</a>
          </div>
        </section>
      </main>
    </>
  );
};

export default HowItWorksPage;