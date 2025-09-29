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

      {/* Missie & verhaal (uit jouw input opgebouwd) */}
      <section className="ff-container py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Ons verhaal</h2>
            <p className="mt-3 text-[var(--color-text)]/80">
              FitFi is ontstaan uit een simpele vraag: waarom staat de ene kleur je geweldig en de andere juist niet?
              We doken in kleur, huidtinten en pasvormen – en merkten dat mensen vooral vastlopen op tijd: uren scrollen,
              eindeloos vergelijken en tóch twijfelen. Dat moest slimmer kunnen.
            </p>
            <p className="mt-3 text-[var(--color-text)]/80">
              Met FitFi combineren we persoonlijke voorkeur met heldere logica. Geen grote woorden, wel praktische keuzes.
              Minder zoeken, meer dragen.
            </p>
          </article>

          {/* Behind the scenes – zonder te veel prijs te geven */}
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Hoe we het aanpakken</h2>
            <p className="mt-3 text-[var(--color-text)]/80">
              We koppelen je antwoorden aan duidelijke regels voor silhouet, kleurtemperatuur en materiaal.
              Achter de schermen gebruiken we modellen en referentiedata om combinaties te beoordelen.
              De exacte receptuur houden we compact – het resultaat is wat telt: rust in je keuzes.
            </p>
            <p className="mt-3 text-[var(--color-text)]/80">
              Privacy blijft leidend. We vragen weinig en gebruiken het gericht voor jouw advies.
            </p>
          </article>
        </div>
      </section>

      {/* Sustainability & ethics */}
      <section className="ff-container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Bewust kopen</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Minder impulsaankopen, meer outfits die je echt draagt. Dat is duurzamer voor je kast én je portemonnee.
            </p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Eerlijke links</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Soms verdienen we commissie via shoplinks. Aanbevelingen blijven altijd stijl- en pasvormgedreven, niet om de commissie.
            </p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-montserrat text-lg text-[var(--color-text)]">Privacy-first</h3>
            <p className="mt-2 text-[var(--color-text)]/80">
              Zo min mogelijk data, netjes verwerkt. Geen doorverkoop. Je behoudt controle.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Lees hoe het werkt</NavLink>
        </div>
      </section>

      {/* Team-sectie blijft zoals op de site (later uitbreiden) */}
    </main>
  );
}