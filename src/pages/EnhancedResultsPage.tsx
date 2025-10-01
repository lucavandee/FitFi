// /src/pages/EnhancedResultsPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Bookmark, BookmarkCheck, Share2, Info } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { getSeedOutfits, OutfitSeed } from "@/lib/quiz/seeds";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** 4:5 visual placeholder — klaar voor SmartImage */
function OutfitVisual({ label }: { label: string }) {
  return (
    <div role="img" aria-label={label} className="w-full aspect-[4/5] rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)]" />
  );
}

function SectionCard({
  id, title, subtitle, children,
}: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] pt-8 sm:pt-9 pb-7 px-5 sm:px-6"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <header className="mb-3">
        <h2 id={id ? `${id}-title` : undefined} className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-[var(--color-text)]/70">{subtitle}</p> : null}
      </header>
      <div className="text-sm">{children}</div>
    </section>
  );
}

export default function EnhancedResultsPage() {
  // Schrijf "last updated" zodra je hier komt.
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString()); } catch {}
  }, []);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE) ?? "Smart Casual";

  // Bereid outfits voor op basis van quiz; fallback naar een generieke set
  const seeds: OutfitSeed[] = React.useMemo(() => {
    if (color) return getSeedOutfits(color, archetype);
    // Fallback: Smart Casual + zachte tonals
    return getSeedOutfits({
      temperature: "neutraal",
      value: "medium",
      contrast: "laag",
      chroma: "zacht",
      season: "zomer",
      paletteName: "Soft Cool Tonals (neutraal)",
      notes: ["Tonal outfits met zachte texturen.", "Vermijd harde contrasten."],
    }, "Smart Casual");
  }, [color, archetype]);

  const [favs, setFavs] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]"); } catch { return []; }
  });

  function toggleFav(id: string) {
    setFavs((curr) => {
      const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
      try { localStorage.setItem("ff_fav_outfits", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function sharePage() {
    const url = typeof window !== "undefined" ? window.location.href : "https://fitfi.ai/results";
    if (navigator.share) { navigator.share({ title: "Mijn FitFi resultaten", url }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(() => {}); }
  }

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo title="Jouw resultaten — FitFi" description="Jouw kleurprofiel en stijl-archetype met rustige, premium outfits." path="/results" />
      <PageHero
        eyebrow="RESULTATEN"
        title="Outfits op maat — rustig en premium"
        subtitle="Eenvoudig en helder: focus op silhouet, proportie en draagbaarheid."
        align="left"
        size="sm"
        ctas={[{ label: "Herstart quiz", to: "/stijlquiz", variant: "secondary" }]}
        note={
          <button
            type="button"
            onClick={sharePage}
            className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
            aria-label="Deel resultaten"
          >
            <Share2 className="w-4 h-4" aria-hidden /> Deel
          </button>
        }
      />

      <section className="ff-container pt-16 md:pt-20 lg:pt-24 pb-20">
        {/* Profiel-samenvatting */}
        <div className="mx-auto max-w-[1100px] grid gap-8">
          <SectionCard
            id="profile"
            title="Jouw kleurprofiel"
            subtitle={color ? color.paletteName : "Standaard palet (quiz nog niet voltooid)"}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Seizoen:</strong> { (color?.season ?? "zomer") } • <strong>Temperatuur:</strong> { (color?.temperature ?? "neutraal") }
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Contrast:</strong> { (color?.contrast ?? "laag") } • <strong>Lichtheid:</strong> { (color?.value ?? "medium") }
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm" role="list">
              {(color?.notes ?? ["Tonal outfits met zachte texturen.", "Vermijd harde contrasten."]).slice(0, 3).map((n, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-text)]/40" />
                  <p className="flex-1">{n}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Outfits */}
        <div className="mx-auto mt-8 max-w-[1100px] grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {seeds.map((o) => {
            const active = favs.includes(o.id);
            return (
              <article key={o.id} className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5">
                <OutfitVisual label={o.title} />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{o.title}</h3>
                    <p className="mt-0.5 text-sm text-[var(--color-text)]/70">{o.vibe}</p>
                  </div>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm"
                    aria-pressed={active}
                    onClick={() => toggleFav(o.id)}
                  >
                    {active ? (<><BookmarkCheck className="w-4 h-4" aria-hidden /> Bewaard</>) : (<><Bookmark className="w-4 h-4" aria-hidden /> Bewaren</>)}
                  </button>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text)]/80">{o.notes}</p>
                <div className="mt-3">
                  <NavLink to="#profile" className="text-sm underline hover:no-underline inline-flex items-center gap-1">
                    <Info className="w-4 h-4" aria-hidden /> Waarom dit werkt
                  </NavLink>
                </div>
              </article>
            );
          })}
        </div>

        {/* Favorieten */}
        <section
          id="favorites"
          className="mx-auto mt-10 max-w-[1100px] rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] pt-6 pb-6 px-5 sm:px-6"
          aria-labelledby="favorites-title"
        >
          <h2 id="favorites-title" className="text-base font-semibold">Je favorieten</h2>
          {favs.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-text)]/70">
              Nog geen favorieten. Klik op <em>Bewaren</em> bij een outfit om te starten.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2" role="list">
              {seeds.filter((o) => favs.includes(o.id)).map((o) => (
                <li key={o.id}>
                  <span className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm">
                    <BookmarkCheck className="w-4 h-4" aria-hidden /> {o.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}