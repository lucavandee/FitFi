import React from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";

function readJson<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export default function DashboardPage() {
  const ts = React.useMemo(() => {
    try { const raw = localStorage.getItem(LS_KEYS.RESULTS_TS); return raw ? parseInt(raw, 10) : null; } catch { return null; }
  }, []);
  const favCount = React.useMemo(() => {
    try { return (JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[]).length; } catch { return 0; }
  }, []);
  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);

  const last = ts ? new Date(ts) : null;
  const lastText = last ? last.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "nog niet";

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo title="Dashboard — FitFi" description="Rustig overzicht. Open je resultaten of begin opnieuw." path="/dashboard" />
      <PageHero
        eyebrow="ACCOUNT"
        title="Dashboard"
        subtitle="Rustig overzicht. Vanuit hier open je resultaten of begin je opnieuw."
        align="left"
        size="sm"
        ctas={[
          { label: "Bekijk resultaten", to: "/results", variant: "primary" },
          { label: "Begin opnieuw", to: "/stijlquiz", variant: "secondary" },
        ]}
        note={<span className="text-sm text-[var(--color-text)]/80">Laatst bijgewerkt: {lastText}</span>}
      />

      <section className="ff-container pt-10 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5">
            <h2 className="text-base font-semibold">Jouw status</h2>
            <p className="mt-1 text-sm text-[var(--color-text)]/70">Je resultaten zijn {ts ? "aangemaakt" : "nog niet aangemaakt"}.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <div className="text-sm opacity-70">Outfits</div>
                <div className="text-lg font-semibold">6</div>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <div className="text-sm opacity-70">Looks</div>
                <div className="text-lg font-semibold">—</div>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
                <div className="text-sm opacity-70">Favorieten</div>
                <div className="text-lg font-semibold">{favCount}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button as={NavLink} to="/results" variant="primary">Open resultaten</Button>
              <Button as={NavLink} to="/stijlquiz" variant="secondary">Begin opnieuw</Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5">
            <h2 className="text-base font-semibold">Profiel</h2>
            <div className="mt-3 grid gap-2">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm">
                <strong>Kleurpalet:</strong> {color?.paletteName ?? "—"}
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm">
                <strong>Archetype:</strong> {archetype ?? "—"}
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5">
            <h2 className="text-base font-semibold">Account</h2>
            <div className="mt-3 grid gap-2">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm">Gegevens & privacy</div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm">Voorwaarden</div>
            </div>
            <div className="mt-4">
              <Button as={NavLink} to="/inloggen" variant="secondary">Uitloggen</Button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-5">
          <div className="flex items-center gap-3">
            <Button as={NavLink} to="/veelgestelde-vragen" variant="secondary">FAQ</Button>
            <Button as={NavLink} to="/contact" variant="primary">Contact</Button>
          </div>
        </div>
      </section>
    </main>
  );
}