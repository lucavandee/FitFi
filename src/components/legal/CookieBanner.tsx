import React from 'react';

const LS_KEY = 'fitfi.cookiePrefs.v1';
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
    if (!prefs.consented) setOpen(true);
  }, []);

  const acceptAll = () => {
    const p = { analytics: true, marketing: true, consented: true };
    setPrefs(p); writePrefs(p); setOpen(false);
  };
  const save = () => { setPrefs({ ...prefs, consented: true }); writePrefs({ ...prefs, consented: true }); setOpen(false); };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
        <div className="text-ink font-semibold">Cookies</div>
        <p className="mt-1 text-sm text-gray-600">
          We gebruiken noodzakelijke cookies en (optioneel) analytics/marketing. Beheer je voorkeuren hieronder.
          Zie ook onze <a href="/cookies" className="underline">Cookie Policy</a>.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked readOnly /> Noodzakelijk (altijd aan)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={prefs.analytics} onChange={(e)=>setPrefs(p=>({ ...p, analytics: e.target.checked }))}/> Analytics
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={prefs.marketing} onChange={(e)=>setPrefs(p=>({ ...p, marketing: e.target.checked }))}/> Marketing
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={acceptAll} className="rounded-full bg-[#89CFF0] px-4 py-2 text-white btn-animate">Alles accepteren</button>
          <button onClick={save} className="rounded-full border px-4 py-2">Opslaan</button>
        </div>
      </div>
    </div>
  );
}