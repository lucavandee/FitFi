import React from "react";
import { NavLink } from "react-router-dom";
import BlogHeader from "@/components/blog/BlogHeader";

const POSTS = [
  {
    title: "Wat je silhouet zegt over je outfitkeuzes",
    excerpt: "Zo laat je proportie en snit voor je werken — met rust in je keuzes.",
    href: "/blog/silhouet-outfits",
    category: "Stijl",
    readTime: "5 min"
  },
  {
    title: "Kleurtemperatuur: warm, koel of neutraal?",
    excerpt: "Herken je kleurfamilie en combineer zonder twijfelen.",
    href: "/blog/kleurtemperatuur-gids",
    category: "Kleur",
    readTime: "4 min"
  },
  {
    title: "Capsule wardrobe: weinig kopen, alles dragen",
    excerpt: "Met 20–30 items het seizoen door — meer combinaties, minder twijfel.",
    href: "/blog/capsule-wardrobe",
    category: "Garderobe",
    readTime: "6 min"
  }
];

export default function BlogPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <BlogHeader />
        
        <div className="ff-blog-grid">
          {POSTS.map((post) => (
            <article key={post.href} className="ff-blog-card">
              <NavLink to={post.href} className="block" aria-label={`Lees: ${post.title}`}>
                <img 
                  alt="" 
                  src={`https://picsum.photos/seed/${encodeURIComponent(post.href)}/960/540`} 
                />
                <div className="ff-blog-meta">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="ff-blog-title">{post.title}</h2>
                <p className="ff-blog-excerpt">{post.excerpt}</p>
                <div className="ff-blog-actions">
                  <span className="ff-btn ff-btn-quiet">Lees meer</span>
                </div>
              </NavLink>
            </article>
          ))}
        </div>

        <div className="cta-row justify-center">
          <NavLink to="/quiz" className="ff-btn ff-btn-primary">
            Start gratis
          </NavLink>
        </div>
      </section>
    </main>
  );
}