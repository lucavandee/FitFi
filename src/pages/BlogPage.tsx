import React from "react";
import Seo from "@/components/Seo";
import SkipLink from "@/components/a11y/SkipLink";

const posts = [
  {
    title: "De kracht van kleur in je garderobe",
    excerpt: "Hoe kleurtemperatuur je uitstraling beïnvloedt, en hoe Nova dit vertaalt naar outfits.",
    href: "/blog/kleur-garderobe",
  },
  {
    title: "Minimalistische essentials",
    excerpt: "Waarom minder meer kan zijn — en hoe je outfits samenstelt die altijd werken.",
    href: "/blog/minimalistische-essentials",
  },
  {
    title: "AI in mode",
    excerpt: "Geen hype maar praktijk: hoe FitFi AI inzet voor transparantie en eenvoud.",
    href: "/blog/ai-in-mode",
  },
];

const BlogPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
        <Seo
          title="Blog — Inzichten & inspiratie | FitFi"
          description="Lees over kleur, silhouet, AI en minimalistische stijl. Inzichten die je garderobe slimmer maken."
          canonical="https://fitfi.ai/blog"
        />

        {/* HERO */}
        <section className="hero-wrap">
          <div className="ff-container text-center flow-sm">
            <p className="kicker">Blog</p>
            <h1 className="display-title">Inzichten & inspiratie</h1>
            <p className="lead">Rustige artikelen, geen modehype.</p>
          </div>
        </section>

        {/* GRID */}
        <section className="ff-section">
          <div className="ff-container grid gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.title} className="blog-card card-hover flow-sm">
                <h2 className="ff-h4">
                  <a href={post.href} className="blog-card__link">{post.title}</a>
                </h2>
                <p className="ff-body text-[var(--color-muted)]">{post.excerpt}</p>
                <a href={post.href} className="btn btn-ghost mt-auto">
                  Lees meer
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogPage;