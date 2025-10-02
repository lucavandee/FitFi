import React from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import rawHome from "@/content/home.json";
import type { HomeContent } from "@/lib/content/types";

const home = rawHome as HomeContent;

type PreviewItem = { id: string; title: string; image: string; caption: string };

const PREVIEW: PreviewItem[] = [
  {
    id: "coat",
    title: "Wool coat",
    image:
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
    caption: "Outerwear · minimal · herfst/winter",
  },
  {
    id: "blouse",
    title: "Silk blouse",
    image:
      "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
    caption: "Top · elegant · office",
  },
  {
    id: "jeans",
    title: "Mom jeans",
    image:
      "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
    caption: "Bottom · high-waist · denim",
  },
  {
    id: "sneakers",
    title: "Minimal sneakers",
    image:
      "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
    caption: "Footwear · clean · daily",
  },
];

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="FitFi — Ontdek wat jouw stijl over je zegt"
        description={home.heroSubtitle}
        path="/"
      />

      {/* HERO — identiek patroon als Prijzen/How-it-works via PageHero */}
      <PageHero
        eyebrow="GRATIS AI STYLE REPORT"
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        align="left"
        as="h1"
        size="lg"
        ctas={home.ctas.map((c) => ({
          label: c.label,
          to: c.to,
          variant: c.variant === "secondary" ? "secondary" : "primary",
          "data-event":
            c.label === "Start gratis" ? "cta_start_free_home" : "cta_view_example_home",
        }))}
      />

      {/* TRUST-CHIPS — compact en direct onder hero */}
      <section aria-label="Kernpunten" className="ff-section pt-2">
        <div className="ff-container flex flex-wrap gap-2">
          {home.badges.map((b, i) => (
            <span
              key={i}
              className="ff-eyebrow"
            >
              {b.text}
            </span>
          ))}
        </div>
      </section>

      {/* MINI STYLE PREVIEW — rust, premium; mobile-first (2×2) → desktop (4-up) */}
      <section aria-label="Mini style preview" className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Mini style preview</h2>
                  <p className="mt-1 text-[var(--color-text)]/80 text-sm">
                    Voorbeeld van draagbare combinaties in jouw smaak — rustig en functioneel.
                  </p>
                </div>
                <NavLink
                  to="/results"
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_view_example_inline"
                >
                  Bekijk volledig voorbeeld
                </NavLink>
              </div>

              {/* Grid: 2×2 op mobiel, 4-up op md+; strakke tegels met SmartImage */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {PREVIEW.map((item) => (
                  <figure
                    key={item.id}
                    className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-soft)]"
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      id={item.id}
                      kind="generic"
                      aspect="4/5"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      containerClassName=""
                      imgClassName=""
                      eager={false}
                    />
                    <figcaption className="px-3 py-2">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-[var(--color-text)]/70">{item.caption}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>

              {/* Contextregel: licht en niet-dominant */}
              <p className="mt-3 text-[var(--color-text)]/70 text-sm">
                Jouw uiteindelijke set wordt afgestemd op je stijlprofiel, seizoen en gelegenheid.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* HOE HET WERKT — behoud bestaande content, compact ritme */}
      <section className="ff-container pt-12 md:pt-16">
        <h2 className="text-2xl sm:text-3xl font-semibold">Hoe het werkt</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {home.steps.map((s, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="text-sm text-[var(--color-text)]/60">Stap {i + 1}</div>
              <div className="mt-1 text-base font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WAAROM — compacte redenen in rustige kaart */}
      <section className="ff-container pt-12">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold">Waarom FitFi</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            {home.reasons.map((r, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
              >
                • {r.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + CTA — afsluiter blijft in dezelfde toon en structuur */}
      <section className="ff-container pt-12 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-semibold">Veelgestelde vragen</h2>
            {home.faq.map((f, i) => (
              <details
                key={i}
                className="mt-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
              >
                <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-[var(--color-text)]/80">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold">Klaar om te starten?</h2>
              <p className="mt-1 text-sm text-[var(--color-text)]/80">
                Begin gratis — je kunt later altijd finetunen.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              {home.ctas.map((c) => (
                <Button key={c.label} as={NavLink} to={c.to} variant={c.variant}>
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}