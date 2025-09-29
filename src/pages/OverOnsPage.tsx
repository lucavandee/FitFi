import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import TrustBelt from "@/components/landing/TrustBelt";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import {
  Ruler,
  Palette,
  Calendar,
  Leaf,
  Users,
  ThumbsUp,
} from "lucide-react";

/**
 * Over ons – de over ons pagina vertelt het verhaal achter FitFi.
 *
 * We hergebruiken componenten zoals PageHero, TrustBelt en onze custom
 * useFadeInOnVisible hook om subtiele animaties toe te voegen. De
 * content is opgedeeld in logische secties: introductie (missie),
 * behind the scenes, sustainability & ethics en kernwaarden. Elk
 * artikel heeft een pictogram voor een snellere scanbaarheid en
 * een fade-in effect wanneer het in beeld komt. Tot slot is er een
 * call‑to‑action om bezoekers verder te leiden.
 */
const VALUES = [
  {
    title: "Persoonlijk, niet generiek",
    desc: "We vertalen jouw stijl naar outfits die kloppen – van silhouet tot kleur.",
    icon: Leaf,
  },
  {
    title: "Minimal & warm",
    desc: "Premium, rustig en functioneel. Geen ruis of drukte.",
    icon: Users,
  },
  {
    title: "Eerlijk advies",
    desc: "We linken soms naar shops, maar aanbevelingen blijven stijl‑ en pasvormgedreven.",
    icon: ThumbsUp,
  },
] as const;

export default function OverOnsPage() {
  return (
    <main
      id="main"
      className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]"
    >
      <PageHero
        id="page-about"
        eyebrow="OVER ONS"
        title="Waarom wij om stijl geven"
        subtitle="We maken stijl eenvoudig en eerlijk—met kennis van silhouet & kleur, en respect voor jouw tijd."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Doe de stijlscan", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" },
        ]}
      />

      {/* Vertrouwensbadges direct onder de hero voor extra geruststelling */}
      <section className="ff-container pt-4">
        <TrustBelt />
      </section>

      {/* Ons verhaal */}
      <section className="ff-container py-10 sm:py-12">
        <header className="mb-4 sm:mb-6">
          <h2 className="font-heading text-2xl sm:text-3xl">
            Ons verhaal
          </h2>
        </header>
        <article className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
          <p className="text-[var(--ff-color-text)]/85">
            FitFi is ontstaan uit nieuwsgierigheid: waarom staan bepaalde kleuren sommige huidtypes
            meteen goed, en andere nét niet? We merkten ook hoe tijdrovend het is om door
            eindeloze webshops te scrollen op zoek naar een paar goede, passende outfits. Dat moet
            slimmer kunnen—door kleur en silhouet te combineren met jouw leven en smaak.
          </p>
          <p className="text-[var(--ff-color-text)]/80 mt-3">
            Daarom bouwen we aan een rustige assistent die niet meer schreeuwt, maar uitlegt. Je
            krijgt duidelijke aanbevelingen, met de reden waarom iets werkt—zodat jij zekerder
            kiest en minder koopt wat niet bij je past.
          </p>
        </article>
      </section>

      {/* Behind the scenes */}
      <section className="ff-container py-6 sm:py-10">
        <header className="mb-4">
          <h2 className="font-heading text-2xl sm:text-3xl">
            Behind the scenes
          </h2>
        </header>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              icon: Ruler,
              title: "Silhouet‑logica",
              desc: "We structureren verhoudingen (lengte, proporties, snit) tot simpele regels die rust geven bij keuzes.",
            },
            {
              icon: Palette,
              title: "Kleur & materiaal",
              desc: "We combineren subtone en contrast met stof‑eigenschappen voor draagbare combinaties.",
            },
            {
              icon: Calendar,
              title: "Context & gelegenheid",
              desc: "Werk, weekend, diner—fit en kleur verschuiven mee met je agenda, niet andersom.",
            },
          ].map((item, i) => {
            const { ref, visible } = useFadeInOnVisible<HTMLDivElement>();
            const Icon = item.icon;
            return (
              <article
                key={i}
                ref={ref as any}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease, transform 600ms ease",
                }}
                className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-5 shadow-[var(--ff-shadow-soft)]"
              >
                <Icon size={24} className="text-[var(--ff-color-accent)]" aria-hidden />
                <h3 className="mt-3 font-heading text-lg">
                  {item.title}
                </h3>
                <p className="text-[var(--ff-color-text)]/80 mt-1">
                  {item.desc}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Sustainability & ethics */}
      <section className="ff-container py-6 sm:py-10">
        <header className="mb-4">
          <h2 className="font-heading text-2xl sm:text-3xl">
            Sustainability & ethics
          </h2>
        </header>
        <article className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
          <ul className="grid gap-2 text-[var(--ff-color-text)]/85">
            <li>
              • Minder miskopen door betere keuzes — beter voor jou én het milieu.
            </li>
            <li>
              • Data‑minimalisatie en duidelijke opt‑ins; we verkopen geen data.
            </li>
            <li>
              • Affiliate‑links kunnen voorkomen; advies blijft stijl‑ en pasvorm‑gedreven.
            </li>
            <li>
              • Transparante uitleg: we blijven helder over waarom iets werkt.
            </li>
          </ul>
        </article>

        {/* Kernwaarden */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          {VALUES.map((v, i) => {
            const { ref, visible } = useFadeInOnVisible<HTMLDivElement>();
            const Icon = v.icon;
            return (
              <article
                key={i}
                ref={ref as any}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease, transform 600ms ease",
                }}
                className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] p-6 bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)]"
              >
                <Icon size={24} className="text-[var(--ff-color-accent)]" aria-hidden />
                <h3 className="mt-3 font-heading text-lg text-[var(--ff-color-text)]">
                  {v.title}
                </h3>
                <p className="text-[var(--ff-color-text)]/80 mt-2">
                  {v.desc}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">
            Bekijk prijzen
          </NavLink>
        </div>
      </section>
    </main>
  );
}