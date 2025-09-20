import React from "react";
import Seo from "@/components/Seo";

type ShopLink = { label: string; href: string };
type Outfit = {
  id: string;
  title: string;
  imageUrl?: string;
  items?: { name: string; note?: string }[];
  shop?: ShopLink;
};

const defaults = {
  title: "Jouw stijlprofiel is klaar",
  sub: "Rustig, modern en tijdloos — met aandacht voor silhouet, materiaal en kleurtemperatuur.",
  badges: ["Koel neutraal", "Modern-rustig", "Smart casual"],
  why: [
    "Silhouet: taps toelopend i.p.v. skinny oogt evenwichtiger.",
    "Materiaal: matte breisels en suède verzachten — glans vermijden.",
    "Kleur: koele neutrale basis (off-white, grijsblauw, antraciet) werkt het best.",
    "Archetype: modern-rustig; vermijd grote logo's en harde contrasten."
  ],
  outfits: [
    {
      id: "o1",
      title: "Minimal modern (casual smart)",
      items: [
        { name: "Gebreide polo", note: "lichtgewicht, zacht" },
        { name: "Tapered chino", note: "enkelvrij, clean" },
        { name: "Suède sneaker", note: "warm grijs" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    },
    {
      id: "o2",
      title: "Soft monochrome (workday)",
      items: [
        { name: "Fijngebreide crew", note: "koel off-white" },
        { name: "Wolmix pantalon", note: "rechte pijp" },
        { name: "Leren loafer", note: "minimal buckle" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    },
    {
      id: "o3",
      title: "Athflow weekend",
      items: [
        { name: "Merino zip hoodie" },
        { name: "Tech jogger", note: "mat, geen glans" },
        { name: "Retro runner" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    }
  ] as Outfit[]
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="chip">{children}</span>
);

const WhyItFits: React.FC<{ bullets: string[] }> = ({ bullets }) => (
  <aside className="card p-6" aria-labelledby="why-title">
    <h2 id="why-title" className="text-lg font-semibold mb-3">Waarom dit past</h2>
    <ul className="space-y-2 leading-7">
      {bullets.map((b, i) => (
        <li key={i} className="flex items-start gap-2">
          <span aria-hidden className="mt-2 inline-block h-2 w-2 rounded-full"
            style={{ background: "color-mix(in oklab, var(--ff-color-primary-700) 60%, var(--color-accent))" }} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </aside>
);

const OutfitCard: React.FC<{ outfit: Outfit }> = ({ outfit }) => {
  const { title, imageUrl, items = [], shop } = outfit;
  return (
    <article className="card overflow-hidden h-full flex flex-col">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            width={960}
            height={960}
            decoding="async"
            loading="lazy"
            className="block w-full h-auto aspect-square object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="w-full aspect-square rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]"
            style={{ background: "linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-900))" }}
          />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        {items.length > 0 && (
          <ul className="text-sm text-[var(--color-text-subtle)] space-y-1 mb-4">
            {items.map((it, i) => (
              <li key={`${it.name}-${i}`}>
                <span className="font-medium text-[var(--color-text)]">{it.name}</span>
                {it.note ? <span> — {it.note}</span> : null}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto">
          {shop ? (
            <a
              href={shop.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn btn-ghost"
              aria-label={`Shop: ${shop.label}`}
            >
              {shop.label}
            </a>
          ) : (
            <div className="chip">Shoplink volgt</div>
          )}
        </div>
      </div>
    </article>
  );
};

const ResultsPage: React.FC = () => {
  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Jouw AI Style Report | FitFi"
        description="Je persoonlijke stijlprofiel met outfits en shoplinks — inclusief heldere uitleg waarom het past."
        canonical="https://fitfi.ai/results"
      />

      {/* Hero/editorial header */}
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">Style Report</p>
            <h1 className="section-title">{defaults.title}</h1>
            <p className="section-intro">{defaults.sub}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {defaults.badges.map((b) => <Chip key={b}>{b}</Chip>)}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/onboarding" className="btn btn-primary">Volgende outfit</a>
              <a href="/pricing" className="btn btn-ghost">Meer outfits met Pro</a>
            </div>

            <div className="mt-6 max-w-2xl">
              <WhyItFits bullets={defaults.why} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative w-full ml-auto max-w-[680px]">
              <div
                aria-hidden
                className="block w-full h-auto aspect-[4/3] rounded-[var(--radius-2xl)] shadow-[var(--shadow-soft)]"
                style={{ background: "linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-900))" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-[82%] -translate-x-1/2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Outfits grid */}
      <section className="ff-section bg-white">
        <div className="ff-container">
          <h2 className="text-xl font-semibold mb-4">Outfits die nu werken voor jou</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {defaults.outfits.map((o) => <OutfitCard key={o.id} outfit={o} />)}
          </div>
        </div>
      </section>

      {/* CTA rail */}
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container flex flex-wrap items-center justify-between gap-4">
          <p className="section-intro m-0">Wil je meer varianten per silhouet en seizoen?</p>
          <a href="/pricing" className="btn btn-primary">Ontgrendel premium outfits</a>
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;