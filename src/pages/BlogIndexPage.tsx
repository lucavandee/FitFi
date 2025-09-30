import React from "react";
import { NavLink } from "react-router-dom";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;         // 16 sep 2025
  dateISO: string;      // 2025-09-16
  readingTime: string;  // 4 min
  cover?: string;
  tags?: string[];
};

const POSTS: Post[] = [
  {
    slug: "kleurtemperatuur-warm-koel-neutraal",
    title: "Kleurtemperatuur: warm, koel of neutraal?",
    excerpt: "Herken je kleurtemperatuur en kies outfits die je huid laten stralen.",
    date: "16 sep 2025",
    dateISO: "2025-09-16",
    readingTime: "4 min",
    cover: "/images/blog/kleurtemperatuur.jpg",
    tags: ["Kleur", "Gids"]
  },
  {
    slug: "silhouet-outfits",
    title: "Wat je silhouet écht zegt over je outfitkeuzes",
    excerpt: "Waarom proporties, lengte en snit het verschil maken.",
    date: "09 sep 2025",
    dateISO: "2025-09-09",
    readingTime: "5 min",
    cover: "/images/blog/silhouet.jpg",
    tags: ["Silhouet", "Basics"]
  },
  {
    slug: "capsule-wardrobe-10-stuks",
    title: "Capsule wardrobe: 10 stuks, eindeloze combinaties",
    excerpt: "De premium manier om rust en consistentie in je kast te krijgen.",
    date: "31 aug 2025",
    dateISO: "2025-08-31",
    readingTime: "6 min",
    cover: "/images/blog/capsule.jpg",
    tags: ["Capsule", "Minimal"]
  }
];

export default function BlogIndexPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">Blog</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Lees onze gidsen & tips</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Korte, nuchtere artikelen die je direct verder helpen — zonder ruis.
        </p>
      </section>

      <section className="ff-container ff-section">
        <div className="ff-blog-grid">
          {POSTS.map((p) => (
            <article key={p.slug} className="ff-blog-card">
              {p.cover && <img src={p.cover} alt="" loading="lazy" />}
              <div className="ff-blog-meta">
                <time dateTime={p.dateISO}>{p.date}</time> • <span>{p.readingTime}</span>
              </div>
              <h2 className="ff-blog-title">{p.title}</h2>
              <p className="ff-blog-excerpt">{p.excerpt}</p>
              <div className="ff-blog-actions">
                <NavLink to={`/blog/${p.slug}`} className="ff-btn ff-btn-secondary">Lees artikel</NavLink>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}