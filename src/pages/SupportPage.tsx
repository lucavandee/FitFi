// src/pages/SupportPage.tsx
import React from "react";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container py-12 sm:py-14 ff-stack-lg">
        <header className="ff-stack">
          <p className="text-sm text-text/70">We helpen snel en nuchter</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Support</h1>
          <p className="text-text/80 max-w-2xl">
            Vragen over je stijlrapport, outfits of account? Kies wat past — we
            reageren doorgaans binnen één werkdag.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="ff-card p-5">
            <Mail className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">E-mail</h2>
            <p className="text-text/80">Stuur ons je vraag in alle rust.</p>
            <a className="ff-btn ff-btn-primary mt-3" href="mailto:support@fitfi.ai">
              Mail support
            </a>
          </article>

          <article className="ff-card p-5">
            <MessageSquare className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">Bericht</h2>
            <p className="text-text/80">Korte vraag? We lezen mee.</p>
            <a className="ff-btn ff-btn-secondary mt-3" href="/contact">
              Stuur bericht
            </a>
          </article>

          <article className="ff-card p-5">
            <HelpCircle className="w-5 h-5 text-text/70" />
            <h2 className="mt-2 font-semibold">FAQ</h2>
            <p className="text-text/80">Direct antwoord op veelgestelde vragen.</p>
            <a className="ff-btn ff-btn-secondary mt-3" href="/veelgestelde-vragen">
              Naar FAQ
            </a>
          </article>
        </div>

        <section aria-labelledby="tips" className="ff-stack-lg">
          <h2 id="tips" className="font-heading text-xl sm:text-2xl">
            Sneller geholpen met deze tips
          </h2>
          <ul className="ff-prose">
            <li>Voeg een screenshot toe van de outfit of pagina waar je vraag over gaat.</li>
            <li>Omschrijf kort wat je al hebt geprobeerd.</li>
            <li>Laat weten welke maat/fit je meestal draagt voor context.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}