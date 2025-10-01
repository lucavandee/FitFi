// /src/pages/DashboardPage.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Clock,
  LogOut,
  Sparkles,
  FileText,
  Settings,
  ArrowRight,
  Heart,
  LayoutList,
  Shirt,
  Info,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";

/** Utility: veilige datumweergave */
function fmt(ts?: number) {
  if (!ts) return "nog niet";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "onbekend";
  }
}

/** Card met extra top-ademruimte (pt-7/pt-8) — geen globale CSS nodig */
function Card({
  title,
  icon,
  children,
  footer,
  ariaLabel,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <article
      aria-label={ariaLabel || title}
      className={[
        "rounded-[var(--radius-2xl)]",
        "border border-[var(--color-border)]",
        "bg-[var(--color-surface)]",
        "shadow-[var(--shadow-soft)]",
        // >>> verhoogde top-padding voor meer lucht
        "pt-7 sm:pt-8 pb-5 sm:pb-6 px-5 sm:px-6",
      ].join(" ")}
    >
      <header className="mb-4 flex items-center gap-3">
        {icon ? <div className="shrink-0 text-[var(--color-text)]/90">{icon}</div> : null}
        <h2 className="text-base font-semibold">{title}</h2>
      </header>
      <div className="text-sm">{children}</div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </article>
  );
}

export default function DashboardPage() {
  const nav = useNavigate();
  const [initial, setInitial] = React.useState<string>("J");
  const [lastUpdated, setLastUpdated] = React.useState<number | undefined>();
  const [hasFavorites, setHasFavorites] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const init = window.localStorage.getItem("ff_user_initial") || "J";
      setInitial(init);
      const tsStr = window.localStorage.getItem("ff_results_ts");
      setLastUpdated(tsStr ? Number(tsStr) : undefined);
      setHasFavorites(!!window.localStorage.getItem("ff_fav_outfits"));
    } catch {}
  }, []);

  function logout() {
    try {
      window.localStorage.removeItem("ff_auth");
      window.localStorage.removeItem("ff_user_initial");
    } catch {}
    nav("/", { replace: true });
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Dashboard — FitFi"
        description="Sereen overzicht. Vanuit hier open je je resultaten of start je opnieuw."
        path="/dashboard"
      />

      <PageHero
        id="page-dashboard"
        eyebrow="ACCOUNT"
        title="Dashboard"
        subtitle="Rustig overzicht. Vanuit hier open je je resultaten of begin je opnieuw."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Bekijk resultaten", to: "/results", variant: "primary" },
          { label: "Begin opnieuw", to: "/results?refresh=1", variant: "secondary" },
        ]}
        note={
          <span className="inline-flex items-center gap-2 text-[var(--color-text)]/70">
            <Clock className="w-4 h-4" />
            Laatst bijgewerkt: {fmt(lastUpdated)}
          </span>
        }
      />

      <section className="ff-container pb-14">
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {/* Jouw status */}
          <Card
            title="Jouw status"
            ariaLabel="Jouw status"
            icon={
              <div className="h-9 w-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm">
                {initial}
              </div>
            }
            footer={
              <div className="flex flex-wrap gap-2">
                <Button as={NavLink} to="/results" variant="primary">
                  Open resultaten
                </Button>
                <Button as={NavLink} to="/results?refresh=1" variant="secondary">
                  Begin opnieuw
                </Button>
              </div>
            }
          >
            <p className="text-[var(--color-text)]/80">
              Je resultaten zijn {lastUpdated ? "beschikbaar" : "nog niet aangemaakt"}.
              {lastUpdated ? (
                <> Laatst geüpdatet op <strong>{fmt(lastUpdated)}</strong>.</>
              ) : (
                <> Klik op <em>Begin opnieuw</em> om je profiel te (her)genereren.</>
              )}
            </p>

            {/* Mini-stat strip */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <Shirt className="mx-auto h-4 w-4 opacity-80" aria-hidden />
                <div className="mt-1 text-xs opacity-70">Outfits</div>
                <div className="text-sm font-medium">{lastUpdated ? "6+" : "—"}</div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <LayoutList className="mx-auto h-4 w-4 opacity-80" aria-hidden />
                <div className="mt-1 text-xs opacity-70">Looks</div>
                <div className="text-sm font-medium">{lastUpdated ? "3 sets" : "—"}</div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <Heart className="mx-auto h-4 w-4 opacity-80" aria-hidden />
                <div className="mt-1 text-xs opacity-70">Favorieten</div>
                <div className="text-sm font-medium">{hasFavorites ? "✓" : "—"}</div>
              </div>
            </div>
          </Card>

          {/* Snelle acties */}
          <Card title="Snelle acties" icon={<Sparkles className="w-5 h-5" aria-hidden />}>
            <ul className="grid gap-2" role="list">
              <li className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <div>
                  <div className="text-sm font-medium">Verbeter je pasvorm-instellingen</div>
                  <p className="text-xs opacity-70">Maak silhouet en proportie nog scherper.</p>
                </div>
                <NavLink to="/results#fit" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <div>
                  <div className="text-sm font-medium">Bekijk uitleg bij je archetype</div>
                  <p className="text-xs opacity-70">Waarom werkt dit voor jou?</p>
                </div>
                <NavLink to="/results#archetype" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <div>
                  <div className="text-sm font-medium">Bewaar je favoriete outfits</div>
                  <p className="text-xs opacity-70">Curate je eigen selectie voor later.</p>
                </div>
                <NavLink to="/results#favorites" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
            </ul>

            <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <div className="flex items-start gap-2 text-sm">
                <Info className="mt-0.5 h-4 w-4 opacity-80" aria-hidden />
                <p className="opacity-80">
                  Tip: voeg <em>1–2</em> favorieten toe; dan personaliseren we je volgende outfits nog beter.
                </p>
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card
            title="Account"
            icon={<Settings className="w-5 h-5" aria-hidden />}
            footer={
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={logout} className="inline-flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Uitloggen
                </Button>
              </div>
            }
          >
            <ul className="grid gap-2 text-sm" role="list">
              <li className="flex items-center justify-between">
                <span>Gegevens & privacy</span>
                <NavLink to="/privacy" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between">
                <span>Voorwaarden</span>
                <NavLink to="/algemene-voorwaarden" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
            </ul>
          </Card>
        </div>

        {/* Support teaser (matching spacing) */}
        <div
          className={[
            "mt-6",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
            // iets meer top-padding zodat het visueel in lijn ligt met de cards
            "pt-7 sm:pt-8 pb-5 sm:pb-6 px-5 sm:px-6",
          ].join(" ")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" aria-hidden />
              <div>
                <h3 className="font-semibold">Vragen of feedback?</h3>
                <p className="text-sm text-[var(--color-text)]/80">
                  Bekijk de FAQ of stuur ons een bericht — we lezen alles.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button as={NavLink} to="/veelgestelde-vragen" variant="secondary">
                FAQ
              </Button>
              <Button as={NavLink} to="/contact" variant="primary">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}