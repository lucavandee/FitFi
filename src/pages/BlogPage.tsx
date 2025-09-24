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
    title: "Capsule wardrobe: weinig kopen, alles dragen",
    excerpt: "Met 20–30 items het hele seizoen door — meer combinaties, minder twijfel.",
    href: "/blog/capsule-wardrobe",
  },
];

const BlogPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="ff-container ff-stack-lg bg-[var(--color-bg)]">
        <Seo
          title="Blog — Tips & gidsen | FitFi"
          description="Lees tips over silhouet, kleur en outfits. Slim combineren zonder twijfelen."
          canonical="https://fitfi.ai/blog"
        />

        <section className="py-10 sm:py-12">
          <div className="ff-container">
            <BlogHeader />
            <div className="ff-blog-grid mt-6">
              {posts.map((p) => (
                <article key={p.href} className="ff-blog-card">
                  <a href={p.href} className="block" aria-label={`Lees: ${p.title}`}>
                    <img alt="" src={`https://picsum.photos/seed/${encodeURIComponent(p.href)}/960/540`} />
                    <div className="ff-blog-meta">
                      <span>Stijl</span>•<span>5 min</span>
                    </div>
                    <h2 className="ff-blog-title">{p.title}</h2>
                    <p className="ff-blog-excerpt">{p.excerpt}</p>
                    <div className="ff-blog-actions">
                      <span className="ff-btn ff-btn-quiet">Lees meer</span>
                    </div>
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