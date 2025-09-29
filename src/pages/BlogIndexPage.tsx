import React from "react";
import PageHero from "@/components/marketing/PageHero";

export default function BlogIndexPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-blog-index"
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

      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        {/* Hier kan jullie bestaande BlogList component in plaats van deze placeholders */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3].map((n) => (
            <article key={n} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-[var(--color-text)]/70 text-sm">Stijl • 5 min</div>
              <h2 className="font-montserrat text-lg text-[var(--color-text)] mt-1">Artikel {n}</h2>
              <p className="text-[var(--color-text)]/80 mt-1">Korte intro van het artikel.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}