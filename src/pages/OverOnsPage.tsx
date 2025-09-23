import React from "react";
import Seo from "@/components/Seo";
import SkipLink from "@/components/a11y/SkipLink";

const OverOnsPage: React.FC = () => {
  const principles = [
    {
      title: "Rust boven ruis",
      text:
        "Heldere koppen, rustige ritmes en consistente componenten. Jij houdt focus op wat telt.",
    },
    {
      title: "Mens × Machine",
      text:
        "AI versterkt stijlgevoel. Nova geeft richting; jij beslist met vertrouwen.",
    },
    {
      title: "Transparant & privacy-first",
      text:
        "Geen dark patterns. We verwerken alleen wat nodig is en leggen uit waarom.",
    },
  ];

  const milestones = [
    { kpi: "2 min", label: "naar je eerste rapport" },
    { kpi: "3+", label: "outfits met shoplinks" },
    { kpi: "0%", label: "frictie: start gratis" },
  ];

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
        <Seo
          title="Over ons — Wie wij zijn en waar we voor staan | FitFi"
          description="Wij combineren AI en design om stijl eenvoudig, persoonlijk en privacy-vriendelijk te maken. Ontmoet Nova en ontdek onze missie en principes."
          canonical="https://fitfi.ai/over-ons"
        />

        {/* HERO — cinematic */}
        <section className="about-hero-wrap">
          <figure className="about-hero-media" aria-hidden="true">
            <img
              src="/images/hero/main.jpg"
              alt=""
              loading="eager"
              decoding="async"
              className="about-hero-img"
            />
            <span className="about-hero-vignette" aria-hidden="true" />
          </figure>

          <div className="ff-container about-hero-grid">
            <header className="about-hero-copy card-hover" aria-label="Over FitFi">
              <p className="kicker">Over ons</p>
              <h1 className="display-title">
                Wij zijn <span className="about-accent">FitFi</span>
              </h1>
              <p className="lead">
                We combineren AI en design tot een rustige, praktische styling-ervaring.
                Geen ruis—alleen keuzes die kloppen bij jou.
              </p>

              <div className="about-cta cluster mt-5" role="group" aria-label="Acties">
                <a href="/onboarding" className="btn btn-primary">Start gratis</a>
                <a href="/results" className="btn btn-ghost">Bekijk voorbeeld</a>
              </div>

              <ul className="about-stats mt-6" role="list">
                {milestones.map((m) => (
                  <li key={m.label} className="stat-card">
                    <span className="stat-kpi">{m.kpi}</span>
                    <span className="stat-label">{m.label}</span>
                  </li>
                ))}
              </ul>
            </header>
          </div>
        </section>

        {/* MISSIE & VISIE — editorial split */}
        <section className="ff-section bg-[var(--color-surface)]">
          <div className="ff-container grid gap-8 md:grid-cols-2">
            <article className="ff-card flow-sm">
              <h2 className="ff-h3">Onze missie</h2>
              <p className="ff-body text-[var(--color-muted)]">
                Mode moet je kracht geven, geen onzekerheid. We vertalen je voorkeuren naar outfits
                die werken voor silhouet, materialen en kleurtemperatuur—zodat je garderobe rust geeft.
              </p>
            </article>
            <article className="ff-card flow-sm">
              <h2 className="ff-h3">Onze visie</h2>
              <p className="ff-body text-[var(--color-muted)]">
                AI is geen filter maar een vergrootglas. Met Nova creëren we een verklaarbare stijltaal
                die met je meegroeit—van eerste rapport naar duurzame keuzes.
              </p>
            </article>
          </div>
        </section>

        {/* NOVA — spotlight note */}
        <section className="ff-section">
          <div className="ff-container grid gap-10 md:grid-cols-[1.15fr_.85fr] items-center">
            <div className="flow-sm">
              <p className="kicker">AI-persona</p>
              <h2 className="section-title">Ontmoet Nova</h2>
              <p className="ff-body text-[var(--color-muted)]">
                Nova begrijpt context en combineert aanwijzingen slim: gelegenheid, pasvorm, textuur, seizoen.
                Uitleg is ingebouwd—je leert waarom iets werkt, niet alleen wat je moet kopen.
              </p>
            </div>
            <aside className="about-nova-spot ff-card">
              <p className="ff-body">
                "Ik help je twijfels wegnemen. Eén rustiger silhouet kan al het verschil maken."
              </p>
            </aside>
          </div>
        </section>

        {/* PRINCIPES — 3 cards */}
        <section className="ff-section bg-[var(--color-surface)]" aria-labelledby="principes">
          <div className="ff-container">
            <header className="section-header">
              <p className="kicker">Principes</p>
              <h2 id="principes" className="section-title">Waar we nooit op inleveren</h2>
              <p className="section-intro">Rust, transparantie en keuzes die je vooruit helpen.</p>
            </header>
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {principles.map((p) => (
                <article key={p.title} className="principle-card card-hover flow-sm" aria-label={p.title}>
                  <h3 className="ff-h4">{p.title}</h3>
                  <p className="ff-body text-[var(--color-muted)]">{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — finale */}
        <section className="ff-section">
          <div className="ff-container text-center flow-sm">
            <h2 className="section-title">Klaar om je stijl te ontdekken?</h2>
            <p className="section-intro">Start gratis. Geen account, geen creditcard—wél resultaat.</p>
            <div className="cluster mt-2" role="group" aria-label="Acties afsluiter">
              <a href="/onboarding" className="btn btn-primary">Start gratis</a>
              <a href="/hoe-het-werkt" className="btn btn-ghost">Zo werkt het</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default OverOnsPage;