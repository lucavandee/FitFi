import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";
import OutfitCard from "@/components/results/OutfitCard";
import { generateMockOutfits, SimpleOutfit } from "@/utils/mockOutfits";
import { LS_KEYS } from "@/lib/quiz/types";
import Button from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default function ResultsPage() {
  const hasQuizData = useMemo(() => {
    try {
      const archetype = localStorage.getItem(LS_KEYS.ARCHETYPE);
      const colorProfile = localStorage.getItem(LS_KEYS.COLOR_PROFILE);
      return !!(archetype || colorProfile);
    } catch {
      return false;
    }
  }, []);

  const outfits = useMemo(() => {
    if (!hasQuizData) return [];
    return generateMockOutfits(6);
  }, [hasQuizData]);

  if (!hasQuizData) {
    return (
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen flex items-center justify-center">
        <Helmet>
          <title>Resultaten - FitFi</title>
          <meta name="description" content="Bekijk jouw gepersonaliseerde outfit aanbevelingen en stijladvies." />
        </Helmet>
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[var(--ff-color-primary-600)]" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Nog geen resultaten</h1>
          <p className="text-[var(--color-text)]/70 mb-8">
            Start eerst de stijlquiz om jouw persoonlijke outfit aanbevelingen te krijgen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as={NavLink} to="/onboarding" variant="primary" size="lg">
              Start stijlquiz
            </Button>
            <Button as={NavLink} to="/" variant="secondary" size="lg">
              Terug naar home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Jouw Style Report - FitFi</title>
        <meta name="description" content="Bekijk jouw gepersonaliseerde outfit aanbevelingen gebaseerd op jouw unieke stijl." />
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-montserrat text-3xl sm:text-4xl font-bold mb-3">Jouw Style Report</h1>
              <p className="text-lg text-[var(--color-text)]/80">
                {outfits.length} outfits speciaal voor jouw stijl samengesteld
              </p>
            </div>
            <div className="flex gap-3">
              <Button as={NavLink} to="/dashboard" variant="secondary">
                Dashboard
              </Button>
              <Button as={NavLink} to="/onboarding" variant="ghost">
                Opnieuw doen
              </Button>
            </div>
          </div>
        </header>

        <PremiumUpsellStrip />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {outfits.map((outfit: SimpleOutfit) => {
            const images = outfit.products.map(p => p.imageUrl).slice(0, 4);

            return (
              <OutfitCard
                key={outfit.id}
                title={outfit.title}
                description={[
                  outfit.description,
                  `Archetype: ${outfit.archetype}`,
                  `${outfit.products.length} items`
                ]}
                images={images}
                shopLink="#"
              />
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8">
            <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
            <h3 className="text-xl font-semibold">Wil je meer outfits?</h3>
            <p className="text-[var(--color-text)]/70 max-w-md">
              Upgrade naar Premium voor onbeperkte outfit aanbevelingen, seizoensupdates en AI-styling tips.
            </p>
            <Button as={NavLink} to="/prijzen" variant="primary" size="lg">
              Bekijk Premium
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}