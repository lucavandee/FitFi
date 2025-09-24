import React from "react";
import BlogHeader from "@/components/blog/BlogHeader";

const posts = [
  { title: "Wat je silhouet zegt over je outfitkeuzes", excerpt: "Zo laat je proportie en snit voor je werken — met rust in je keuzes.", href: "/blog/silhouet-outfits" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Herken je kleurfamilie en combineer zonder twijfelen.", href: "/blog/kleurtemperatuur-gids" },
  { title: "Capsule wardrobe: weinig kopen, alles dragen", excerpt: "Met 20–30 items het seizoen door — meer combinaties, minder twijfel.", href: "/blog/capsule-wardrobe" }
];

export default function BlogPage() {
  return (
    <main id="main" className="ff-scope bg-bg text-text">
      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        <BlogHeader />
        <div className="ff-blog-grid mt-6">
          {posts.map((p) => (
            <article key={p.href} className="ff-blog-card">
              <a href={p.href} className="block" aria-label={`Lees: ${p.title}`}>
                <img alt="" src={`https://picsum.photos/seed/${encodeURIComponent(p.href)}/960/540`} />
                <div className="ff-blog-meta"><span>Stijl</span>•<span>5 min</span></div>
                <h2 className="ff-blog-title">{p.title}</h2>
                <p className="ff-blog-excerpt">{p.excerpt}</p>
                <div className="ff-blog-actions"><span className="ff-btn ff-btn-quiet">Lees meer</span></div>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}