// src/pages/HelpCenterPage.tsx
import React from "react";
import { Search, Palette, Shirt, ListChecks } from "lucide-react";

type Topic = { icon: React.ReactNode; title: string; desc: string; href: string };

const TOPICS: Topic[] = [
  { icon: <Palette className="w-5 h-5" />, title: "Kleur & combinaties", desc: "Warm/koel, contrast en combinatielogica.", href: "/help/kleur" },
  { icon: <Shirt className="w-5 h-5" />, title: "Silhouet & pasvorm", desc: "Proportie, lengte en materialen uitgelegd.", href: "/help/silhouet" },
  { icon: <ListChecks className="w-5 h-5" />, title: "Capsules & outfits", desc: "Capsule-denken en outfits per gelegenheid.", href: "/help/capsules" },
];

export default function HelpCenterPage() {
  const [q, setQ] = React.useState("");

  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Helder, toegankelijk en toepasbaar</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Helpcentrum</h1>
          <p className="text-text/80 max-w-2xl">
            Korte gidsen en antwoorden op praktische vragen. Geen jargon, wél rust in je keuzes.
          </p>
        </header>

        {/* Search (non-functional, a11y-ok) */}
        <form role="search" className="ff-card p-4 md:p-5">
          <label htmlFor="help-search" className="sr-only">
            Zoeken in het helpcentrum
          </label>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-text/70" />
            <input
              id="help-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent outline-none text-text placeholder:text-text/60"
              placeholder="Zoek naar 'kleur', 'capsule', 'pasvorm'…"
              aria-label="Zoeken in het helpcentrum"
            />
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          {TOPICS.map((t) => (
            <a key={t.href} href={t.href} className="ff-card p-5">
              <div className="text-text/70">{t.icon}</div>
              <h2 className="mt-2 font-semibold">{t.title}</h2>
              <p className="text-text/80">{t.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}