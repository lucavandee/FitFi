import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>FitFi — AI-stylist voor jouw stijl</title>
        <meta
          name="description"
          content="Antwoord op 6 korte vragen en ontvang direct outfits die bij je passen — inclusief uitleg en shoplinks."
        />
      </Helmet>

      {/* HERO — identieke constructie als Prijzen/How-it-works via PageHero */}
      <PageHero
        title="Ontvang outfits die bij je passen"
        subtitle="Binnen 2 minuten. Rustig, duidelijk en zonder gedoe. Je krijgt direct looks met uitleg waarom het bij je past."
        align="left"
        ctas={[
          { label: "Start gratis", to: "/onboarding", variant: "primary", "data-event": "cta_start_free_home" },
          { label: "Bekijk voorbeeld", to: "/results", variant: "secondary", "data-event": "cta_view_example_home" },
        ]}
      />

      {/* ——— Onderliggende secties: rustig en app-achtig, bestaande patronen/classes ——— */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Snel en duidelijk</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                6 korte vragen. Geen upload nodig. Slimme voorkeuren en context.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Uitleg bij elke look</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Je ziet waarom items matchen met jouw silhouet, kleur en moment.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Shop slim</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Geselecteerde items, privacy-first. We kiezen kwaliteit boven ruis.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <h2 className="text-xl font-semibold">Bekijk een voorbeeld</h2>
              <p className="mt-2 text-[var(--color-text)]/80">
                Wil je eerst zien hoe een resultaat eruitziet? Bekijk een voorbeeldpagina met
                looks, uitleg en shoplinks.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink to="/results" className="ff-btn ff-btn-secondary" data-event="cta_view_example_inline">
                  Bekijk voorbeeld
                </NavLink>
                <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_inline">
                  Start gratis
                </NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}