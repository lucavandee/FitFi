import React from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import HeroImage from "@/components/media/HeroImage";
import rawHome from "@/content/home.json";
import type { HomeContent } from "@/lib/content/types";

const home = rawHome as HomeContent;

export default function LandingPage() {
  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="FitFi — Ontdek wat jouw stijl over je zegt"
        description={home.heroSubtitle}
        path="/"
      />

      {/* HERO */}
      <section className="relative">
        <div className="ff-container pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-10 sm:pb-12">
          <div className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm tracking-wide">
            GRATIS AI STYLE REPORT
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] max-w-[22ch]">
            {home.heroTitle}
          </h1>

          <div className="mt-4 h-[3px] w-24 rounded-full bg-[var(--color-border)]" aria-hidden />

          <p className="mt-5 text-base sm:text-lg md:text-xl text-[var(--color-text)]/80 max-w-[56ch]">
            {home.heroSubtitle}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            {home.ctas.map((c) => (
              <Button key={c.label} as={NavLink} to={c.to} variant={c.variant} size="lg" aria-label={c.label}>
                {c.label}
              </Button>
            ))}
          </div>

          <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
            {home.badges.map((b, i) => (
              <span key={i} className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">
                {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="ff-container">
          <div className="mt-4 md:mt-6 lg:mt-8 grid md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
                <h2 className="text-lg font-semibold">Voorbeeld van je Style Report</h2>
                <p className="mt-1 text-sm text-[var(--color-text)]/80">
                  Rustig en premium. Focus op pasvorm, kleurpalet en draagbare combinaties — zonder ruis.
                </p>
                <ul className="mt-3 grid gap-2 text-sm" role="list">
                  <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">• Kleurpalet (warm/koel, licht/donker, contrast)</li>
                  <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">• Silhouet & pasvorm-instellingen</li>
                  <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">• 6 outfits op maat + favorieten</li>
                </ul>
              </div>
            </div>

            <div className="order-1 md:order-2 flex justify-center">
              <HeroImage
                src={home.heroImage}
                className="w-full max-w-[520px] h-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
                width={900}
                height={1200}
                eager
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="ff-container pt-16 md:pt-20">
        <h2 className="text-2xl sm:text-3xl font-semibold">Hoe het werkt</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {home.steps.map((s, i) => (
            <div key={i} className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
              <div className="text-sm opacity-60">Stap {i + 1}</div>
              <div className="mt-1 text-base font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waarom FitFi */}
      <section className="ff-container pt-14">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold">Waarom FitFi</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            {home.reasons.map((r, i) => (
              <div key={i} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">{`• ${r.text}`}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + eind-CTA */}
      <section className="ff-container pt-14 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-semibold">Veelgestelde vragen</h2>
            {home.faq.map((f, i) => (
              <details key={i} className="mt-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-[var(--color-text)]/80">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold">Klaar om te starten?</h2>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">Begin gratis — je kunt later altijd finetunen.</p>
            </div>
            <div className="mt-4 flex gap-3">
              {home.ctas.map((c) => (
                <Button key={c.label} as={NavLink} to={c.to} variant={c.variant}>{c.label}</Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}