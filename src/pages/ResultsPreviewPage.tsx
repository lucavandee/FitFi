import React, { useRef } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Sparkles, Check, Info, Share2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import toast from "react-hot-toast";
import { getSeedOutfits } from "@/lib/quiz/seeds";
import { COLOR_PALETTES, groupColorsByCategory } from "@/data/colorPalettes";
import type { ColorProfile } from "@/lib/quiz/types";

const DEMO_COLOR_PROFILE: ColorProfile = {
  temperature: "neutraal",
  value: "medium",
  contrast: "medium",
  chroma: "zacht",
  season: "zomer",
  paletteName: "Soft Cool Tonals",
  notes: [
    "Tonal outfits met zachte texturen werken goed voor jou.",
    "Vermijd harde contrasten en felle kleuren.",
    "Zachte beige, grijs en navy zijn ideaal voor je basis."
  ],
};

const DEMO_ARCHETYPE = "Smart Casual";

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

  const seeds = React.useMemo(() => {
    return getSeedOutfits(DEMO_COLOR_PROFILE, DEMO_ARCHETYPE);
  }, []);

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
        <title>{isPersonalized ? `${userName}'s Style Report – FitFi` : 'Voorbeeld Style Report – FitFi'}</title>
        <meta name="description" content="Bekijk een voorbeeld van je stijlprofiel met outfit-aanbevelingen." />
      </Helmet>

      {/* 1. Sticky Preview Bar */}
      <div className="fixed top-[80px] left-0 right-0 z-50 bg-[#F5F0EB] border-b border-[#E5E5E5] px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] text-[#4A4A4A]">
          <Info className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
          <span className="hidden sm:inline">
            {isPersonalized
              ? `Hé ${userName}! Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.`
              : 'Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.'}
          </span>
          <span className="sm:hidden">Voorbeeld rapport</span>
        </div>
        <NavLink
          to="/onboarding"
          className="bg-[#C2654A] hover:bg-[#A8513A] text-white text-[13px] font-semibold py-2.5 px-6 rounded-full inline-flex items-center gap-2 transition-all duration-200 flex-shrink-0"
        >
          <span>Begin gratis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      {/* 2. Page Hero */}
      <section className="bg-[#F5F0EB] pt-[180px] md:pt-[200px] pb-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-semibold text-[#4A4A4A] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#C2654A]" />
              <span>Voorbeeld rapport</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h1 className="font-serif italic text-[48px] md:text-[56px] text-[#1A1A1A] leading-[1.08] mb-6 max-w-[600px] mx-auto">
              Zo ziet jouw{" "}
              <span className="font-sans font-bold text-[#C2654A] not-italic">stijlrapport</span>{" "}
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
          <div className="bg-white border border-[#E5E5E5] rounded-[28px] p-10 md:p-12">
            {/* Header */}
            <div className="flex items-center gap-8 mb-10 pb-8 border-b border-[#E5E5E5]">
              <div className="w-[72px] h-[72px] rounded-[20px] bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#C2654A]">
                {archetypeInitials}
              </div>
              <div>
                <h2 className="font-serif italic text-[32px] text-[#1A1A1A] leading-[1.1]">
                  {DEMO_ARCHETYPE}
                </h2>
                <p className="text-sm text-[#8A8A8A] mt-1">
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
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-5">
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
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-5">
                  Inzichten
                </p>
                <div>
                  {DEMO_COLOR_PROFILE.notes.map((note, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 py-4 ${i < DEMO_COLOR_PROFILE.notes.length - 1 ? 'border-b border-[#E5E5E5]/50' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-[#C2654A]" />
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
            <div className="bg-white border border-[#E5E5E5] rounded-[28px] p-10 md:p-12">
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-2">
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
                      <div className="w-2 h-2 rounded-full bg-[#C2654A]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Basis</span>
                      <span className="text-[13px] text-[#8A8A8A]">Je dagelijkse kleuren</span>
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
                      <div className="w-2 h-2 rounded-full bg-[#C2654A]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Accent</span>
                      <span className="text-[13px] text-[#8A8A8A]">Voor kleur en persoonlijkheid</span>
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
                      <div className="w-2 h-2 rounded-full bg-[#C2654A]" />
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">Neutraal</span>
                      <span className="text-[13px] text-[#8A8A8A]">Combineer met alles</span>
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

      {/* 5. Outfit-aanbevelingen */}
      <section className="py-20 bg-[#F5F0EB]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif italic text-[44px] text-[#1A1A1A] mb-3">
                Outfit-aanbevelingen
              </h2>
              <p className="text-base text-[#4A4A4A]">
                Deze looks zijn samengesteld voor jouw stijlprofiel
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seeds.slice(0, 6).map((outfit, idx) => (
              <FadeIn key={idx} delay={idx * 0.12}>
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden hover:border-[#C2654A] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-300 group">
                  {/* Image area */}
                  <div className="aspect-[3/4] overflow-hidden relative">
                    {outfit.pieces && outfit.pieces.length > 0 ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4C5B5] to-[#C0B0A0] flex flex-col items-center justify-center gap-3 p-6">
                        {outfit.pieces.slice(0, 3).map((piece, pieceIdx) => (
                          <div key={pieceIdx} className="flex flex-col items-center">
                            <div
                              className="w-16 h-16 rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-white/80"
                              style={{ backgroundColor: piece.color }}
                            />
                            <span className="text-[11px] font-medium text-white/80 capitalize mt-1.5">
                              {piece.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4C5B5] to-[#C0B0A0] flex flex-col items-center justify-center gap-3 p-6">
                        <Sparkles className="w-10 h-10 text-white/60" />
                        <p className="text-sm font-medium text-white/70">{outfit.vibe || "Outfit"}</p>
                      </div>
                    )}

                    {/* Category badge */}
                    {outfit.tags && outfit.tags.length > 0 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.5px] uppercase text-[#1A1A1A]">
                        {outfit.vibe}
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="p-6">
                    <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">
                      {outfit.title || `Outfit ${idx + 1}`}
                    </h3>
                    <p className="text-[13px] text-[#8A8A8A] leading-[1.5] mb-3 line-clamp-2">
                      {outfit.notes || "Een stijlvolle combinatie die past bij jouw profiel."}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#C2654A]">
                        <div className="w-4 h-4 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-[#C2654A]" />
                        </div>
                        <span>{outfit.vibe || "Match"}</span>
                      </div>
                      {outfit.tags && outfit.tags.length > 1 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#F5F0EB] text-[11px] font-medium text-[#4A4A4A]">
                          {outfit.tags[1]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Share button */}
          <div className="text-center mt-10">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#4A4A4A] hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200"
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
            <div className="bg-white border border-[#E5E5E5] rounded-[28px] p-12 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4E8E3] text-[11px] font-semibold text-[#C2654A] mb-6">
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

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <NavLink
                  to="/onboarding"
                  className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-[15px] py-4 px-9 rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(194,101,74,0.2)]"
                >
                  <span>Begin gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
                <NavLink
                  to="/hoe-het-werkt"
                  className="text-[15px] font-semibold py-4 px-8 rounded-full border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200"
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
