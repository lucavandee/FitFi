import React from "react";
import PageHero from "@/components/marketing/PageHero";
import posts from "@/data/blogPosts";
import BlogCard from "@/components/blog/BlogCard";

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
        ctas={[{ label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_blog_start" }]}
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => <BlogCard key={p.id} post={p} />)}
        </div>
      </section>

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