// /src/pages/CookiesPage.tsx
import React from "react";

export default function CookiesPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Helder cookiebeleid</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Cookies</h1>
          <p className="text-text/80 max-w-2xl">
            We gebruiken functionele en analytische cookies. Geen marketing-tracking van derde partijen.
          </p>
        </header>

        <article className="ff-card p-5 ff-prose">
          <h2>Soorten cookies</h2>
          <ul>
            <li><strong>Functioneel:</strong> sessie, taal, voorkeuren</li>
            <li><strong>Analytisch:</strong> geaggregeerd gebruik om te verbeteren</li>
          </ul>

          <h2>Voorkeuren beheren</h2>
          <p>Je kunt cookies beheren via je browserinstellingen. Functionele cookies zijn nodig om FitFi te laten werken.</p>

          <h2>Bewaartermijn</h2>
          <p>Kort en proportioneel. Technische logs verlopen automatisch.</p>
        </article>
      </section>
    </main>
  );
}