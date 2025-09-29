import React from "react";
import PageHero from "@/components/marketing/PageHero";

const POSTS = [
  { title: "Wat je silhouet zegt over je outfitkeuzes", excerpt: "Leer verhoudingen lezen en combineren — met rust in je keuzes.", href: "/blog/silhouet-outfits" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Ontdek je kleurwereld en combineer zonder twijfelen.", href: "/blog/kleurtemperatuur-gids" },
  { title: "Capsule wardrobe: weinig kopen, alles dragen", excerpt: "Maximale combinaties, minder twijfel.", href: "/blog/capsule-wardrobe" }
];

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
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary", "data-event": "cta_blog_how" }
        ]}
      />

      <section id="posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {POSTS.map((p) => (
            <article key={p.href} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
              <a href={p.href} className="block" aria-label={`Lees: ${p.title}`}>
                <img alt="" loading="lazy" src={`https://picsum.photos/seed/${encodeURIComponent(p.href)}/960/540`} className="w-full h-auto" />
                <div className="p-4">
                  <div className="text-[var(--color-text)]/70 text-sm">Stijl • 5 min</div>
                  <h2 className="font-montserrat text-lg text-[var(--color-text)] mt-1">{p.title}</h2>
                  <p className="text-[var(--color-text)]/80 mt-1">{p.excerpt}</p>
                  <div className="mt-3">
                    <span className="px-4 py-2 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors">Lees meer</span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}