import React from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Sparkles, CheckCircle, Eye, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { getSeedOutfits } from "@/lib/quiz/seeds";
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

export default function ResultsPreviewPage() {
  const [searchParams] = useSearchParams();
  const userName = searchParams.get('name') || searchParams.get('naam');
  const isPersonalized = !!userName;

  const seeds = React.useMemo(() => {
    return getSeedOutfits(DEMO_COLOR_PROFILE, DEMO_ARCHETYPE);
  }, []);

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
          console.error("Share error:", err);
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link gekopieerd!");
      } catch (err) {
        console.error("Clipboard error:", err);
        toast.error("Kon link niet kopiëren");
      }
    }
  };

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>{isPersonalized ? `${userName}'s Style Report – FitFi` : 'Voorbeeld Style Report – FitFi'}</title>
        <meta name="description" content="Bekijk een voorbeeld van je stijlprofiel met outfit-aanbevelingen." />
      </Helmet>

      {/* Premium Preview Banner */}
      <div className="sticky top-16 z-40 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <div className="ff-container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" strokeWidth={2.5} />
              <p className="text-sm font-medium tracking-wide">
                {isPersonalized
                  ? `Hé ${userName}! Dit zou jouw Style Report zijn. Doe de quiz voor je resultaten.`
                  : 'Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.'}
              </p>
            </div>
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] rounded-xl font-bold text-sm hover:bg-[var(--ff-color-neutral-50)] transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span>Start gratis quiz</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Premium Hero Section */}
      <section className="ff-container py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-full text-xs sm:text-sm font-bold text-[var(--ff-color-primary-700)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="tracking-wide">{isPersonalized ? `${userName}'s Style Report` : 'Voorbeeld Style Report'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--ff-color-text)] leading-[1.1] tracking-tight">
            {isPersonalized ? (
              <>
                Zo zou{' '}
                <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  jouw rapport
                </span>{' '}
                eruitzien, {userName}
              </>
            ) : (
              <>
                Jouw persoonlijke{" "}
                <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  Style Report
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            {isPersonalized
              ? `${userName}, zo ziet jouw stijlanalyse eruit: kleuren en outfits die bij je passen.`
              : 'Dit is hoe jouw rapport eruit ziet na het invullen van de quiz. Je stijl, kleuren en outfit-aanbevelingen.'}
          </p>
        </div>
      </section>

      {/* Ultra-Premium Style Profile Summary */}
      <section className="ff-container pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-white via-white to-slate-50/30 backdrop-blur-xl border border-[var(--color-border)]/40 rounded-[32px] p-10 sm:p-12 lg:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-700 overflow-hidden">

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header with badge */}
              <div className="mb-10 sm:mb-12">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-full text-xs font-bold text-[var(--ff-color-primary-700)] mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="tracking-wide">JOUW STIJL</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ff-color-text)] tracking-tight leading-[1.1]">
                  {isPersonalized ? `${userName}'s stijlprofiel` : 'Je stijlprofiel'}:{' '}
                  <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                    {DEMO_ARCHETYPE}
                  </span>
                </h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
                {/* Ultra-Premium Color Profile with Visual Swatches */}
                <div className="space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--ff-color-text)] tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full" />
                    Kleurprofiel
                  </h3>

                  <div className="space-y-5">
                    {/* Temperatuur */}
                    <div className="group p-5 bg-white/60 backdrop-blur-sm border border-[var(--color-border)]/30 rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Temperatuur</span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-orange-50 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide">
                          Neutraal
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-3 flex-1 bg-gradient-to-r from-blue-400 via-slate-300 to-orange-400 rounded-full shadow-inner" />
                      </div>
                    </div>

                    {/* Contrast */}
                    <div className="group p-5 bg-white/60 backdrop-blur-sm border border-[var(--color-border)]/30 rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Contrast</span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide">
                          Medium
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-3 w-1/3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-l-full shadow-inner" />
                        <div className="h-3 w-1/3 bg-gradient-to-r from-slate-400 to-slate-500 shadow-inner" />
                        <div className="h-3 w-1/3 bg-gradient-to-r from-slate-700 to-slate-900 rounded-r-full shadow-inner" />
                      </div>
                    </div>

                    {/* Seizoen */}
                    <div className="group p-5 bg-white/60 backdrop-blur-sm border border-[var(--color-border)]/30 rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Seizoen</span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide">
                          Zomer
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-sky-200 to-blue-300 rounded-xl shadow-md" title="Zomer" />
                        <div className="h-10 w-10 bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl opacity-30" title="Herfst" />
                        <div className="h-10 w-10 bg-gradient-to-br from-slate-200 to-blue-200 rounded-xl opacity-30" title="Winter" />
                        <div className="h-10 w-10 bg-gradient-to-br from-pink-200 to-green-200 rounded-xl opacity-30" title="Lente" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ultra-Premium Key Insights */}
                <div className="space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--ff-color-text)] tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full" />
                    Belangrijkste inzichten
                  </h3>

                  <ul className="space-y-4">
                    {DEMO_COLOR_PROFILE.notes.map((note, i) => (
                      <li
                        key={i}
                        className="group p-5 bg-white/60 backdrop-blur-sm border border-[var(--color-border)]/30 rounded-[20px] hover:bg-white/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[var(--ff-color-primary-300)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ff-color-success-500)] to-[var(--ff-color-success-600)] flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                            <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} fill="currentColor" />
                          </div>
                          <span className="text-[var(--color-text)] font-medium leading-relaxed tracking-wide flex-1 pt-1">
                            {note}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Outfit Recommendations */}
      <section className="ff-container pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ff-color-text)] tracking-tight leading-[1.1]">
              Jouw outfit-aanbevelingen
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] font-light leading-relaxed tracking-wide max-w-2xl mx-auto">
              Deze looks zijn speciaal samengesteld voor jouw stijlprofiel
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-sm border border-[var(--color-border)]/50 hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] rounded-[18px] font-bold text-sm shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              <Share2 className="w-4 h-4" strokeWidth={2.5} />
              <span className="tracking-wide">Deel dit voorbeeld</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {seeds.slice(0, 6).map((outfit, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm border border-[var(--color-border)]/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Premium Outfit Visual */}
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 p-8 relative overflow-hidden">
                  {outfit.pieces && outfit.pieces.length > 0 ? (
                    <div className="space-y-8 flex flex-col items-center justify-center h-full">
                      {outfit.pieces.slice(0, 3).map((piece, pieceIdx) => (
                        <div key={pieceIdx} className="flex flex-col items-center group/piece cursor-pointer">
                          <div
                            className="w-24 h-24 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border-4 border-white/90 transition-all duration-500 group-hover/piece:shadow-[0_8px_30px_rgba(0,0,0,0.16)] group-hover/piece:scale-110 group-hover/piece:rotate-3"
                            style={{ backgroundColor: piece.color }}
                          />
                          <span className="text-xs font-semibold text-[var(--color-text)]/70 capitalize mt-2 opacity-0 group-hover/piece:opacity-100 transition-opacity duration-300 tracking-wide">
                            {piece.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-[20px] bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                          <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)]" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-semibold text-[var(--color-text)]/70 tracking-wide">
                          {outfit.vibe || "Outfit"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Premium Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ff-color-primary-600)]/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                </div>

                {/* Premium Outfit Info */}
                <div className="p-6 sm:p-7 space-y-4">
                  <h3 className="font-bold text-lg sm:text-xl text-[var(--ff-color-text)] group-hover:text-[var(--ff-color-primary-700)] transition-colors duration-300 tracking-tight">
                    {outfit.title || `Outfit ${idx + 1}`}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] line-clamp-2 font-light leading-relaxed">
                    {outfit.notes || "Een stijlvolle combinatie die perfect past bij jouw profiel."}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-semibold">
                      <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                      <span className="tracking-wide">{outfit.vibe || "Perfect match"}</span>
                    </div>
                    {outfit.tags && outfit.tags.length > 0 && (
                      <span className="text-xs px-3 py-1.5 bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] rounded-full font-bold tracking-wide">
                        {outfit.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="ff-container pb-24 md:pb-28">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 border border-[var(--color-border)]/50 rounded-3xl p-10 md:p-14 lg:p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition-all duration-700">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="tracking-wide">{isPersonalized ? `Klaar ${userName}?` : 'Maak het persoonlijk'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[var(--ff-color-text)] tracking-tight leading-[1.1]">
            {isPersonalized
              ? `${userName}, krijg jouw Style Report`
              : 'Klaar voor jouw eigen rapport?'}
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] mb-10 font-light leading-relaxed tracking-wide max-w-2xl mx-auto">
            {isPersonalized
              ? `Start de quiz ${userName}, en zie welke outfits bij je passen. Gratis.`
              : 'Beantwoord 10 snelle vragen en zie welke outfits bij je passen. Gratis.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/onboarding"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:py-5 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-[18px] font-bold text-base sm:text-lg tracking-wide shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden"
            >
              <span className="relative z-10">Start gratis stijlquiz</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </NavLink>

            <NavLink
              to="/hoe-het-werkt"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:py-5 border-2 border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] rounded-[18px] font-bold text-base sm:text-lg tracking-wide transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Hoe het werkt</span>
            </NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}
