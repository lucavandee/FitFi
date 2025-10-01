// /src/pages/EnhancedResultsPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Bookmark, BookmarkCheck, Share2, Info } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";

/**
 * Clean, minimal Results:
 * - Geen toolbars/toggles of "shop"-knoppen.
 * - Outfits met één primaire actie (Bewaren) + korte context.
 * - Uitleg en Pasvorm: platte typografie (geen pill-chips), dunne delers.
 * - Royale sectie-afstand; consistente card-styling.
 */

type Outfit = { id: string; title: string; vibe: string; notes: string };
const OUTFITS: Outfit[] = [
  { id: "o1", title: "Clean Casual",     vibe: "Smart-casual",  notes: "Neutrals en rustige textuur — draagbaar elke dag." },
  { id: "o2", title: "Office Minimal",   vibe: "Werk/meeting",  notes: "Strakke lijnen met laag contrast voor focus." },
  { id: "o3", title: "Weekend Uniform",  vibe: "Ontspannen",    notes: "Comfortabel maar geordend; subtiele structuur." },
  { id: "o4", title: "Monochrome Light", vibe: "Tonal",         notes: "Lang silhouet in 2 lagen; rustig en clean." },
  { id: "o5", title: "Warm Neutral Mix", vibe: "Casual",        notes: "Warme neutrale mix; zacht contrast." },
  { id: "o6", title: "Sporty Sharp",     vibe: "Sportief-net",  notes: "Clean sportswear — zonder schreeuwerige branding." },
];

function readFavs(): string[] {
  try { return JSON.parse(window.localStorage.getItem("ff_fav_outfits") || "[]"); } catch { return []; }
}
function writeFavs(ids: string[]) {
  try { window.localStorage.setItem("ff_fav_outfits", JSON.stringify(ids)); } catch {}
}

/** Minimal visual placeholder (4:5) — geen externe assets nodig */
function OutfitVisual({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={[
        "w-full aspect-[4/5] rounded-[var(--radius-2xl)]",
        "border border-[var(--color-border)] bg-[var(--color-bg)]",
      ].join(" ")}
    />
  );
}

export default function EnhancedResultsPage() {
  // Schrijf 'last updated' voor Dashboard
  React.useEffect(() => {
    try { window.localStorage.setItem("ff_results_ts", Date.now().toString()); } catch {}
    track("view_results");
  }, []);

  const [favs, setFavs] = React.useState<string[]>(() => readFavs());
  const toggleFav = (id: string) => {
    setFavs(curr => {
      const exists = curr.includes(id);
      const next = exists ? curr.filter(x => x !== id) : [...curr, id];
      writeFavs(next);
      track(exists ? "favorite_remove" : "favorite_add", { id });
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

      <PageHero
        eyebrow="RESULTATEN"
        title="Outfits op maat — rustig en premium"
        subtitle="Eenvoudig en helder: focus op silhouet, proportie en draagbaarheid."
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

      {/* Content met royale ademruimte */}
      <section className="ff-container pt-16 md:pt-20 lg:pt-24 pb-20">
        {/* Outfits — enkel primaire info en 1 actie */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {OUTFITS.map(o => {
            const active = favs.includes(o.id);
            return (
              <article
                key={o.id}
                className={[
                  "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
                  "bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5",
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
                <div className="mt-3">
                  <NavLink to="#uitleg" className="text-sm underline hover:no-underline inline-flex items-center gap-1">
                    <Info className="w-4 h-4" aria-hidden /> Waarom dit werkt
                  </NavLink>
                </div>
              </article>
            );
          })}
        </div>

        {/* Waarom dit werkt — platte typografie, geen pill-chips */}
        <section
          id="uitleg"
          className={[
            "mt-16",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
            "pt-8 sm:pt-9 pb-7 px-5 sm:px-6",
          ].join(" ")}
          aria-labelledby="uitleg-title"
        >
          <header className="mb-3">
            <h2 id="uitleg-title" className="text-lg font-semibold">Waarom dit voor je werkt</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text)]/70">Kern: proportie, rustige texturen en een zachte tonaliteit.</p>
          </header>

          <ul className="mt-3 space-y-3 text-sm" role="list">
            {[
              "Silhouet: max. 2 lagen; bovenlaag ±1/3 langer voor visuele lengte.",
              "Textuur: combineer glad en gebreid voor diepte zonder drukte.",
              "Kleur: werk tonal (licht-neutraal) met 1 warme accenttint.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-text)]/40" />
                <p className="flex-1">{t}</p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-[var(--color-text)]/70">
            Dit is een startpunt — jouw favorieten sturen de volgende generatie outfits.
          </p>
        </section>

        {/* Pasvorm — duidelijke dl met subtiele scheidingslijnen */}
        <section
          id="fit"
          className={[
            "mt-10",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
            "pt-8 sm:pt-9 pb-7 px-5 sm:px-6",
          ].join(" ")}
          aria-labelledby="fit-title"
        >
          <h2 id="fit-title" className="text-lg font-semibold">Pasvorm-instellingen</h2>
          <p className="mt-0.5 text-sm text-[var(--color-text)]/70">Fijnslijpen voor silhouet & comfort.</p>

          <dl className="mt-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)]">
            {[
              ["Bovenlaag", "Regular-slim"],
              ["Broek", "Tapered"],
              ["Lengte", "Licht cropped (–2 cm)"],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={[
                  "grid grid-cols-2 items-center px-3 py-2 text-sm",
                  i < arr.length - 1 ? "border-b border-[var(--color-border)]" : "",
                ].join(" ")}
              >
                <dt className="opacity-80">{k}</dt>
                <dd className="justify-self-end opacity-70">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <Button as={NavLink} to="/results?refresh=1" variant="secondary" onClick={() => track("regenerate_results")}>
              Genereer opnieuw
            </Button>
          </div>
        </section>

        {/* Favorieten — rustige chips, niets meer */}
        <section
          id="favorites"
          className={[
            "mt-10",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
            "pt-6 pb-6 px-5 sm:px-6",
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
      </section>
    </main>
  );
}