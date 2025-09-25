import React from "react";

export default function PrivacyPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Transparant en nuchter</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Privacyverklaring</h1>
          <p className="text-text/80 max-w-2xl">
            We verzamelen zo min mogelijk gegevens, uitsluitend om FitFi te laten werken en verbeteren. We verkopen nooit data.
          </p>
        </header>

        <article className="ff-card p-5 ff-prose">
          <h2>Welke gegevens verwerken we?</h2>
          <ul>
            <li>Accountgegevens (e-mail, wachtwoord-hash)</li>
            <li>Stijlprofiel antwoorden (6 vragen)</li>
            <li>Technische logs (beperkt, voor foutanalyse)</li>
          </ul>

          <h2>Waarom verwerken we die gegevens?</h2>
          <p>Om outfits te genereren, je voorkeuren te bewaren en de app te beveiligen/verbeteren.</p>

          <h2>Hoe lang bewaren we je gegevens?</h2>
          <p>Zo kort mogelijk. Je kunt verwijderen en export aanvragen via support.</p>

          <h2>Jouw rechten</h2>
          <ul>
            <li>Inzage, rectificatie en dataportabiliteit</li>
            <li>Verwijderen van je account en gegevens</li>
            <li>Bezwaar maken tegen verwerking</li>
          </ul>

          <h2>Contact</h2>
          <p>Vragen? Mail <a href="mailto:privacy@fitfi.ai">privacy@fitfi.ai</a>.</p>
        </article>
      </section>
    </main>
  );
}