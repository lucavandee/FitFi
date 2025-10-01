import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>FitFi — AI-stylist. Rust, duidelijkheid en outfits die passen.</title>
        <meta
          name="description"
          content="Beantwoord 6 korte vragen en ontvang direct outfits die bij je passen — inclusief uitleg en shoplinks. Rustige, premium UI zoals je van ons verwacht."
        />
      </Helmet>

      {/* HERO — identieke constructie als Prijzen/How-it-works via PageHero */}
      <PageHero
        eyebrow="AI-stylist"
        title="Outfits die je écht dragen — niet andersom"
        subtitle="Binnen 2 minuten. Rustig, duidelijk en zonder gedoe. Je krijgt direct looks met uitleg waarom het bij je past."
        align="left"
        ctas={[
          { label: "Start gratis", to: "/onboarding", variant: "primary", "data-event": "cta_start_free_home" },
          { label: "Bekijk voorbeeld", to: "/results", variant: "secondary", "data-event": "cta_view_example_home" },
        ]}
      />

      {/* KERNVOORDELEN — clean 3-up, mobile-first 1 kolom */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Snel & moeiteloos</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                6 korte vragen. Geen upload nodig. Direct resultaat met heldere uitleg.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Uitleg bij elke look</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Begrijp waarom een item werkt voor jouw silhouet, kleur en gelegenheid.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Slim shoppen</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Minder ruis, meer kwaliteit. Privacy-first — jij houdt de regie.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* MINI FLOW — app-gevoel: 3 compacte stappen (rustig ritme, geen ruis) */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">1) Quick scan</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Kies stijlvoorkeuren en doelen. Klaar in 2 minuten.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">2) Match & uitleg</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                We tonen looks die passen — mét korte, heldere toelichting.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">3) Shop bewust</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Selecties op niveau. Je shopt gericht en voorkomt miskopen.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* VOORBEELDRESULTAAT — callout met dubbele CTA voor flow naar demo of start */}
      <section className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <h2 className="text-xl font-semibold">Bekijk een voorbeeld</h2>
              <p className="mt-2 text-[var(--color-text)]/80">
                Wil je eerst zien hoe een FitFi-resultaat eruitziet? Check een voorbeeld met looks,
                uitleg en shoplinks. Zo weet je precies wat je krijgt.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink
                  to="/results"
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_view_example_inline"
                >
                  Bekijk voorbeeld
                </NavLink>
                <NavLink
                  to="/onboarding"
                  className="ff-btn ff-btn-primary"
                  data-event="cta_start_free_inline"
                >
                  Start gratis
                </NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* VERTROUWEN / PRIVACY — twee rustige kaarten */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-2">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Privacy-first</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                We vragen alleen wat nodig is voor een goed advies. Geen spam, geen gedoe.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Eerlijk & nuchter</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Stijladvies zonder hype. Gewoon wat jou beter staat — met korte uitleg waarom.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ TEASER — subtiele afsluiter met link naar alle vragen */}
      <section className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Vragen over FitFi?</h2>
                  <p className="mt-1 text-[var(--color-text)]/70">
                    We hebben de belangrijkste antwoorden voor je op een rij gezet.
                  </p>
                </div>
                <NavLink
                  to="/veelgestelde-vragen"
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_faq_home"
                >
                  Naar FAQ
                </NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}