import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function HomePage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* HERO (reeds in lijn met site) */}
      <PageHero
        id="page-home"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Ontdek wat jouw stijl over je zegt"
        subtitle="Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis."
        align="left"
        as="h1"
        size="lg"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_home_start" },
          { label: "Bekijk voorbeeld", to: "/hoe-het-werkt", variant: "secondary", "data-event": "cta_home_example" },
        ]}
        note="Geen spam. Opzeggen kan altijd."
      />

      {/* FEATURES OVERVIEW */}
      <section className="ff-container py-10 sm:py-14">
        <header className="mb-6 sm:mb-8">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Waarom FitFi werkt</h2>
          <p className="text-[var(--color-text)]/80 mt-2 max-w-2xl">
            Slimme AI + rustige uitleg. Jij houdt de regie over je garderobe—zonder ellenlang scrollen of miskopen.
          </p>
        </header>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "AI-analyse", desc: "Stijl, silhouet en kleur—helder vertaald naar outfits." },
            { title: "Persoonlijke outfits", desc: "Per gelegenheid (werk/weekend/diner) met toelichting." },
            { title: "Wishlist & alerts", desc: "Bewaar favorieten en krijg prijs-signalen (optioneel)." },
            { title: "Rust & eenvoud", desc: "Geen ruis. Alleen keuzes die bij jou passen." },
          ].map((f, i) => (
            <article key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
              <div className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] w-9 h-9 mb-3">
                <CheckIcon />
              </div>
              <h3 className="font-montserrat text-lg">{f.title}</h3>
              <p className="text-[var(--color-text)]/80 mt-1">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PREVIEW PLACEHOLDER (kader voor toekomstige screenshot/video) */}
      <section className="ff-container py-8 sm:py-12">
        <header className="mb-4 sm:mb-6">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Kijk mee in de ervaring</h2>
          <p className="text-[var(--color-text)]/80 mt-2 max-w-2xl">
            Een rustige interface die direct duidelijk maakt wat bij je past. Hieronder komt een preview van het stijlprofiel en outfit-overzicht.
          </p>
        </header>

        <figure
          aria-label="Preview placeholder — hier komt een afbeelding of video van het dashboard"
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur shadow-[var(--shadow-soft)] overflow-hidden"
        >
          <div
            className="relative w-full"
            style={{ paddingTop: "56.25%" }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="inline-block rounded-full border border-[var(--color-border)] px-3 py-1 text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                  Preview
                </div>
                <div className="font-montserrat text-xl">Stijlprofiel & outfits (beeld volgt)</div>
                <p className="text-[var(--color-text)]/70 mt-1 max-w-lg">
                  Placeholder-kader: vervang dit later door een screenshot of korte video.
                </p>
              </div>
            </div>
          </div>
          <figcaption className="px-4 py-3 text-[var(--color-text)]/70 text-sm border-t border-[var(--color-border)]">
            Tip: toon straks het kleurenpalet, een outfitgrid en een "Toevoegen aan wishlist" flow.
          </figcaption>
        </figure>

        <div className="mt-6 flex gap-3">
          <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Zo werkt het</NavLink>
        </div>
      </section>
    </main>
  );
}