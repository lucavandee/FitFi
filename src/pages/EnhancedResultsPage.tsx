import React from "react";
import { NavLink } from "react-router-dom";
import { Sparkles, SlidersHorizontal, Share2, Bookmark, BookmarkCheck, Info, List as ListIcon, Grid3x3 as GridIcon, ShoppingBag, Shirt, ExternalLink } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";

/** -------- UX helpers -------- */

type Outfit = { id: string; title: string; vibe: string; notes: string; palette: string };

const OUTFITS: Outfit[] = [
  { id: "o1", title: "Clean Casual",   vibe: "Smart-casual",    notes: "Neutrals, rustige textuur.",        palette: "steen • zand • wit" },
  { id: "o2", title: "Office Minimal", vibe: "Werk / meeting",  notes: "Strakke lijnen, laag contrast.",    palette: "beige • greige • off-white" },
  { id: "o3", title: "Weekend Uniform",vibe: "Ontspannen",      notes: "Praktisch, subtiele structuur.",    palette: "taupe • ecru • olijf-tint" },
  { id: "o4", title: "Monochrome Light",vibe: "Tonal",          notes: "Lang silhouet, 2 lagen.",           palette: "ecru • bot • crème" },
  { id: "o5", title: "Warm Neutral Mix",vibe: "Casual",         notes: "Warm koord + katoen.",              palette: "klei • room • zand" },
  { id: "o6", title: "Sporty Sharp",   vibe: "Sportief-net",    notes: "Clean sportswear, *no logos*.",     palette: "steenkleur • wolk • room" },
];

function readFavs(): string[] {
  try { return JSON.parse(window.localStorage.getItem("ff_fav_outfits") || "[]"); } catch { return []; }
}
function writeFavs(ids: string[]) {
  try { window.localStorage.setItem("ff_fav_outfits", JSON.stringify(ids)); } catch {}
}

/** Herbruikbare section card met royale top-padding (premium ademruimte) */
function SectionCard({
  id, title, subtitle, icon, children,
}: { id?: string; title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; }) {
  return (
    <section
      id={id}
      className={[
        "rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        "pt-8 sm:pt-9 pb-6 sm:pb-7 px-5 sm:px-6",
      ].join(" ")}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <header className="mb-4 flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-[var(--color-text)]/90">{icon}</div> : null}
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-[var(--color-text)]/70">{subtitle}</p> : null}
        </div>
      </header>
      <div className="text-sm">{children}</div>
    </section>
  );
}

