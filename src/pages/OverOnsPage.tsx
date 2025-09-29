import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function OverOnsPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-about"
        eyebrow="OVER ONS"
        title="Waarom wij om stijl geven"
        subtitle="We houden van duidelijkheid: wat staat je goed en waarom? En hoe koop je minder, maar beter."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Doe de stijlscan", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" }
        ]}
      />

      <section className="ff-container py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Ons verhaal</h2>
            <p className="mt-3 text-[var(--color-text)]/80">
              FitFi ontstond vanuit een simpele vraag: waarom staat de ene kleur je geweldig en de andere niet?
              We doken in kleur, lichaamsvormen en pasvormen – en merkten dat mensen vooral vastlopen op tijd:
              uren scrollen, eindeloos vergelijken en tóch twijfelen. Dat moest slimmer kunnen.
            </p>
            <p className="mt-3 text-[var(--color-text)]/80">
              Met FitFi combineren we jouw persoonlijke voorkeur met heldere logica. Geen grote woorden, wel praktische keuzes.
              Minder zoeken, meer dragen.
            </p>
          </article>

          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Hoe we het doen</h2>
            <p className="mt-3 text-[var(--color-text)]/80">
              We koppelen je antwoorden aan simpele regels voor silhouet, kleur en materiaal.
              Zo zie je waarom iets werkt, niet alleen dát het werkt. Onze modellen blijven op de achtergrond – het resultaat is wat telt.
            </p>
            <p className="mt-3 text-[var(--color-text)]/80">
              We verzamelen zo weinig mogelijk data en gebruiken die alleen voor jouw advies. Je privacy staat voorop.
            </p>
          </article>
        </div>
      </section>

      <section className="ff-container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Bewust kopen</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Minder impulsaankopen, meer outfits die je echt draagt. Dat is beter voor je kast én voor de planeet.
            </p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Eerlijke links</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Soms verdienen we iets via shoplinks. Maar ons advies komt altijd op de eerste plaats.
            </p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Privacy gegarandeerd</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Zo min mogelijk verzamelen, netjes verwerken en niets doorverkopen. Jij bepaalt.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Lees hoe het werkt</NavLink>
        </div>
      </section>

      {/* Team informatie kan hier later toegevoegd worden */}
    </main>
  );
}