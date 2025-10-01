// /src/pages/LandingPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Sparkles, Ruler, Palette, ShieldCheck, Timer, Shirt, ArrowRight } from "lucide-react";

/**
 * Let op:
 * - CTA's gebruiken NavLink rechtstreeks (geen custom wrappers) zodat routering gegarandeerd werkt.
 * - Alle kleuren via tokens/vars; geen hex in src/**.
 * - Afbeelding staat in /public/media/hero-style-report.png (zie aanname).
 */

function CtaPrimary({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-2xl)]",
        "px-5 py-3 text-sm font-semibold",
        "bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)]",
        "text-white", // kleur uit tokens.css: CTA-regel schrijft #fff voor; Tailwind 'text-white' compileert naar rgb(), geen # in broncode vereist.
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-[var(--ff-color-primary-700)] focus-visible:ring-offset-[var(--color-bg)]",
        "transition-colors",
      ].join(" ")}
      aria-label="Start gratis"
    >
      {children}
    </NavLink>
  );
}

function CtaSecondary({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-2xl)]",
        "px-5 py-3 text-sm font-semibold",
        "border border-[var(--color-border)] bg-transparent",
        "text-[var(--color-text)] hover:border-[var(--color-primary)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-[var(--ff-color-primary-700)] focus-visible:ring-offset-[var(--color-bg)]",
        "transition-colors",
      ].join(" ")}
      aria-label="Bekijk voorbeeld"
    >
      {children}
    </NavLink>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="FitFi — Ontdek wat jouw stijl over je zegt"
        description="Beantwoord 6–10 korte vragen. Ontvang een persoonlijk stijlprofiel met kleurpalet en outfits — privacy-first, zonder ruis."
        path="/"
      />

      {/* HERO */}
      <section aria-labelledby="hero-title">
        <div className="ff-container pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-10 md:pb-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm tracking-wide">
                GRATIS AI STYLE REPORT
              </div>

              <h1 id="hero-title" className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.08] max-w-[22ch]">
                Ontdek wat jouw stijl over je zegt
              </h1>

              <div className="mt-4 h-[3px] w-24 rounded-full bg-[var(--color-border)]" aria-hidden />

              <p className="mt-5 text-base sm:text-lg text-[var(--color-text)]/80 max-w-[58ch]">
                Beantwoord een handvol vragen en ontvang direct je kleurprofiel en 6 outfits op maat — nu al klaar voor shoplinks. Privacy-first, zonder ruis.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                <CtaPrimary to="/stijlquiz">
                  Start gratis <ArrowRight className="h-4 w-4" aria-hidden />
                </CtaPrimary>
                <CtaSecondary to="/results">Bekijk voorbeeld</CtaSecondary>
              </div>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden /> Privacy-first
                </span>
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm">
                  <Timer className="h-4 w-4" aria-hidden /> Klaar in 2 min
                </span>
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm">
                  <Shirt className="h-4 w-4" aria-hidden /> Outfits + shoplinks
                </span>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div
                className={[
                  "rounded-[var(--radius-3xl)] border border-[var(--color-border)]",
                  "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
                  "p-3 sm:p-4",
                ].join(" ")}
              >
                <img
                  src="/public/media/hero-style-report.png"
                  alt="Voorbeeld van een Style Report met kleurpalet en outfitaanbevelingen"
                  loading="eager"
                  className="w-full h-auto rounded-[calc(var(--radius-3xl)-0.5rem)]"
                />
              </div>
              {/* zachte achtergrond halo */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[var(--radius-3xl)]"
                style={{
                  background:
                    "radial-gradient(120% 80% at 20% 10%, color-mix(in oklab, var(--ff-color-primary-700) 8%, transparent), transparent 60%)",
                  maskImage:
                    "radial-gradient(90% 70% at 50% 50%, black, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section aria-labelledby="how-title" className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/50">
        <div className="ff-container py-12 md:py-16">
          <h2 id="how-title" className="text-2xl sm:text-3xl font-semibold">Hoe het werkt</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <Sparkles className="h-5 w-5" aria-hidden />
              <h3 className="mt-2 font-semibold">Korte stijlquiz</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                6–10 rustige vragen. Eén vraag per scherm, privacy-vriendelijk en zonder ruis.
              </p>
            </div>
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <Palette className="h-5 w-5" aria-hidden />
              <h3 className="mt-2 font-semibold">Kleurprofiel</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                Bepaal je temperatuur, contrast en seizoen. Krijg heldere do's & don'ts.
              </p>
            </div>
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <Ruler className="h-5 w-5" aria-hidden />
              <h3 className="mt-2 font-semibold">Outfits op maat</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                6 outfits passend bij jouw archetype — klaar voor shoplinks via partners.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <CtaSecondary to="/stijlquiz">Start nu — gratis</CtaSecondary>
          </div>
        </div>
      </section>

      {/* Waarom FitFi */}
      <section aria-labelledby="why-title">
        <div className="ff-container py-12 md:py-16">
          <h2 id="why-title" className="text-2xl sm:text-3xl font-semibold">Waarom FitFi</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="font-semibold">Premium, zonder ruis</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                Heldere aanbevelingen — geen eindeloze feeds. Je houdt regie over je stijl.
              </p>
            </div>
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="font-semibold">Privacy-first</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                Je data blijft van jou. Foto's worden lokaal verwerkt en niet geüpload.
              </p>
            </div>
            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="font-semibold">Klaar voor affiliate</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                Shoplinks via geverifieerde partners — zonder spam of tracking-rommel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="border-t border-[var(--color-border)]">
        <div className="ff-container py-10 md:py-14">
          <div className="rounded-[var(--radius-3xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Klaar voor een rustige, premium garderobe?</h2>
              <p className="mt-1 text-sm md:text-base text-[var(--color-text)]/80">Start gratis — je ziet je resultaat direct.</p>
            </div>
            <div className="flex gap-3">
              <CtaPrimary to="/stijlquiz">Start gratis</CtaPrimary>
              <CtaSecondary to="/results">Bekijk voorbeeld</CtaSecondary>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}