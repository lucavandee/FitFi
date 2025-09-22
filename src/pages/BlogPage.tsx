import React from "react";
import Seo from "@/components/Seo";

type Post = { slug: string; title: string; excerpt: string; date: string };

const posts: Post[] = [
  { slug: "stijl-gids-najaar", title: "Stijlgids Najaar", excerpt: "Kleurtemperaturen, lagen en silhouet voor het nieuwe seizoen.", date: "2025-09-01" },
  { slug: "capsule-wardrobe", title: "Capsule Wardrobe 101", excerpt: "Minder kiezen, beter dragen. Zo stel je 'm slim samen.", date: "2025-08-18" },
  { slug: "kleur-advies", title: "Kleuradvies: warm vs. koel", excerpt: "Zo herken je je kleurfamilie en combineer je zonder twijfel.", date: "2025-07-30" },
];

const BlogPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Blog — Tips & gidsen | FitFi"
        description="Lees tips over silhouet, kleur en outfits. Slim combineren zonder twijfelen."
        canonical="https://fitfi.ai/blog"
      />

      <section className="ff-section bg-white">
        <div className="ff-container">
          <header className="max-w-3xl">
            <h1 className="ff-h1">Blog</h1>
            <p className="ff-lead text-[var(--color-muted)]">Korte, praktische gidsen—direct toepasbaar in je kast.</p>
          </header>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <article key={p.slug} className="ff-card">
                <a href={`/blog/${p.slug}`} className="block ff-card__inner" aria-label={`Lees: ${p.title}`}>
                  <h2 className="ff-h3">{p.title}</h2>
                  <p className="ff-body text-[var(--color-muted)] mt-2">{p.excerpt}</p>
                  <time className="mt-3 block text-sm text-[var(--color-muted)]" dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString("nl-NL")}
                  </time>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;