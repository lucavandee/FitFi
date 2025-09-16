// src/pages/FeedPage.tsx
import React from "react";
import { CheckCircle } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

const cards = [
  {
    title: "Smart casual — Italiaans",
    body: "Taupe knit • rechte pantalon • witte sneaker.",
    why: "De warme taupe kleurt mooi bij een warme/neurale huid; het rechte silhouet verlengt en oogt minimal chic.",
  },
  {
    title: "Weekend relaxed",
    body: "Heavy tee • denim overshirt • suède sneaker.",
    why: "Structuur in denim + suède geeft diepte; kleuren blijven rustig binnen je warme neutraal.",
  },
];

const FeedPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section" aria-labelledby="feed-title">
          <div className="container">
            <h1 id="feed-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">Outfit feed</h1>
            <p className="lead mt-3">Scroll door recente outfit-ideeën en korte uitleg waarom ze werken.</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <article key={c.title} className="card">
                  <div className="skel" style={{ aspectRatio: "4/5" }} aria-hidden="true" />
                  <div className="card__inner">
                    <h2 className="card__title">{c.title}</h2>
                    <p className="card__text">{c.body}</p>
                    <p className="mt-3 text-sm">
                      <strong>Waarom dit past:</strong> {c.why}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                      <span>Seizoen-ready</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};
export default FeedPage;