import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Sparkles, CheckCircle, Eye } from "lucide-react";
import { getSeedOutfits } from "@/lib/quiz/seeds";
import { OutfitVisualCompact } from "@/components/outfits/OutfitVisual";
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
  const seeds = React.useMemo(() => {
    return getSeedOutfits(DEMO_COLOR_PROFILE, DEMO_ARCHETYPE);
  }, []);

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Voorbeeld Style Report – FitFi</title>
        <meta name="description" content="Bekijk een voorbeeld van je persoonlijke stijlprofiel met outfit-aanbevelingen." />
      </Helmet>

      {/* Preview Banner */}
      <div className="sticky top-16 z-40 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white">
        <div className="ff-container py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <p className="text-sm font-medium">
                Dit is een voorbeeld. Doe de quiz voor jouw persoonlijke rapport.
              </p>
            </div>
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--ff-color-primary-700)] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Start gratis quiz
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="ff-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)]">
            <Sparkles className="w-4 h-4" />
            Voorbeeld Style Report
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--ff-color-text)] leading-tight">
            Jouw persoonlijke{" "}
            <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
              Style Report
            </span>
          </h1>

          <p className="text-lg text-[var(--color-text)]/70 max-w-2xl mx-auto">
            Dit is hoe jouw rapport eruit ziet na het invullen van de 2-minuten quiz.
            Ontdek je stijl, kleuren en persoonlijke outfit-aanbevelingen.
          </p>
        </div>
      </section>

      {/* Style Profile Summary */}
      <section className="ff-container pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[var(--ff-color-text)]">
              Je stijlprofiel: {DEMO_ARCHETYPE}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Color Profile */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--ff-color-text)]">
                  Kleurprofiel
                </h3>
                <div className="space-y-2 text-sm text-[var(--color-text)]/70">
                  <div className="flex justify-between">
                    <span>Temperatuur:</span>
                    <span className="font-medium text-[var(--ff-color-text)]">Neutraal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contrast:</span>
                    <span className="font-medium text-[var(--ff-color-text)]">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seizoen:</span>
                    <span className="font-medium text-[var(--ff-color-text)]">Zomer</span>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--ff-color-text)]">
                  Belangrijkste inzichten
                </h3>
                <ul className="space-y-2 text-sm text-[var(--color-text)]/70">
                  {DEMO_COLOR_PROFILE.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-600)] mt-0.5 flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Outfit Recommendations */}
      <section className="ff-container pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--ff-color-text)]">
              Jouw outfit-aanbevelingen
            </h2>
            <p className="text-lg text-[var(--color-text)]/70">
              Deze looks zijn speciaal samengesteld voor jouw stijlprofiel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seeds.slice(0, 6).map((outfit, idx) => (
              <div
                key={idx}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Outfit Visual */}
                <div className="aspect-[3/4] bg-[var(--color-bg-subtle)] p-6">
                  <OutfitVisualCompact outfit={outfit} />
                </div>

                {/* Outfit Info */}
                <div className="p-6 space-y-3">
                  <h3 className="font-semibold text-lg text-[var(--ff-color-text)]">
                    {outfit.name || `Outfit ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-[var(--color-text)]/70 line-clamp-2">
                    {outfit.explanation || "Een stijlvolle combinatie die perfect past bij jouw profiel."}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Matcht met jouw stijl</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ff-container pb-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] rounded-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6">
            <Sparkles className="w-4 h-4" />
            Maak het persoonlijk
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--ff-color-text)]">
            Klaar voor jouw eigen rapport?
          </h2>

          <p className="text-lg text-[var(--color-text)]/70 mb-8">
            Beantwoord 10 snelle vragen en ontdek binnen 2 minuten welke outfits écht bij je passen.
            Gratis, zonder verplichtingen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Start gratis stijlquiz
              <ArrowRight className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/hoe-het-werkt"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] rounded-xl font-semibold transition-all"
            >
              Hoe het werkt
            </NavLink>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-[var(--ff-color-primary-200)]">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/60">
              <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-600)]" />
              <span>100% gratis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/60">
              <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-600)]" />
              <span>Geen creditcard nodig</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/60">
              <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-600)]" />
              <span>Resultaat in 2 minuten</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
