import { useEffect, useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTestimonials } from "@/hooks/useTestimonials";
import Kleurkamer from "@/components/landing/v3/Kleurkamer";
import InDeWinkel from "@/components/landing/v3/InDeWinkel";
import DeKamers from "@/components/landing/v3/DeKamers";
import Werkwijze from "@/components/landing/v3/Werkwijze";
import JeRapport from "@/components/landing/v3/JeRapport";
import Ervaringen from "@/components/landing/v3/Ervaringen";
import Slot from "@/components/landing/v3/Slot";
import { useKleurkamer } from "@/components/landing/v3/useKleurkamer";
import { track as trackFunnel } from "@/utils/analytics";
import { tel } from "@/utils/teller";
import { LANDING_BESCHRIJVING, LANDING_TITEL, OG_BEELD } from "@/content/landingHead";

const PAGE = "landing";

/* In de browser voor de eerste paint, op de server (renderToString in de tests) niets. */
const useVoorPaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Archivo als letter voor de hele pagina, ook kop en voet (html.kk-home in
 * index.css). index.html zet de klasse al bij een eerste bezoek aan "/"; dit
 * dekt navigatie binnen de app, heen en terug.
 */
function useHomeLetter() {
  useVoorPaint(() => {
    const html = document.documentElement;
    html.classList.add("kk-home");
    return () => html.classList.remove("kk-home");
  }, []);
}

/**
 * Homepage: de kleurkamer (22 oktober 2026). Ontwerp en onderbouwing:
 * ~/claude-artifacts/fitfi-beeld/2026-10-22-herontwerp/synthese.md.
 *
 * Volgorde: de held (een kamer van één kleur die je zelf kiest), echte stukken
 * in die kleur, de zes kamers naast elkaar, hoe het werkt (en wat er met je
 * gegevens gebeurt), wat je krijgt (het voorbeeldrapport), ervaringen zodra er
 * drie echte zijn, en het slot in de grijze kamer.
 *
 * De v2-secties (HeroProduct, RapportAlsBlad, KleurMoment, Afsluiter) staan hier
 * niet meer; de bestanden blijven tot de opruim-PR, RapportOmslag gebruikt er nog
 * onderdelen van.
 */

function useScrollDepth(page: string) {
  useEffect(() => {
    const drempels = [25, 50, 75, 100];
    let hoogstGemeld = 0;
    let frame = 0;

    const meet = () => {
      frame = 0;
      const scrollbaar = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollbaar <= 0) return;
      const pct = (window.scrollY / scrollbaar) * 100;
      for (const drempel of drempels) {
        if (drempel > hoogstGemeld && pct >= drempel - 0.5) {
          hoogstGemeld = drempel;
          trackFunnel("scroll_depth", { page, depth: drempel });
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(meet);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [page]);
}

export default function LandingPage() {
  // Anonieme dagtelling, zonder cookie (src/utils/teller.ts).
  useEffect(() => tel("home"), []);
  useScrollDepth(PAGE);
  useHomeLetter();

  const stand = useKleurkamer();
  const { testimonials } = useTestimonials();
  const ervaringen = testimonials.slice(0, 3).map((t) => ({
    naam: t.author_name,
    meta: t.author_age ? `${t.author_age} jaar` : "",
    citaat: t.quote,
  }));

  return (
    <>
      {/* Titel, beschrijving en deelbeeld staan in content/landingHead.ts,
          samen met index.html en de Seo-regel in App.tsx. */}
      <Helmet>
        <title>{LANDING_TITEL}</title>
        <meta name="description" content={LANDING_BESCHRIJVING} />
        <meta property="og:title" content={LANDING_TITEL} />
        <meta property="og:description" content={LANDING_BESCHRIJVING} />
        <meta property="og:image" content={OG_BEELD} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "FitFi",
            description: LANDING_BESCHRIJVING,
            url: "https://fitfi.ai",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          })}
        </script>
      </Helmet>

      <div className="bg-[#FAFAF8]">
        <Kleurkamer stand={stand} />
        <InDeWinkel kamer={stand.kamer} wie={stand.wie} />
        <DeKamers wie={stand.wie} />
        <Werkwijze />
        <JeRapport />
        <Ervaringen ervaringen={ervaringen} />
        <Slot wie={stand.wie} eigenKeuze={stand.eigenKeuze} />
      </div>
    </>
  );
}
