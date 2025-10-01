// /src/pages/EnhancedResultsPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Bookmark, BookmarkCheck, Share2, Info } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";

/**
 * Doel van dit bestand:
 * - Visueel veel rustiger: geen toolbars/tabs, minder iconen/knoppen.
 * - Sterke hiërarchie: hero → grid met outfits → korte uitleg → kleine favorieten → pasvorm.
 * - Ruime, consistente spacing; zachte kaarten met één primaire actie per kaart (Bewaren).
 * - Behoudt: timestamp write voor dashboard + favorieten met localStorage.
 */

type Outfit = {
  id: string;
  title: string;
  vibe: string;     // korte contextregel
  notes: string;    // 1 zin, geen bullets
};

const OUTFITS: Outfit[] = [
  { id: "o1", title: "Clean Casual",     vibe: "Smart-casual",   notes: "Neutrals en rustige textuur — draagbaar elke dag." },
  { id: "o2", title: "Office Minimal",   vibe: "Werk/meeting",   notes: "Strakke lijnen met laag contrast voor focus." },
  { id: "o3", title: "Weekend Uniform",  vibe: "Ontspannen",     notes: "Comfortabel maar geordend; subtiele structuur." },
  { id: "o4", title: "Monochrome Light", vibe: "Tonal",          notes: "Lang silhouet in 2 lagen; rustig en clean." },
  { id: "o5", title: "Warm Neutral Mix", vibe: "Casual",         notes: "Warme neutrale mix; zacht contrast." },
  { id: "o6", title: "Sporty Sharp",     vibe: "Sportief-net",   notes: "Clean sportswear zonder schreeuwerige branding." },
];

/** Favorieten helpers */
function readFavs(): string[] {
  try { return JSON.parse(window.localStorage.getItem("ff_fav_outfits") || "[]"); } catch { return []; }
}
function writeFavs(ids: string[]) {
  try { window.localStorage.setItem("ff_fav_outfits", JSON.stringify(ids)); } catch {}
}

/** Minimalistische beeldplaceholder (geen externe assets nodig). */
function OutfitVisual({ label }: { label: string }) {
  return (
    <div
      className={[
        "relative w-full aspect-[4/5]",
        "rounded-[var(--radius-2xl)]",
        "border border-[var(--color-border)]",
        "bg-[var(--color-bg)]",
      ].join(" ")}
      aria-label={label}
      role="img"
    />
  );
}

