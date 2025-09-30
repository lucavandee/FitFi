import React from "react";
import PageHero from "@/components/marketing/PageHero";

const POSTS = [
  { title: "Silhouet lezen: zo kies je vormen die werken", excerpt: "Proportie, lengte en volume: zo laat je kleding en outfits kloppen.", href: "/blog/silhouet-lezen" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Herken je kleurtemperatuur en combineer zonder twijfelen.", href: "/blog/kleurtemperatuur" },
  { title: "Capsule wardrobe: minder kopen, meer dragen", excerpt: "De premium manier om rust in je kast te krijgen: 10 stuks, eindeloze combinaties.", href: "/blog/capsule-wardrobe" },
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
        subtitle="Praktische gidsen over silhouet, kleur en outfits — premium stijl, nuchtere uitleg."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_blog_start" },
        ]}
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-8 md:grid-cols-[240px,1fr]">
          <aside className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] h-fit">
            <h2 className="font-heading text-lg">Categorieën</h2>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c} className="text-[var(--color-text)]/80">{c}</li>
              ))}
            </ul>
          </aside>

          <div className="space-y-6">
            {POSTS.map((p, i) => (
              <article key={i} className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
                <h3 className="font-heading text-xl">
                  <a href={p.href} className="hover:underline">{p.title}</a>
                </h3>
                <p className="mt-2 text-[var(--color-text)]/80">{p.excerpt}</p>
                <div className="mt-4">
                  <a href={p.href} className="ff-btn ff-btn-secondary">Lees artikel</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}