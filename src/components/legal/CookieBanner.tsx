import React from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import {
  getCookiePrefs,
  setCookiePrefs,
  shouldShowConsentBanner,
  type CookiePrefs,
} from "@/utils/consent";
import { useHoogteInVariabele } from "@/hooks/useHoogteInVariabele";
import {
  HERO_SELECTOR,
  SMAL,
  doosVanEersteScherm,
  isQuiz,
  magBannerTonen,
  wijktVoorHero,
  zichtbaarAandeel,
} from "./cookieBannerRegels";

type View = "simple" | "detail";

/**
 * Cookiebanner (plan fase 2, 4.0; G9 en G19).
 *
 * Wat er was: een laag van de volle breedte onderin, role="dialog" met
 * aria-modal="true", die op elke desktopmaat de klik op "Begin gratis" in de
 * hero opving (gemeten op zes maten van 1024x768 tot 1920x1080), en een
 * terracotta "Alles accepteren" naast een lichtere "Alleen noodzakelijk".
 *
 * Wat het nu is:
 * - De vaste laag laat klikken door (pointer-events-none); alleen de kaart
 *   vangt ze (pointer-events-auto).
 * - Desktop: een compacte kaart rechtsonder (max-w-sm). Mobiel: een strook
 *   onderin, boven de onderbalk (--onderbalk-h, gezet door MobileBottomNav).
 * - Op / pas zodra de hero voor minstens de helft uit beeld is; elders direct,
 *   behalve tijdens de quiz. Vanaf 1024 px blijft hij daarna staan tot er een
 *   keuze is; daaronder wijkt hij op / zolang de hero weer voor meer dan de
 *   helft in beeld is, want daar zou de strook de heroknoppen bedekken
 *   (cookieBannerRegels.ts).
 * - "Alles accepteren" en "Alleen noodzakelijk" wegen even zwaar: dezelfde
 *   klassen, 44 px hoog, even breed als ze op een regel passen.
 * - Geen aria-modal: de pagina blijft bruikbaar. De kaart is een regio met
 *   een naam, te vinden via de landmarks.
 * - Zolang hij open is, staat zijn hoogte in --banner-h en rekent
 *   scroll-padding-bottom die mee, zodat een getabte link er niet onder
 *   verdwijnt (WCAG 2.4.11).
 */
export default function CookieBanner() {
  const { pathname } = useLocation();
  const [open, setOpen] = React.useState(false);
  const [vrijgegeven, setVrijgegeven] = React.useState(false);
  const [wijkt, setWijkt] = React.useState(false);
  const [view, setView] = React.useState<View>("simple");
  const [analytics, setAnalytics] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);
  const laagRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (shouldShowConsentBanner()) {
      setOpen(true);
      const prefs = getCookiePrefs();
      setAnalytics(prefs.analytics);
      setMarketing(prefs.marketing);
    }
  }, []);

  React.useEffect(() => {
    if (!open || isQuiz(pathname)) return;
    if (pathname !== "/") {
      setVrijgegeven(true);
      setWijkt(false);
      return;
    }

    // Op / blijft dit meelopen, ook nadat de banner verschenen is: onder 1024 px
    // wijkt hij weer als de hero terug in beeld komt (cookieBannerRegels.ts).
    const smal = window.matchMedia(SMAL);
    let frame = 0;
    const toets = () => {
      frame = 0;
      const hero = document.querySelector(HERO_SELECTOR);
      const rect = hero?.getBoundingClientRect();
      const doos = rect && rect.height > 0 ? rect : doosVanEersteScherm(window.scrollY, window.innerHeight);
      const aandeel = zichtbaarAandeel(doos, window.innerHeight);
      if (magBannerTonen(pathname, aandeel)) setVrijgegeven(true);
      setWijkt(wijktVoorHero(pathname, aandeel, smal.matches));
    };
    const plan = () => {
      if (!frame) frame = window.requestAnimationFrame(toets);
    };

    toets();
    window.addEventListener("scroll", plan, { passive: true });
    window.addEventListener("resize", plan);
    return () => {
      window.removeEventListener("scroll", plan);
      window.removeEventListener("resize", plan);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open, pathname]);

  // Ook een banner die al verschenen was, wijkt tijdens de quiz.
  const zichtbaar = open && vrijgegeven && !wijkt && !isQuiz(pathname);
  useHoogteInVariabele(laagRef, "--banner-h", zichtbaar);

  const save = (prefs: Partial<CookiePrefs>) => {
    setCookiePrefs({ ...prefs, consented: true });
    setOpen(false);
  };

  if (!zichtbaar) return null;

  return (
    <CookieBannerKaart
      ref={laagRef}
      view={view}
      analytics={analytics}
      marketing={marketing}
      onView={setView}
      onAnalytics={setAnalytics}
      onMarketing={setMarketing}
      onAcceptAll={() => save({ analytics: true, marketing: true })}
      onRejectAll={() => save({ analytics: false, marketing: false })}
      onSaveCustom={() => save({ analytics, marketing })}
    />
  );
}