export default function EnhancedResultsPage() {
  // Markeer "laatst bijgewerkt" zodra deze pagina geopend wordt.
  React.useEffect(() => {
    try { window.localStorage.setItem("ff_results_ts", Date.now().toString()); } catch {}
    track("view_results");
  }, []);

  const [favs, setFavs] = React.useState<string[]>(() => readFavs());
  const toggleFav = (id: string) => {
    setFavs(curr => {
      const next = curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id];
      writeFavs(next);
      track(curr.includes(id) ? "favorite_remove" : "favorite_add", { id });
      return next;
    });
  };

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://fitfi.ai/results";
    track("share_results");
    if (navigator.share) { navigator.share({ title: "Mijn FitFi resultaten", url }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(() => {}); }
  };

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Jouw resultaten — FitFi"
        description="Rustige, premium presentatie van jouw outfits en kernuitleg."
        path="/results"
      />

      {/* HERO — heel clean: slechts één secundaire CTA en een discrete deelknop */}
      <PageHero
        eyebrow="RESULTATEN"
        title="Outfits op maat — rustig en premium"
        subtitle="We houden het eenvoudig. Focus op silhouet, proportie en draagbaarheid."
        align="left"
        size="sm"
        ctas={[{ label: "Dashboard", to: "/dashboard", variant: "secondary" }]}
        note={
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
            aria-label="Deel resultaten"
          >
            <Share2 className="w-4 h-4" aria-hidden />
            Deel
          </button>
        }
      />

      {/* CONTENT — royale afstand tot de hero voor adem */}
      <section className="ff-container pt-16 md:pt-20 lg:pt-24 pb-20">
        {/* GRID met outfits — alleen primaire info + één actie */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {OUTFITS.map(o => {
            const active = favs.includes(o.id);
            return (
              <article
                key={o.id}
                className={[
                  "rounded-[var(--radius-2xl)]",
                  "border border-[var(--color-border)]",
                  "bg-[var(--color-surface)]",
                  "shadow-[var(--shadow-soft)]",
                  "p-4 sm:p-5",
                ].join(" ")}
              >
                <OutfitVisual label={o.title} />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">{o.title}</h2>
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

                {/* Eén rustige link naar uitleg—geen extra knoppenrij */}
                <div className="mt-3">
                  <NavLink to="#uitleg" className="text-sm underline hover:no-underline inline-flex items-center gap-1">
                    <Info className="w-4 h-4" aria-hidden /> Waarom dit werkt
                  </NavLink>
                </div>
              </article>
            );
          })}
        </div>

        {/* UITLEG — kort en luchtig, geen ruis */}
        <section
          id="uitleg"
          className={[
            "mt-14 lg:mt-16",
            "rounded-[var(--radius-2xl)]",
            "border border-[var(--color-border)]",
            "bg-[var(--color-surface)]",
            "shadow-[var(--shadow-soft)]",
            "pt-8 sm:pt-9 pb-6 sm:pb-7 px-5 sm:px-6",
          ].join(" ")}
          aria-labelledby="uitleg-title"
        >
          <header className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 text-[var(--color-text)]/90">
              <Info className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h2 id="uitleg-title" className="text-lg font-semibold">Waarom dit voor je werkt</h2>
              <p className="mt-0.5 text-sm text-[var(--color-text)]/70">Kernprincipes die je outfits rustig en sterk maken.</p>
            </div>
          </header>

          <ul className="grid gap-2 text-sm" role="list">
            <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              Silhouet: max. 2 lagen; bovenlaag iets langer voor visuele lengte.
            </li>
            <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              Textuur: combineer <strong>glad</strong> met <strong>gebreid</strong> — diepte zonder drukte.
            </li>
            <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              Kleur: werk tonal met 1 warme accenttint (klein oppervlak).
            </li>
          </ul>
        </section>

        {/* FAVORIETEN — kleine, rustige lijst (chips), geen extra kaarten */}
        <section
          id="favorites"
          className={[
            "mt-10",
            "rounded-[var(--radius-2xl)]",
            "border border-[var(--color-border)]",
            "bg-[var(--color-surface)]",
            "shadow-[var(--shadow-soft)]",
            "pt-6 pb-5 px-5 sm:px-6",
          ].join(" ")}
          aria-labelledby="favorites-title"
        >
          <h2 id="favorites-title" className="text-base font-semibold">Je favorieten</h2>
          {favs.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-text)]/70">
              Nog geen favorieten. Klik op <em>Bewaren</em> bij een outfit om te starten.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2" role="list">
              {OUTFITS.filter(o => favs.includes(o.id)).map(o => (
                <li key={o.id}>
                  <span className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm">
                    <BookmarkCheck className="w-4 h-4" aria-hidden /> {o.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* PASVORM — beknopt en kalm */}
        <section
          id="fit"
          className={[
            "mt-10",
            "rounded-[var(--radius-2xl)]",
            "border border-[var(--color-border)]",
            "bg-[var(--color-surface)]",
            "shadow-[var(--shadow-soft)]",
            "pt-6 pb-5 px-5 sm:px-6",
          ].join(" ")}
          aria-labelledby="fit-title"
        >
          <h2 id="fit-title" className="text-base font-semibold">Pasvorm-instellingen</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              <span>Bovenlaag</span><span className="opacity-70">Regular-slim</span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              <span>Broek</span><span className="opacity-70">Tapered</span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
              <span>Lengte</span><span className="opacity-70">Licht cropped (–2 cm)</span>
            </div>
          </div>
          <div className="mt-4">
            <Button as={NavLink} to="/results?refresh=1" variant="secondary" onClick={() => track("regenerate_results")}>
              Genereer opnieuw
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}