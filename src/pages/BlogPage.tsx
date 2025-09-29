import React from "react";
import PageHero from "@/components/marketing/PageHero";

const POSTS = [
  { title: "Silhouet lezen: zo kies je vormen die werken", excerpt: "Praktische tips om verhoudingen te zien en outfits te laten kloppen.", href: "/blog/silhouet-lezen" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Ontdek je kleurwereld en combineer zonder twijfelen.", href: "/blog/kleurtemperatuur" },
  { title: "Capsule wardrobe: minder kopen, meer dragen", excerpt: "Bouw rustig aan een kast die elke dag werkt.", href: "/blog/capsule-wardrobe" },
  { title: "Materialen die mooier vallen", excerpt: "Waarom stof en structuur het verschil maken.", href: "/blog/materialen" },
];

const CATEGORIES = ["Silhouet", "Kleur", "Garderobe", "Gidsen"];

export default function BlogPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-blog"
        eyebrow="INSIGHTS"
        title="Blog"
        subtitle="Heldere uitleg over silhouet, kleur en outfits. Nuchter, zonder modetaal."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" }
        ]}
      />

      {/* Filters (dummy) */}
      <section className="ff-container pt-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text)]/80">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="ff-container ff-stack-lg py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((p) => (
            <article key={p.href} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
              <a href={p.href} className="block" aria-label={`Lees: ${p.title}`}>
                <div className="aspect-[16/9] w-full bg-[var(--color-bg)]/40 grid place-items-center">
                  <span className="text-[var(--color-text)]/50 text-sm">Afbeelding</span>
                </div>
                <div className="p-4">
                  <div className="text-[var(--color-text)]/70 text-sm">5 min</div>
                  <h2 className="font-montserrat text-lg text-[var(--color-text)] mt-1">{p.title}</h2>
                  <p className="text-[var(--color-text)]/80 mt-1">{p.excerpt}</p>
                  <div className="mt-3"><span className="ff-btn ff-btn-quiet">Lees meer</span></div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter / community callout */}
      <section className="ff-container pb-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Blijf op de hoogte</h2>
          <p className="mt-2 text-[var(--color-text)]/80">
            Nieuwe gidsen over silhouet, kleur en outfits. Af en toe, niet elke dag.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
          </div>
        </div>
      </section>
    </main>
  );
}