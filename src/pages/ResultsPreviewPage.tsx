import React, { useRef } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Sparkles, Check, Info, Share2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import toast from "react-hot-toast";
import { toonNaam } from "@/utils/productNaam";
import { COLOR_PALETTES, groupColorsByCategory } from "@/data/colorPalettes";
import type { ColorProfile } from "@/lib/quiz/types";

/**
 * Het voorbeeldprofiel hoort bij de outfits hieronder: zwart en gebroken wit
 * met veel contrast, dus het winterpalet. Tot 21 oktober 2026 stond hier
 * "Smart Casual" met een zomerpalet, en toonde de pagina zes outfits als
 * lege gekleurde vlakjes met namen zonder product.
 */
const DEMO_COLOR_PROFILE: ColorProfile = {
  temperature: "neutraal",
  value: "medium",
  contrast: "hoog",
  chroma: "helder",
  season: "winter",
  paletteName: "Clear Winter",
  notes: [
    "Zwart en gebroken wit samen geven het contrast dat bij je past.",
    "Een kleur per outfit, met wol, bouclé en leer als variatie.",
    "Camel en oranje zijn te warm naast je gezicht.",
  ],
};

const DEMO_ARCHETYPE = "Minimalistisch";

interface VoorbeeldStuk {
  naam: string;
  merk: string;
  prijs: number;
  beeld: string;
}

interface VoorbeeldOutfit {
  titel: string;
  gelegenheid: string;
  uitleg: string;
  stukken: VoorbeeldStuk[];
}

/**
 * Twee outfits zoals FitFi ze samenstelde voor het profiel "vrouw,
 * minimalistisch" op 21 oktober 2026, met de prijzen van die dag. Gekozen
 * omdat de stijlcontrole ze goedkeurde (stijl-eindtoets van 21 oktober, 18:11)
 * en omdat exact vaststaat welke producten het waren; van twee andere
 * goedgekeurde outfits bestonden meerdere producten met dezelfde naam.
 *
 * De productfoto's zijn de feedfoto's van H&M, ongewijzigd (Daisycon art.
 * 2.6): ze staan op hun eigen lichtgrijze ondergrond (#F9F9F9) in een kader
 * in gebroken wit uit het palet (#FAFAF8, een tint verschil, niet te zien)
 * met dezelfde verhouding (2:3), zonder bijsnijden. De
 * imwidth-parameter vraagt een kleinere versie bij H&M zelf op.
 */
const VOORBEELD_OUTFITS: VoorbeeldOutfit[] = [
  {
    titel: "Lange wollen jurk met laarsjes",
    gelegenheid: "Werk",
    uitleg: "Zwart van boven tot onder. Wol en leer zorgen voor de variatie, de hak maakt het af.",
    stukken: [
      { naam: "H & M - Lange wollen jurk - Zwart", merk: "H&M", prijs: 69.99, beeld: "https://image.hm.com/assets/hm/d7/d2/d7d20cd854bdbfe9868aafcc03b6d51a0f001b33.jpg" },
      { naam: "H & M - Leren laarsjes met hak - Zwart", merk: "H&M", prijs: 99, beeld: "https://image.hm.com/assets/hm/e6/81/e68127752fd8a540a0f916acdef8239d14994ccb.jpg" },
    ],
  },
  {
    titel: "Bouclé jurk met blazer",
    gelegenheid: "Werk",
    uitleg: "Jurk en blazer in hetzelfde lichtbeige vormen één vlak. De zwarte enkellaarsjes geven het contrast.",
    stukken: [
      { naam: "H & M - Doorknoopjurk van geweven bouclégaren - Lichtbeige", merk: "H&M", prijs: 49.99, beeld: "https://image.hm.com/assets/hm/39/7c/397cb3984fee9142654b344cfaec21bfa91999d8.jpg" },
      { naam: "H & M - Dressed blazer - Lichtbeige", merk: "H&M", prijs: 49.99, beeld: "https://image.hm.com/assets/hm/82/92/8292c2be4c20739cd4f6af83a6af03bc13de3910.jpg" },
      { naam: "H & M - Leren enkellaarsjes - Zwart", merk: "H&M", prijs: 129, beeld: "https://image.hm.com/assets/hm/82/3a/823a35f35686a37324e466270f52608dc610a312.jpg" },
    ],
  },
];

const euro = (bedrag: number) =>
  bedrag.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });

/** Een kleinere versie bij H&M zelf; de foto blijft dezelfde. */
const formaat = (url: string, breedte: number) => `${url}${url.includes("?") ? "&" : "?"}imwidth=${breedte}`;

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 20 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ResultsPreviewPage() {
  const [searchParams] = useSearchParams();
  const userName = searchParams.get('name') || searchParams.get('naam');
  const isPersonalized = !!userName;

  const seasonPalette = COLOR_PALETTES[DEMO_COLOR_PROFILE.season];
  const groupedColors = seasonPalette ? groupColorsByCategory(seasonPalette.colors) : null;

  const handleShare = async () => {
    const url = window.location.href;
    const title = isPersonalized
      ? `Bekijk ${userName}'s FitFi Style Report`
      : "Bekijk dit FitFi voorbeeldrapport";
    const text = isPersonalized
      ? `Zo zou ${userName}'s stijlrapport eruitzien. Zie ook jouw stijl met FitFi!`
      : "Hoe FitFi je stijl analyseert en outfits samenstelt die bij je passen.";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast.success("Gedeeld!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Kon niet delen");
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link gekopieerd!");
      } catch {
        toast.error("Kon link niet kopiëren");
      }
    }
  };

  const archetypeInitials = DEMO_ARCHETYPE.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const seasonLabel = DEMO_COLOR_PROFILE.season.charAt(0).toUpperCase() + DEMO_COLOR_PROFILE.season.slice(1);
  const temperatureLabel = DEMO_COLOR_PROFILE.temperature.charAt(0).toUpperCase() + DEMO_COLOR_PROFILE.temperature.slice(1);
  const contrastLabel = DEMO_COLOR_PROFILE.contrast.charAt(0).toUpperCase() + DEMO_COLOR_PROFILE.contrast.slice(1);
  const chromaLabel = DEMO_COLOR_PROFILE.chroma.charAt(0).toUpperCase() + DEMO_COLOR_PROFILE.chroma.slice(1);

  return (
    <main className="bg-[#FAFAF8]">
      <Helmet>
        <title>{isPersonalized ? `${userName}'s Style Report | FitFi` : 'Voorbeeld Style Report | FitFi'}</title>
        <meta name="description" content="Bekijk een voorbeeld van je stijlprofiel met outfit-aanbevelingen." />
      </Helmet>

      {/* 1. Sticky Preview Bar */}
      <div className="fixed top-[80px] left-0 right-0 z-50 bg-[#F5F0EB] border-b border-[#E5E5E5] px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] text-[#4A4A4A]">
          <Info className="w-4 h-4 text-[#A85740] flex-shrink-0" />
          <span className="hidden sm:inline">
            {isPersonalized
              ? `Hé ${userName}! Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.`
              : 'Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.'}
          </span>
          <span className="sm:hidden">Voorbeeld rapport</span>
        </div>
      </div>

      {/* 2. Page Hero */}
      <section className="bg-[#F5F0EB] pt-[180px] md:pt-[200px] pb-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-semibold text-[#4A4A4A] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#A85740]" />
              <span>Voorbeeld rapport</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h1 className="font-serif italic text-[48px] md:text-[56px] text-[#1A1A1A] leading-[1.08] mb-6 max-w-[600px] mx-auto">
              Zo ziet jouw{" "}
              <span className="font-sans font-bold text-[#A85740] not-italic">stijlrapport</span>{" "}
              eruit
            </h1>
          </FadeIn>

          <FadeIn delay={0.24}>
            <p className="text-[17px] text-[#4A4A4A] leading-[1.7] max-w-[440px] mx-auto">
              Je stijl, kleuren en outfit-aanbevelingen. Persoonlijk samengesteld op basis van de quiz.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 3. Profielkaart */}
      <div className="max-w-[900px] mx-auto px-6 -mt-10 relative z-10">
        <ScaleIn>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 md:p-12">
            {/* Header */}
            <div className="flex items-center gap-8 mb-10 pb-8 border-b border-[#E5E5E5]">
              <div className="w-[72px] h-[72px] rounded-2xl bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#A85740]">
                {archetypeInitials}
              </div>
              <div>
                <h2 className="font-serif italic text-[32px] text-[#1A1A1A] leading-[1.1]">
                  {DEMO_ARCHETYPE}
                </h2>
                <p className="text-sm text-[#6E6E6E] mt-1">
                  {seasonLabel} · Neutrale ondertoon · {contrastLabel} contrast
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[DEMO_ARCHETYPE, seasonLabel, chromaLabel].map((tag) => (
                    <span key={tag} className="px-3.5 py-1.5 rounded-full bg-[#F5F0EB] text-xs font-semibold text-[#4A4A4A]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Kleurprofiel */}
              <div>
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#6E6E6E] mb-5">
                  Kleurprofiel
                </p>
                <div>
                  {[
                    { label: "Temperatuur", value: temperatureLabel },
                    { label: "Contrast", value: contrastLabel },
                    { label: "Seizoen", value: seasonLabel },
                    { label: "Chroma", value: chromaLabel },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-[#E5E5E5]/50' : ''}`}
                    >
                      <span className="text-sm text-[#4A4A4A]">{row.label}</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Inzichten */}
              <div>
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#6E6E6E] mb-5">
                  Inzichten
                </p>
                <div>
                  {DEMO_COLOR_PROFILE.notes.map((note, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 py-4 ${i < DEMO_COLOR_PROFILE.notes.length - 1 ? 'border-b border-[#E5E5E5]/50' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#A85740]" />
                      </div>
                      <span className="text-sm text-[#4A4A4A] leading-[1.5]">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScaleIn>
      </div>

      {/* 4. Kleurpalet sectie */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-[900px] mx-auto px-6">
          <FadeIn>
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 md:p-12">
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#A85740] mb-2">
                Kleurpalet
              </p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                {seasonPalette?.season || seasonLabel}
              </h3>
              <p className="text-sm text-[#4A4A4A] mb-10">
                {seasonPalette?.description || `Kleuren die passen bij het ${seasonLabel.toLowerCase()} seizoenstype.`}
              </p>

              {groupedColors && (
                <>
                  {/* Basis kleuren */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#A85740]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Basis</span>
                      <span className="text-[13px] text-[#6E6E6E]">Je dagelijkse kleuren</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {groupedColors.basis.map((swatch) => (
                        <div key={swatch.hex} className="flex flex-col items-center gap-2">
                          <div
                            className="w-[72px] h-[72px] rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="text-xs font-medium text-[#4A4A4A] text-center">{swatch.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accent kleuren */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#A85740]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Accent</span>
                      <span className="text-[13px] text-[#6E6E6E]">Voor kleur en persoonlijkheid</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {groupedColors.accent.map((swatch) => (
                        <div key={swatch.hex} className="flex flex-col items-center gap-2">
                          <div
                            className="w-[72px] h-[72px] rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="text-xs font-medium text-[#4A4A4A] text-center">{swatch.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neutrale kleuren */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#A85740]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Neutraal</span>
                      <span className="text-[13px] text-[#6E6E6E]">Combineer met alles</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {groupedColors.neutraal.map((swatch) => (
                        <div key={swatch.hex} className="flex flex-col items-center gap-2">
                          <div
                            className="w-[72px] h-[72px] rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="text-xs font-medium text-[#4A4A4A] text-center">{swatch.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. Outfit-aanbevelingen: echte producten, zie VOORBEELD_OUTFITS */}
      <section className="py-20 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif italic text-[44px] text-[#1A1A1A] mb-3">
                Outfit-aanbevelingen
              </h2>
              <p className="text-base text-[#4A4A4A] max-w-prose mx-auto">
                Twee outfits zoals FitFi ze samenstelde voor dit profiel, met de prijzen van 21 oktober 2026.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-6">
            {VOORBEELD_OUTFITS.map((outfit, idx) => {
              const totaal = outfit.stukken.reduce((som, stuk) => som + stuk.prijs, 0);
              return (
                <FadeIn key={outfit.titel} delay={idx * 0.12}>
                  <article className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-6">
                      <div>
                        <p className="text-sm font-medium text-[#A85740] mb-1">{outfit.gelegenheid}</p>
                        <h3 className="text-xl md:text-2xl font-semibold text-[#1A1A1A]">{outfit.titel}</h3>
                      </div>
                      <p className="text-base font-semibold text-[#1A1A1A]">{euro(totaal)}</p>
                    </div>
                    <p className="text-base text-[#4A4A4A] leading-relaxed max-w-prose mb-6">{outfit.uitleg}</p>

                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {outfit.stukken.map((stuk) => (
                        <li key={stuk.beeld}>
                          <div className="aspect-[2/3] rounded-xl bg-[#FAFAF8] overflow-hidden">
                            <img
                              src={formaat(stuk.beeld, 600)}
                              srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 800)} 800w`}
                              sizes="(min-width: 768px) 260px, 45vw"
                              alt={toonNaam({ name: stuk.naam, brand: stuk.merk })}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <p className="mt-3 text-sm font-medium text-[#1A1A1A] leading-snug">
                            {toonNaam({ name: stuk.naam, brand: stuk.merk })}
                          </p>
                          <p className="text-sm text-[#4A4A4A]">
                            {stuk.merk} · {euro(stuk.prijs)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </FadeIn>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-[#6E6E6E] text-center max-w-prose mx-auto">
            In je eigen rapport linkt elk stuk naar de winkel. Voorraad en prijzen wisselen per dag.
          </p>

          {/* Share button */}
          <div className="text-center mt-10">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#4A4A4A] hover:border-[#A85740] hover:text-[#A85740] transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Deel dit voorbeeld</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. CTA sectie */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="max-w-[700px] mx-auto px-6">
          <FadeIn>
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4E8E3] text-[11px] font-semibold text-[#A85740] mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPersonalized ? `Klaar ${userName}?` : 'Maak het persoonlijk'}</span>
              </div>

              <h2 className="font-serif italic text-[36px] md:text-[40px] text-[#1A1A1A] leading-[1.1] mb-5">
                {isPersonalized
                  ? `${userName}, klaar voor jouw rapport?`
                  : 'Klaar voor jouw eigen rapport?'}
              </h2>

              <p className="text-base text-[#4A4A4A] mb-10 max-w-[400px] mx-auto leading-[1.7]">
                {isPersonalized
                  ? `Beantwoord een paar vragen en ontdek welke kleuren en outfits echt bij je passen, ${userName}. Gratis.`
                  : 'Beantwoord een paar vragen en ontdek welke kleuren en outfits echt bij jou passen. Gratis.'}
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <NavLink
                  to="/onboarding"
                  className="bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-4 px-12 rounded-full inline-flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(194,101,74,0.2)]"
                >
                  <span>Begin gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
                <NavLink
                  to="/hoe-het-werkt"
                  className="text-base font-semibold py-4 px-10 rounded-full border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#A85740] hover:text-[#A85740] transition-all duration-200"
                >
                  Hoe het werkt
                </NavLink>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
