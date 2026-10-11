import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 laadt pas na toestemming.
 *
 * Tot PR A2 stond gtag.js in index.html, met consent mode op "denied". Dat
 * zette geen cookies, maar stuurde voor elke keuze wel een page_view (en
 * scroll-events) naar google-analytics.com, en bleef dat doen na "Alleen
 * noodzakelijk". Nu is dit de enige plek die gtag.js laadt, en alleen als de
 * bezoeker analytics heeft toegestaan. Zonder die toestemming bestaat
 * window.gtag niet, en vuren ook de directe aanroepen elders (useAB,
 * engagement) niets af.
 *
 * Het meet-ID staat in de broncode van elke pagina die GA gebruikt; het is
 * geen geheim. VITE_GTAG_ID gaat voor als hij gezet is.
 */
export const GA_ID = (import.meta.env.VITE_GTAG_ID as string | undefined) || "G-D1PPLR2L3R";

/**
 * De uitschakelaar van gtag.js zelf: zolang window["ga-disable-<ID>"] op true
 * staat, verstuurt gtag niets voor dat ID, ook geen cookieloze ping. Nodig voor
 * wie in dezelfde sessie zijn toestemming intrekt, want een geladen script
 * haal je niet meer weg.
 */
const UITSCHAKELAAR = `ga-disable-${GA_ID}`;

let gtagGeladen = false;

function canTrack(): boolean {
  try {
    return getCookiePrefs().analytics && typeof window !== "undefined";
  } catch {
    return false;
  }
}

function zetUitschakelaar(uit: boolean) {
  (window as unknown as Record<string, unknown>)[UITSCHAKELAAR] = uit;
}

function laadGtag() {
  gtagGeladen = true;
  window.dataLayer = window.dataLayer || [];
  // gtag.js verwerkt alleen arguments-objecten. Een array, bijvoorbeeld uit
  // (...args) => push(args), leest hij als een ander soort opdracht, en dan
  // komt de config nooit aan. Daarom een gewone function met arguments.
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  // config stuurt de page_view van de huidige pagina. Volgende routes in de
  // app telt GA4 zelf, via de geschiedenis van de browser (enhanced
  // measurement); een eigen page_view per route zou dubbel tellen.
  window.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Zet gtag aan of uit volgens de opgeslagen keuze. Mag vaak aangeroepen worden. */
function pasToestemmingToe() {
  if (canTrack()) {
    zetUitschakelaar(false);
    if (!gtagGeladen) {
      laadGtag();
    } else {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    return;
  }
  if (gtagGeladen) {
    zetUitschakelaar(true);
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }
}

export function initAnalytics() {
  pasToestemmingToe();

  // setCookiePrefs stuurt na elke keuze een storage-event in hetzelfde
  // venster; een keuze in een ander tabblad komt via hetzelfde event binnen.
  try {
    window.addEventListener("storage", (e) => {
      if (e.key !== CONSENT_KEY) return;
      pasToestemmingToe();
    });
  } catch {}
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  try {
    if (!canTrack() || typeof window.gtag !== "function") return;
    window.gtag("event", event, payload);
  } catch {}
}

export function pageview(path: string) {
  try {
    if (!canTrack() || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: path });
  } catch {}
}
