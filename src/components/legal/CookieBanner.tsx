import React from "react";
import { X } from "lucide-react";
import {
  getCookiePrefs,
  setCookiePrefs,
  shouldShowConsentBanner,
  type CookiePrefs,
} from "@/utils/consent";

type View = "simple" | "detail";

export default function CookieBanner() {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("simple");
  const [analytics, setAnalytics] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);

  React.useEffect(() => {
    if (shouldShowConsentBanner()) {
      setOpen(true);
      const prefs = getCookiePrefs();
      setAnalytics(prefs.analytics);
      setMarketing(prefs.marketing);
    }
  }, []);

  const save = (prefs: Partial<CookiePrefs>) => {
    setCookiePrefs({ ...prefs, consented: true });
    setOpen(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });
  const saveCustom = () => save({ analytics, marketing });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookievoorkeuren"
      className="fixed inset-x-0 bottom-0 z-[9000] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">

        {view === "simple" ? (
          <div className="p-5 sm:p-6">
            <p className="text-sm sm:text-base text-[var(--color-text)] font-semibold mb-1">
              Wij gebruiken cookies
            </p>
            <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
              Noodzakelijke cookies zorgen dat de site werkt. Optionele cookies
              (analytics) helpen ons de ervaring te verbeteren. Je kunt je
              keuze altijd wijzigen via{" "}
              <a href="/cookies" className="underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">
                Cookie-instellingen
              </a>.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={acceptAll}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-700)] focus-visible:ring-offset-2"
              >
                Alles accepteren
              </button>
              <button
                onClick={rejectAll}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={() => setView("detail")}
                className="h-10 px-5 rounded-xl text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-muted)] focus-visible:ring-offset-2"
              >
                Aanpassen
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="text-sm sm:text-base text-[var(--color-text)] font-semibold">
                Cookievoorkeuren
              </p>
              <button
                onClick={() => setView("simple")}
                aria-label="Terug naar overzicht"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-muted)] rounded"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <ConsentRow
                id="cookie-necessary"
                label="Noodzakelijk"
                description="Sessie, inlogstatus en veiligheid. Kan niet uitgeschakeld worden."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <ConsentRow
                id="cookie-analytics"
                label="Analytics"
                description="Paginaweergaven en interacties om de site te verbeteren (Google Analytics 4). Geen persoonlijk profiel."
                checked={analytics}
                disabled={false}
                onChange={setAnalytics}
              />
              <ConsentRow
                id="cookie-marketing"
                label="Marketing"
                description="Gepersonaliseerde advertenties op externe platforms."
                checked={marketing}
                disabled={false}
                onChange={setMarketing}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveCustom}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-700)] focus-visible:ring-offset-2"
              >
                Voorkeuren opslaan
              </button>
              <button
                onClick={rejectAll}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
              >
                Alleen noodzakelijk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className={`text-sm font-medium block mb-0.5 ${disabled ? "text-[var(--color-muted)]" : "text-[var(--color-text)] cursor-pointer"}`}
        >
          {label}
          {disabled && <span className="ml-2 text-xs font-normal">(altijd aan)</span>}
        </label>
        <p className="text-xs text-[var(--color-muted)] leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 pt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--ff-color-primary-700)] cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
