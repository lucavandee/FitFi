import React from "react";

export default function TermsPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Eerlijk en duidelijk</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Algemene voorwaarden</h1>
          <p className="text-text/80 max-w-2xl">
            De spelregels van onze dienst in begrijpelijke taal. Kort, nuchter en zonder verrassingen.
          </p>
        </header>

        <article className="ff-card p-6 ff-prose max-w-4xl">
          <h2 className="font-heading text-xl text-text">Dienst</h2>
          <p className="text-text/90">
            FitFi levert stijladvies en outfitvoorstellen op basis van je input. Je behoudt controle over wat je koopt.
          </p>

          <h2 className="font-heading text-xl text-text">Gebruik</h2>
          <ul className="text-text/90">
            <li>Je account is persoonlijk; delen is niet toegestaan.</li>
            <li>Misbruik (scraping, fraude) is verboden.</li>
            <li>We verbeteren de dienst continu; features kunnen wijzigen.</li>
          </ul>

          <h2 className="font-heading text-xl text-text">Betaling/Abonnement</h2>
          <p className="text-text/90">
            Maandelijks of jaarlijks. Opzeggen kan op elk moment per eind van de periode.
          </p>

          <h2 className="font-heading text-xl text-text">Aansprakelijkheid</h2>
          <p className="text-text/90">
            We streven naar juistheid en beschikbaarheid; indirecte schade is uitgesloten binnen de wettelijke grenzen.
          </p>
        </article>
      </section>
    </main>
  );
}