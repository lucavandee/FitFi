// src/pages/BlogPage.tsx
import React from "react";
import Seo from "@/components/Seo";

export default function BlogPage() {
  return (
    <main className="ff-section">
      <Seo
        title="Blog — FitFi"
        description="Onze laatste artikelen over stijl, pasvorm en AI-styling."
        canonical="https://fitfi.ai/blog"
      />
      <div className="ff-container ff-container--wide">
        <header className="band" style={{ paddingBottom: "1rem" }}>
          <h1>Blog</h1>
          <p className="muted" style={{ marginTop: ".4rem" }}>
            Inzichten, gidsen en nieuws — zorgvuldig samengesteld.
          </p>
        </header>

        {/* Placeholder grid: vervang met je echte component / fetch */}
        <section className="grid grid-3" style={{ marginTop: "1.2rem" }}>
          {[...Array(6)].map((_, i) => (
            <article key={i} className="card">
              <div className="card__body">
                <h3 className="card__title">Artikel #{i + 1}</h3>
                <p className="card__meta">Teaser tekst van het artikel.</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}