/** Dezelfde klassen voor beide keuzes: geen van beide weegt zwaarder. */
const KEUZEKNOP =
  "flex-1 inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm font-medium text-[#1A1A1A] hover:border-[#A85740] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2";

interface KaartProps {
  view: View;
  analytics: boolean;
  marketing: boolean;
  onView: (view: View) => void;
  onAnalytics: (aan: boolean) => void;
  onMarketing: (aan: boolean) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSaveCustom: () => void;
}

/** De weergave zonder state, los te renderen in een test. */
export const CookieBannerKaart = React.forwardRef<HTMLDivElement, KaartProps>(function CookieBannerKaart(
  { view, analytics, marketing, onView, onAnalytics, onMarketing, onAcceptAll, onRejectAll, onSaveCustom },
  ref,
) {
  return (
    <div
      ref={ref}
      data-cookiebanner=""
      className="pointer-events-none fixed inset-x-0 z-[54] flex justify-center p-3 md:justify-end md:p-6"
      style={{ bottom: "var(--onderbalk-h, 0px)" }}
    >
      <section
        aria-label="Cookievoorkeuren"
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-xl"
      >
        {view === "simple" ? (
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
                Wij gebruiken cookies
              </p>
              <button
                type="button"
                onClick={() => onView("detail")}
                className="-my-2.5 -mr-2 inline-flex h-11 items-center rounded-xl px-2 text-sm font-medium text-[#1A1A1A] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
              >
                Aanpassen
              </button>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#4A4A4A]">
              Noodzakelijke cookies zorgen dat de site werkt. Optionele cookies
              (analytics) helpen ons de ervaring te verbeteren. Je kunt je
              keuze altijd wijzigen via{" "}
              <a href="/cookies" className="text-[#1A1A1A] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors duration-200">
                Cookie-instellingen
              </a>.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onAcceptAll} className={KEUZEKNOP}>
                Alles accepteren
              </button>
              <button type="button" onClick={onRejectAll} className={KEUZEKNOP}>
                Alleen noodzakelijk
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-sm md:text-base text-[#1A1A1A] font-semibold">
                Cookievoorkeuren
              </p>
              <button
                type="button"
                onClick={() => onView("simple")}
                aria-label="Terug naar overzicht"
                className="-my-2.5 -mr-2.5 inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#6E6E6E] hover:text-[#1A1A1A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
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
                onChange={onAnalytics}
              />
              <ConsentRow
                id="cookie-marketing"
                label="Marketing"
                description="Gepersonaliseerde advertenties op externe platforms."
                checked={marketing}
                disabled={false}
                onChange={onMarketing}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onSaveCustom} className={KEUZEKNOP}>
                Voorkeuren opslaan
              </button>
              <button type="button" onClick={onRejectAll} className={KEUZEKNOP}>
                Alleen noodzakelijk
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
});

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
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5]">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className={`text-sm font-medium block mb-0.5 ${disabled ? "text-[#6E6E6E]" : "text-[#1A1A1A] cursor-pointer"}`}
        >
          {label}
          {disabled && <span className="ml-2 text-xs font-normal">(altijd aan)</span>}
        </label>
        <p className="text-xs text-[#6E6E6E] leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 pt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded accent-[#9A503B] cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
