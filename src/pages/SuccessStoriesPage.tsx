// src/pages/SuccessStoriesPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Quote, Sparkles } from "lucide-react";

type Story = {
  quote: string;
  author: string;
  role?: string;
};

const STORIES: Story[] = [
  {
    quote:
      "Ik trek 's ochtends sneller iets aan en voel me beter in wat ik draag. Rust in m'n kast én hoofd.",
    author: "Eva (34)",
    role: "Marketing",
  },
  {
    quote:
      "De uitleg bij kleur en silhouet is zó duidelijk. Minder twijfel, betere keuzes — ook als ik niets koop.",
    author: "Jasper (41)",
    role: "Consultant",
  },
  {
    quote:
      "Outfits per gelegenheid is goud. Werk, weekend, diner: alles klopt bij elkaar.",
    author: "Mila (29)",
    role: "HR",
  },
  {
    quote:
      "Ik koop minder en draag meer. Capsule-advies hielp enorm om te focussen.",
    author: "Noor (27)",
  },
  {
    quote:
      "De wishlist met prijsalerts is chill: gericht wachten i.p.v. impulsief kopen.",
    author: "Ruben (38)",
  },
  {
    quote:
      "Eindelijk snap ik welke broeken en jassen mijn proportie beter maken.",
    author: "Sanne (31)",
  },
];

export default function SuccessStoriesPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Echte mensen, echte outfits</p>
          <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Waarom FitFi werkt
          </h1>
          <p className="text-text/80 max-w-2xl">
            We maken stijlkeuzes rustig en logisch. Minder ruis, meer dragen.
          </p>
          <div className="cta-row">
            <NavLink to="/quiz" className="ff-btn ff-btn-primary">
              <Sparkles className="w-4 h-4" />
              <span className="ml-2">Start gratis</span>
            </NavLink>
            <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">
              Hoe het werkt
            </NavLink>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((s, i) => (
            <article key={i} className="ff-card p-5">
              <Quote aria-hidden className="w-5 h-5 text-text/60" />
              <p className="mt-3">{s.quote}</p>
              <footer className="mt-4 text-sm text-text/70">
                <span className="font-medium">{s.author}</span>
                {s.role ? <span className="ml-1">• {s.role}</span> : null}
              </footer>
            </article>
          ))}
        </div>

        <section aria-labelledby="capsule-title" className="ff-stack-lg">
          <h2 id="capsule-title" className="font-heading text-xl sm:text-2xl">
            Resultaat: minder kopen, meer dragen
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="ff-card p-5">
              <h3 className="font-semibold">Outfit-zekerheid</h3>
              <p className="mt-1 text-text/80">
                Combinaties die kloppen bij je leven. Geen eindeloos scrollen.
              </p>
            </article>
            <article className="ff-card p-5">
              <h3 className="font-semibold">Slimmer shoppen</h3>
              <p className="mt-1 text-text/80">
                Wishlist & alerts houden je gericht. Jij bepaalt het tempo.
              </p>
            </article>
            <article className="ff-card p-5">
              <h3 className="font-semibold">Bewuste garderobe</h3>
              <p className="mt-1 text-text/80">
                Capsule-advies: met minder items meer opties.
              </p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}