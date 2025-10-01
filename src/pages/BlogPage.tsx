import React from "react";
import PageHero from "@/components/marketing/PageHero";
import posts from "@/data/blogPosts";
import SmartImage from "@/components/media/SmartImage";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { Heart, Smartphone, Sparkles } from "lucide-react";

// Categorieën voor filter-chips (we tonen ze nog niet interactief, maar het geeft context)
const CATEGORIES = ["Silhouet", "Kleur", "Garderobe", "Gidsen"];

// Extra secties om de blogpagina meer diepgang en premium gevoel te geven.
const BLOG_EXTRA = [
  {
    icon: Heart,
    title: "Comfort & performance",
    desc:
      "Onze content is gebaseerd op premium materialen en high‑performance silhouetten. We laten je zien hoe je kleding kiest die goed voelt én er goed uitziet.",
  },
  {
    icon: Smartphone,
    title: "Minimalistisch design & tech",
    desc:
      "FitFi staat voor rust en vooruitgang: een brug tussen modieuze eenvoud en slimme technologie. Denk aan de minimalistische finesse van Apple gecombineerd met de comfortstandaard van Lululemon.",
  },
  {
    icon: Sparkles,
    title: "Inzichten & inspiratie",
    desc:
      "Onze artikelen zijn kort maar krachtig. Elk stuk biedt je meteen toepasbare inzichten over silhouet, kleurtemperatuur en kapsels, zonder ruis.",
  },
];

// Testimonials om sociale bewijskracht toe te voegen.
const TESTIMONIALS = [
  {
    quote:
      "De blog van FitFi hielp me eindelijk begrijpen waarom sommige outfits me krachtiger laten voelen. Kort, helder en direct toepasbaar.",
    name: "Lotte",
    location: "Amsterdam",
  },
  {
    quote:
      "Ik dacht dat ik alles wist over kleurtemperatuur, maar deze gidsen brachten structuur in mijn keuzes. Less is more!",
    name: "Marcel",
    location: "Enschede",
  },
];

export default function BlogPage() {
  // Voor de extra-secties gebruiken we aparte fades om rules of hooks te respecteren.
  const fade0 = useFadeInOnVisible<HTMLDivElement>();
  const fade1 = useFadeInOnVisible<HTMLDivElement>();
  const fade2 = useFadeInOnVisible<HTMLDivElement>();

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero — styling ongewijzigd, copy aangescherpt voor inspiratie */}
      <PageHero
        id="page-blog"
        eyebrow="INSIGHTS"
        title="Blog"
        subtitle="Praktische gidsen over silhouet, kleur en outfits — premium stijl, nuchtere uitleg."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" },
        ]}
      />

      {/* Filterchips */}
      <section className="ff-container pt-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="px-3 py-1 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text)]/80"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Blog artikelen grid */}
      <section className="ff-container ff-stack-lg py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            // Leesduur schatting (±200 woorden/min).
            const wordCount = p.content.split(/\s+/).length;
            const readingTime = Math.max(2, Math.round(wordCount / 200)) + " min";
            const dt = new Date(p.date);
            const prettyDate = dt.toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <article
                key={p.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
              >
                <a href={`/blog/${p.id}`} className="block" aria-label={`Lees: ${p.title}`}>
                  {/* Afbeelding van het artikel indien beschikbaar, anders placeholder */}
                  {p.imageId ? (
                    <SmartImage
                      id={p.imageId}
                      alt=""
                      className="aspect-[16/9] w-full h-auto"
                      width={1280}
                      height={720}
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-[var(--color-bg)]/40 grid place-items-center">
                      <span className="text-[var(--color-text)]/50 text-sm">Afbeelding</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-[var(--color-text)]/70 text-sm">
                      {prettyDate} • {readingTime}
                    </div>
                    <h2 className="font-montserrat text-lg text-[var(--color-text)] mt-1">
                      {p.title}
                    </h2>
                    <p className="text-[var(--color-text)]/80 mt-1">{p.excerpt}</p>
                    <div className="mt-3">
                      <span className="ff-btn ff-btn-quiet">Lees meer</span>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* Extra inhoudelijke secties voor comfort, tech & inspiratie */}
      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_EXTRA.map((item, idx) => {
            const fade = idx === 0 ? fade0 : idx === 1 ? fade1 : fade2;
            const Icon = item.icon;
            return (
              <div
                key={idx}
                ref={fade.ref as any}
                style={{
                  opacity: fade.visible ? 1 : 0,
                  transform: fade.visible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease, transform 600ms ease",
                }}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
              >
                <Icon size={24} className="text-[var(--ff-color-accent)]" aria-hidden />
                <h3 className="mt-3 font-heading text-lg text-[var(--color-text)]">{item.title}</h3>
                <p className="mt-2 text-[var(--color-text)]/80">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials voor sociale bewijskracht */}
      <section className="ff-container py-10 sm:py-12">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-4">Wat lezers zeggen</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, idx) => (
            <figure
              key={idx}
              className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <blockquote className="italic leading-relaxed text-[var(--color-text)]/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-3 text-sm text-[var(--color-text)]/60">
                — {t.name}, {t.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Callout om bezoekers naar de service te leiden */}
      <section className="ff-container pb-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Blijf op de hoogte</h2>
          <p className="mt-2 text-[var(--color-text)]/80">
            Nieuwe gidsen over silhouet, kleur en outfits. Af en toe, niet elke dag.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
          </div>
        </div>
      </section>
    </main>
  );
}