/** Visuele outfit placeholder (geen externe assets nodig) */
function OutfitVisual({ label }: { label: string }) {
  return (
    <div
      className={[
        "relative w-full aspect-[4/5] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)]",
        "flex items-center justify-center",
      ].join(" ")}
      aria-hidden
    >
      <Shirt className="w-10 h-10 opacity-50" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** -------- Pagina -------- */

export default function EnhancedResultsPage() {
  // 'Last updated' voor Dashboard + view event
  React.useEffect(() => {
    try { window.localStorage.setItem("ff_results_ts", Date.now().toString()); } catch {}
    track("view_results");
  }, []);

  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [favs, setFavs] = React.useState<string[]>(() => readFavs());

  function toggleFav(id: string) {
    setFavs((curr) => {
      const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
      writeFavs(next);
      track(curr.includes(id) ? "favorite_remove" : "favorite_add", { id });
      return next;
    });
  }

  function sharePage() {
    const url = typeof window !== "undefined" ? window.location.href : "https://fitfi.ai/results";
    track("share_results");
    if (navigator.share) {
      navigator.share({ title: "Mijn FitFi resultaten", url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Jouw resultaten — FitFi"
        description="Outfits op maat met duidelijke uitleg en rust in de presentatie."
        path="/results"
      />

      <PageHero
        eyebrow="JOUW RESULTATEN"
        title="Outfits op maat — rustig en premium"
        subtitle="Gefocust op silhouet, proportie en een kalme kleurenreeks."
        align="left"
        size="sm"
        ctas={[
          { label: "Dashboard", to: "/dashboard", variant: "secondary" },
          { label: "Deel", to: "#", variant: "primary" },
        ]}
        onPrimaryClick={(e: any) => { e?.preventDefault?.(); sharePage(); }}
      />

      {/* Content met royale afstand tot hero */}
      <section className="ff-container pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-20">
        {/* Toolbalk */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <div className="inline-flex items-center gap-2 text-sm">
            <SlidersHorizontal className="w-4 h-4" aria-hidden />
            <span className="opacity-80">Weergave</span>
            <div role="tablist" aria-label="Weergave" className="ml-2 inline-flex items-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
              <button
                role="tab" aria-selected={view === "grid"}
                className={["px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1", view==="grid"?"bg-[var(--color-surface)] shadow-[var(--shadow-soft)]":"hover:bg-[color-mix(in oklab,var(--color-primary) 8%,transparent)]"].join(" ")}
                onClick={() => { setView("grid"); track("view_mode_change", { mode: "grid" }); }}
              >
                <GridIcon className="w-4 h-4" aria-hidden /> Grid
              </button>
              <button
                role="tab" aria-selected={view === "list"}
                className={["px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1", view==="list"?"bg-[var(--color-surface)] shadow-[var(--shadow-soft)]":"hover:bg-[color-mix(in oklab,var(--color-primary) 8%,transparent)]"].join(" ")}
                onClick={() => { setView("list"); track("view_mode_change", { mode: "list" }); }}
              >
                <ListIcon className="w-4 h-4" aria-hidden /> Lijst
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={sharePage} className="inline-flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Deel resultaten
            </Button>
          </div>
        </div>

        {/* OUTIFTS */}
        <SectionCard
          id="outfits"
          title="Voor jou samengestelde outfits"
          subtitle="Stijlvol maar rustig — zodat de focus op vorm en proportie blijft."
          icon={<Sparkles className="w-5 h-5" aria-hidden />}
        >
          {view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {OUTFITS.map((o) => {
                const active = favs.includes(o.id);
                return (
                  <article
                    key={o.id}
                    className={[
                      "rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden",
                      // micro-animatie: hover-lift + subtle shadow intensivering
                      "transform-gpu transition-transform duration-200 ease-out hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <OutfitVisual label={o.title} />
                    <div className="p-4 border-t border-[var(--color-border)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold">{o.title}</h3>
                          <p className="text-sm opacity-70">{o.vibe} • {o.palette}</p>
                        </div>
                        <button
                          className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                          aria-pressed={active}
                          onClick={() => toggleFav(o.id)}
                        >
                          {active ? (<><BookmarkCheck className="w-4 h-4" aria-hidden /> Bewaard</>) : (<><Bookmark className="w-4 h-4" aria-hidden /> Bewaren</>)}
                        </button>
                      </div>
                      <p className="mt-2 text-sm opacity-80">{o.notes}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button as={NavLink} to="/results#archetype" variant="secondary" className="inline-flex items-center gap-2">
                          <Info className="w-4 h-4" aria-hidden /> Waarom dit werkt
                        </Button>
                        <Button as={NavLink} to="/results?shop=1" variant="primary" className="inline-flex items-center gap-2" onClick={() => track("click_shop_cta", { id: o.id })}>
                          <ShoppingBag className="w-4 h-4" aria-hidden /> Shop (binnenkort)
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <ul role="list" className="grid gap-4">
              {OUTFITS.map((o) => {
                const active = favs.includes(o.id);
                return (
                  <li
                    key={o.id}
                    className={[
                      "flex items-center gap-4 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4",
                      "transform-gpu transition-transform duration-200 ease-out hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <div className="w-20"><OutfitVisual label={o.title} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold">{o.title}</h3>
                          <p className="text-sm opacity-70">{o.vibe} • {o.palette}</p>
                        </div>
                        <button
                          className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                          aria-pressed={active}
                          onClick={() => toggleFav(o.id)}
                        >
                          {active ? (<><BookmarkCheck className="w-4 h-4" aria-hidden /> Bewaard</>) : (<><Bookmark className="w-4 h-4" aria-hidden /> Bewaren</>)}
                        </button>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{o.notes}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        {/* UITLEG / ARCHETYPE */}
        <div className="mt-8 grid gap-7 lg:gap-9 lg:grid-cols-2">
          <SectionCard
            id="archetype"
            title="Waarom dit voor je werkt"
            subtitle="Kern: proportie, rustige texturen en een zachte tonaliteit."
            icon={<Info className="w-5 h-5" aria-hidden />}
          >
            <ul className="grid gap-2 text-sm" role="list">
              <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                Silhouet: kies 2 lagen max; laat je bovenlaag ±1/3 langer vallen voor lengte.
              </li>
              <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                Textuur: combineer <strong>glad</strong> en <strong>gebreid</strong> voor diepte zonder drukte.
              </li>
              <li className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                Kleur: werk tonal (licht-neutraal) met 1 warme accenttint per look.
              </li>
            </ul>

            <div className="mt-4 text-xs text-[var(--color-text)]/70">
              Dit is een startpunt — jouw favorieten sturen de volgende generatie outfits.
            </div>
          </SectionCard>

          {/* PASVORM / FIT */}
          <SectionCard
            id="fit"
            title="Pasvorm-instellingen"
            subtitle="Fijnslijpen voor silhouet & comfort."
            icon={<SlidersHorizontal className="w-5 h-5" aria-hidden />}
          >
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"><span>Bovenlaag</span><span className="text-sm opacity-70">Regular-slim</span></div>
              <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"><span>Broek</span><span className="text-sm opacity-70">Tapered</span></div>
              <div className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"><span>Lengte</span><span className="text-sm opacity-70">Licht cropped (–2 cm)</span></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button as={NavLink} to="/results?refresh=1" variant="secondary" onClick={() => track("regenerate_results")}>Genereer opnieuw</Button>
              <Button as={NavLink} to="/veelgestelde-vragen" variant="primary" className="inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" aria-hidden /> Hulp
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* FAVORIETEN */}
        <SectionCard
          id="favorites"
          title="Je favorieten"
          subtitle="Bewaar 1–2 outfits als ankerpunt voor volgende suggesties."
          icon={<BookmarkCheck className="w-5 h-5" aria-hidden />}
        >
          {favs.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-sm opacity-80">Nog geen favorieten. Klik op <em>Bewaren</em> bij een outfit om te starten.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OUTFITS.filter((o) => favs.includes(o.id)).map((o) => (
                <div key={o.id} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transform-gpu transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{o.title}</h3>
                    <button className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm" onClick={() => toggleFav(o.id)}>
                      <Bookmark className="w-4 h-4" aria-hidden /> Verwijder
                    </button>
                  </div>
                  <p className="mt-1 text-sm opacity-70">{o.vibe} • {o.palette}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </main>
  );
}