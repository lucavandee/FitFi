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
import { useMediaquery } from "@/components/landing/beeld/useMediaquery";
import {
  HERO_SELECTOR,
  KORT,
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
 * - Desktop: een compacte kaart rechtsonder, 320 px breed tot 1280 px en
 *   daarboven 384. Op 1024 breed begon een kaart van 384 px op x 616 en lag
 *   hij over de namen in de lijst van de kleurpiek (die eindigen op x 652).
 *   Mobiel: een strook onderin, boven de onderbalk (--onderbalk-h, gezet door
 *   MobileBottomNav).
 * - Op / pas zodra de hero voor minstens de helft uit beeld is; elders direct,
 *   behalve tijdens de quiz. Vanaf 1024 px blijft hij daarna staan tot er een
 *   keuze is; daaronder wijkt hij op / zolang de hero weer voor meer dan de
 *   helft in beeld is, want daar zou de strook de heroknoppen bedekken
 *   (cookieBannerRegels.ts).
 * - "Alles accepteren" en "Alleen noodzakelijk" wegen even zwaar: dezelfde
 *   klassen, minstens 44 px hoog en even breed. Ze staan naast elkaar als
 *   allebei op een regel passen, anders onder elkaar (zie KEUZERIJ).
 * - De kaart is nooit hoger dan het venster: wat niet past scrolt binnen de
 *   kaart, en de keuzeknoppen blijven onderin staan (WCAG 1.4.10). Geen
 *   overscroll-contain: daarmee scrolde een muiswiel boven de kaart in Chrome
 *   de pagina niet meer, ook als er in de kaart niets te scrollen viel.
 * - Geen aria-modal: de pagina blijft bruikbaar. De kaart is een regio met
 *   een naam, te vinden via de landmarks. In de DOM staat hij direct na main
 *   (App.tsx), zodat Tab hem na de pagina-inhoud vindt en niet pas na de
 *   footer.
 * - Zolang hij open is, staat zijn hoogte in --banner-h en rekent
 *   scroll-padding-bottom die mee, zodat een getabte link er niet onder
 *   verdwijnt (WCAG 2.4.11). Verschijnt hij juist door de scroll van een Tab,
 *   dan haalt een effect het element met de focus alsnog onder de kaart uit.
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
  // In een heel laag venster staat de banner in de pagina en niet vast
  // (KORT); dan hoeft niets ruimte voor hem vrij te houden.
  const kort = useMediaquery(KORT);
  useHoogteInVariabele(laagRef, "--banner-h", zichtbaar && !kort);

  // WCAG 2.4.11. Op / verschijnt de banner tijdens het scrollen, ook tijdens
  // de scroll die een Tab zelf veroorzaakt. Op dat moment was --banner-h nog
  // leeg, hield scroll-padding-bottom geen ruimte vrij en verscheen de kaart
  // over de link met de focus. Gemeten op 9 oktober 2026 (fase 4, eerste
  // bezoek, alleen Tab): 'Begin gratis' in het slot op 320x568 volledig
  // bedekt, op 412x600 voor 44 procent, op 600x500 voor 34 procent.
  // Dit effect draait na dat van useHoogteInVariabele, dus --banner-h staat
  // al; scrollIntoView houdt rekening met scroll-padding-bottom.
  React.useEffect(() => {
    if (!zichtbaar) return;
    const kaart = laagRef.current?.querySelector("section");
    const actief = document.activeElement;
    if (!kaart || !(actief instanceof HTMLElement) || actief === document.body) return;
    if (kaart.contains(actief)) return;
    const a = actief.getBoundingClientRect();
    const k = kaart.getBoundingClientRect();
    const raakt = a.bottom > k.top && a.top < k.bottom && a.right > k.left && a.left < k.right;
    if (raakt) actief.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [zichtbaar]);

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

/**
 * Dezelfde klassen voor beide keuzes: geen van beide weegt zwaarder.
 *
 * Minstens 44 px hoog, en de tekst mag op twee regels. Hier stond een vaste
 * h-11 met whitespace-nowrap: bij 150 procent tekst op 390 breed liepen
 * 'Alles accepteren' en 'Alleen noodzakelijk' over elkaar en buiten de kaart,
 * en op 320 breed paste 'Alleen noodzakelijk' al bij gewone tekst niet in
 * zijn knop (fase 4, WCAG 1.4.4, 1.4.10 en 1.4.12).
 */
const KEUZEKNOP =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white px-3 py-2 text-center text-sm font-medium text-[#1A1A1A] hover:border-[#A85740] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2";

/**
 * De rij met de twee keuzes. Twee even brede kolommen zolang elke kolom
 * minstens 9,5rem breed kan zijn, anders een kolom en staan de knoppen onder
 * elkaar. 9,5rem is de breedste knop op een regel: 'Alleen noodzakelijk' is
 * 128 px tekst plus 24 px binnenruimte bij 14 px letter (Chrome en WebKit,
 * 9 oktober 2026). In rem, zodat grotere tekst de knoppen ook eerder onder
 * elkaar zet.
 *
 * Gemeten gevolg (Chrome, gewone tekst): naast elkaar van 375 tot 640 px
 * breed en op de desktopkaart vanaf 1280 px; onder elkaar op 320 en 360 en
 * op de desktopkaart van 320 px (768 tot 1279 px). Bij 150 procent tekst op
 * telefoonbreedte onder elkaar. Een vaste flex-col onder 640 px maakte de
 * strook van 375 tot 430 breed 52 px hoger, terwijl de knoppen daar naast
 * elkaar passen.
 *
 * Plakt onderin de kaart: is de kaart hoger dan het venster, dan scrolt de
 * tekst erachter en blijven de keuzes in beeld. Niet in een heel laag venster
 * (max-height 300px, gelijk aan KORT): daar staat de kaart in de pagina.
 */
const KEUZERIJ =
  "sticky bottom-0 [@media(max-height:300px)]:static grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-2 bg-white pb-4 md:pb-5";

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
      className="pointer-events-none fixed [@media(max-height:300px)]:static inset-x-0 z-[54] flex justify-center p-3 md:justify-end md:p-6"
      style={{ bottom: "var(--onderbalk-h, 0px)" }}
    >
      <section
        aria-label="Cookievoorkeuren"
        className="pointer-events-auto w-full max-w-sm md:max-w-xs xl:max-w-sm max-h-[calc(100svh-var(--onderbalk-h,0px)-1.5rem)] md:max-h-[calc(100svh-3rem)] overflow-y-auto scroll-pb-32 [@media(max-height:300px)]:max-h-none [@media(max-height:300px)]:overflow-visible rounded-2xl border border-[#E5E5E5] bg-white shadow-xl"
      >
        {view === "simple" ? (
          <div className="px-4 pt-4 md:px-5 md:pt-5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
                Wij gebruiken cookies
              </p>
              <button
                type="button"
                onClick={() => onView("detail")}
                className="-mx-2 -my-2.5 inline-flex h-11 items-center rounded-xl px-2 text-sm font-medium text-[#1A1A1A] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
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

            <div className={`${KEUZERIJ} pt-3`}>
              <button type="button" onClick={onAcceptAll} className={KEUZEKNOP}>
                Alles accepteren
              </button>
              <button type="button" onClick={onRejectAll} className={KEUZEKNOP}>
                Alleen noodzakelijk
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 md:px-5 md:pt-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-3">
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

            <div className="space-y-3">
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

            <div className={`${KEUZERIJ} pt-4`}>
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
          {disabled && <span className="ml-2 text-sm font-normal">(altijd aan)</span>}
        </label>
        <p className="text-sm text-[#6E6E6E] leading-relaxed">{description}</p>
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
