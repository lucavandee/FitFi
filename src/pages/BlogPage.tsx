import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SkipLink from "@/components/a11y/SkipLink";
import { BLOG_POSTS } from "@/data/blog";

const BlogPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
        <Seo
          title="Blog — Inzichten & inspiratie | FitFi"
          description="Lees over kleur, silhouet, AI en minimalistische stijl. Rustige, duidelijke artikelen zonder ruis."
          canonical="https://fitfi.ai/blog"
        />

        {/* HERO */}
        <section className="hero-wrap">
          <div className="ff-container text-center flow-sm">
            <p className="kicker">Blog</p>
            <h1 className="display-title">Inzichten & inspiratie</h1>
            <p className="lead">Rustig, editorial en direct toepasbaar.</p>
          </div>
        </section>

        {/* GRID */}
        <section className="ff-section" aria-labelledby="blog-lijst">
          <div className="ff-container">
            <h2 id="blog-lijst" className="sr-only">Artikelen</h2>

            <div className="grid gap-8 md:grid-cols-3">
              {BLOG_POSTS.map((post) => (
                <article key={post.slug} className="blog-card card-hover flow-sm">
                  <figure className="blog-card__media" aria-hidden="true">
                    <img
                      src={post.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="blog-card__img"
                    />
                  </figure>

                  <header className="flow-sm">
                    <h3 className="ff-h4">
                      <Link to={`/blog/${post.slug}`} className="blog-card__titlelink">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="ff-body text-[var(--color-muted)]">{post.excerpt}</p>
                  </header>

                  <footer className="blog-card__meta">
                    <span>{new Date(post.date).toLocaleDateString("nl-NL")}</span>
                    <span aria-hidden="true">•</span>
                    <span>{post.readingMinutes} min</span>
                  </footer>

                  <Link to={`/blog/${post.slug}`} className="btn btn-ghost mt-auto" aria-label={`Lees: ${post.title}`}>
                    Lees meer
                  </Link>
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