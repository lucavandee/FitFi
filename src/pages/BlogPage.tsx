import React from "react";
import Seo from "@/components/Seo";
import BlogHeader from "@/components/blog/BlogHeader";
import SkipLink from "@/components/a11y/SkipLink";

const posts = [
  {
    title: "Wat je silhouet écht zegt over je outfitkeuzes",
    excerpt: "Zo laat je proportie, lengte en snit voor je werken—met rust in je keuzes.",
    href: "/blog/silhouet-outfits",
  },
  {
    title: "Kleurtemperatuur: warm, koel of neutraal?",
    excerpt: "Herken je kleurfamilie en combineer zonder twijfelen. Zo laat je je huid stralen.",
    href: "/blog/kleurtemperatuur-gids",
  },
  {
    title: "Rust in je garderobe: 5 micro-beslissingen",
    excerpt: "Kleine keuzes met groot effect: intentie in stof, tint en fit.",
    href: "/blog/rust-in-garderobe",
  },
];

const BlogPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)]">
        <Seo
          title="Blog — Tips & gidsen | FitFi"
          description="Lees tips over silhouet, kleur en outfits. Slim combineren zonder twijfelen."
          canonical="https://fitfi.ai/blog"
        />

        <section className="ff-section bg-white">
          <div className="ff-container">
            <BlogHeader
              title="Blog"
              intro="Korte, praktische gidsen — direct toepasbaar in je kast."
              kicker="Insights"
            />

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <article key={p.href} className="ff-card">
                  <a href={p.href} className="block ff-card__inner" aria-label={`Lees: ${p.title}`}>
                    <h2 className="ff-h3">{p.title}</h2>
                    <p className="ff-body text-[var(--color-muted)] mt-2">{p.excerpt}</p>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogPage;