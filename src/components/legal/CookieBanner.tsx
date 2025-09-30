import React from "react";

const LS_KEY = "fitfi.cookiePrefs.v1";
type Prefs = { analytics: boolean; marketing: boolean; consented: boolean };

function readPrefs(): Prefs | null {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writePrefs(p: Prefs) { try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {} }

export function getCookiePrefs(): Prefs {
  return readPrefs() ?? { analytics: false, marketing: false, consented: false };
}

export default function CookieBanner() {
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<Prefs>(getCookiePrefs());

  React.useEffect(() => {
    if (!readPrefs()) setOpen(true);
  }, []);

  const acceptAll = () => {
    const next = { analytics: true, marketing: true, consented: true };
    setPrefs(next); writePrefs(next); setOpen(false);
  };
  const save = () => {
    const next = { ...prefs, consented: true };
    setPrefs(next); writePrefs(next); setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl">
        <div className="text-[var(--color-text)] font-semibold">Cookies</div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          We gebruiken noodzakelijke cookies en (optioneel) analytics/marketing. Beheer je voorkeuren hieronder.
          Zie ook onze <a href="/cookies" className="underline">Cookie Policy</a>.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="checkbox" checked readOnly /> Noodzakelijk (altijd aan)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
            /> Analytics
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={(e) => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
            /> Marketing
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={acceptAll} className="px-3 h-9 inline-flex items-center rounded-lg text-white" style={{ background: "var(--ff-color-primary-700)" }}>
            Alles accepteren
          </button>
          <button onClick={save} className="px-3 h-9 inline-flex items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}