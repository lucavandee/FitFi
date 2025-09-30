import React from "react";

export default function AboutPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)]">
      <section className="ff-container px-4 md:px-6 ff-page-hero">
        <span className="ff-eyebrow">Over ons</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Nuchter. Premium. Persoonlijk.</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Wij bouwen AI-stijladvies dat je echt helpt: duidelijk, smaakvol en zonder ruis. Jouw tijd en privacy staan voorop.
        </p>
      </section>

      <section className="ff-container px-4 md:px-6 ff-section">
        <article className="prose prose-invert max-w-none">
          <p className="text-[var(--color-text)]">
            FitFi is ontworpen als een premium, rustig en betrouwbaar platform dat je stijlkeuzes eenvoudiger maakt.
            We combineren slimme modellen met een minimalistische UX en transparante uitleg bij elke outfit.
          </p>
        </article>
      </section>
    </main>
  );
}