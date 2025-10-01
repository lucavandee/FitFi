// /src/pages/DashboardPage.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Clock, LogOut, Sparkles, FileText, Settings, ArrowRight } from "lucide-react";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";

function fmt(ts?: number) {
  if (!ts) return "nog niet";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "onbekend";
  }
}

export default function DashboardPage() {
  const nav = useNavigate();
  const [initial, setInitial] = React.useState<string>("J");
  const [lastUpdated, setLastUpdated] = React.useState<number | undefined>();

  React.useEffect(() => {
    try {
      const init = window.localStorage.getItem("ff_user_initial") || "J";
      setInitial(init);
      const tsStr = window.localStorage.getItem("ff_results_ts");
      setLastUpdated(tsStr ? Number(tsStr) : undefined);
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
        description="Snel overzicht van je stijlresultaten en acties."
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
        <div className="grid gap-6 md:grid-cols-3">
          {/* Status */}
          <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
            <header className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm">
                {initial}
              </div>
              <h2 className="text-base font-semibold">Jouw status</h2>
            </header>
            <p className="text-sm text-[var(--color-text)]/80">
              Je resultaten zijn {lastUpdated ? "beschikbaar" : "nog niet aangemaakt"}.
              {lastUpdated ? <> Laatst geüpdatet op <strong>{fmt(lastUpdated)}</strong>.</> : null}
            </p>
            <div className="mt-4 flex gap-2">
              <Button as={NavLink} to="/results" variant="primary">Open resultaten</Button>
              <Button as={NavLink} to="/results?refresh=1" variant="secondary">Begin opnieuw</Button>
            </div>
          </article>

          {/* Tips / Roadmap */}
          <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
            <header className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-base font-semibold">Snelle acties</h2>
            </header>
            <ul className="text-sm grid gap-2">
              <li className="flex items-center justify-between">
                <span>Verbeter je pasvorm-instellingen</span>
                <NavLink to="/results#fit" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between">
                <span>Bekijk uitleg bij je archetype</span>
                <NavLink to="/results#archetype" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between">
                <span>Bewaar je favoriete outfits</span>
                <NavLink to="/results#favorites" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
            </ul>
          </article>

          {/* Account */}
          <article className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
            <header className="flex items-center gap-3 mb-3">
              <Settings className="w-5 h-5" />
              <h2 className="text-base font-semibold">Account</h2>
            </header>
            <ul className="text-sm grid gap-2">
              <li className="flex items-center justify-between">
                <span>Gegevens & privacy</span>
                <NavLink to="/privacy" className="underline hover:no-underline inline-flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
              <li className="flex items-center justify-between">
                <span>Voorwaarden</span>
                <NavLink to="/algemene-voorwaarden" className="underline hover:no-underline inline-flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </NavLink>
              </li>
            </ul>
            <div className="mt-4">
              <Button variant="secondary" onClick={logout} className="inline-flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Uitloggen
              </Button>
            </div>
          </article>
        </div>

        {/* Documentatie/FAQ teaser */}
        <div className="mt-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Vragen of feedback?</h3>
              <p className="text-sm text-[var(--color-text)]/80">Bekijk de FAQ of stuur ons een bericht — we lezen alles.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button as={NavLink} to="/veelgestelde-vragen" variant="secondary">FAQ</Button>
            <Button as={NavLink} to="/contact" variant="primary">Contact</Button>
          </div>
        </div>
      </section>
    </main>
  );
}