import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section id="hero" className="bg-app">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
        {/* Copy */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-ui bg-[color:var(--overlay-accent-08a)] px-3 py-1 text-sm text-ink">
              <span aria-hidden="true">✨</span>
              Gratis AI Style Report
            </span>
          </div>

          <h1 className="ff-heading text-ink text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            Ontdek wat<br />jouw stijl<br />over je zegt
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-muted">
            Krijg in 2&nbsp;minuten een gepersonaliseerd AI-rapport dat laat zien
            hoe jouw kledingkeuzes je persoonlijkheid weerspiegelen — inclusief
            concrete outfits en shopbare aanbevelingen.
          </p>

          {/* Benefits */}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink">
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 style={{ color: "var(--color-success)" }} aria-hidden="true" />
              100% Gratis
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 style={{ color: "var(--color-success)" }} aria-hidden="true" />
              2 Minuten
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 style={{ color: "var(--color-success)" }} aria-hidden="true" />
              Direct Resultaat
            </li>
          </ul>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="btn btn-primary btn-lg primary-cta"
              data-variant="primary"
              aria-label="Start de stijltest en ontvang je AI Style Report"
            >
              Ontvang je AI Style Report
            </Link>

            <Link
              to="/hoe-het-werkt"
              className="btn btn-ghost btn-lg"
              data-variant="ghost"
              aria-label="Lees hoe FitFi werkt"
            >
              Hoe het werkt
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted">
            Geen creditcard vereist · Privacy gegarandeerd · 10.000+ rapporten gegenereerd
          </p>
        </div>

        {/* Visual */}
        <div className="lg:col-span-5">
          <div className="hero-shell relative mx-auto w-full max-w-md overflow-hidden">
            <picture>
              {/* Gebruik je bestaande hero-asset in /public; deze src werkt zonder bundel-imports */}
              <img
                src="/images/hero/nova.jpg"
                alt="Nova AI — jouw stylist"
                loading="eager"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </picture>

            {/* Match badge */}
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 lg:left-auto lg:right-4 lg:translate-x-0">
              <div className="surface flex items-center gap-2 rounded-[var(--radius-lg)] border border-ui px-3 py-2 shadow-soft">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 20%, var(--color-success) 80%)" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div className="text-ink">
                  <div className="text-sm font-semibold leading-none">95% Match</div>
                  <div className="text-xs text-muted leading-none mt-1">Match</div>
                </div>
              </div>
            </div>

            {/* Nova caption */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 lg:left-4 lg:translate-x-0">
              <div className="surface rounded-[var(--radius-lg)] border border-ui px-3 py-2 shadow-soft">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">🔮</span>
                  <div className="text-ink text-sm">
                    <div className="font-semibold leading-none">Nova AI</div>
                    <div className="text-xs text-muted leading-none mt-1">Jouw stylist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Small note to ensure spacing under visual on small screens */}
          <div className="h-2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;