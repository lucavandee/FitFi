import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PremiumUpsellStrip from "@/components/results/PremiumUpsellStrip";
import OutfitCard from "@/components/results/OutfitCard";
import { LS_KEYS } from "@/lib/quiz/types";
import Button from "@/components/ui/Button";
import { Sparkles, CloudOff, CheckCircle2, RefreshCw, Loader } from "lucide-react";
import { useProfileSync } from "@/hooks/useProfileSync";
import { outfitService } from "@/services/outfits/outfitService";
import type { GeneratedOutfit } from "@/services/outfits/outfitService";

export default function ResultsPage() {
  const { syncStatus, isLoading: isSyncing, manualSync } = useProfileSync(true);
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);

  const hasQuizData = useMemo(() => {
    try {
      const archetype = localStorage.getItem(LS_KEYS.ARCHETYPE);
      const colorProfile = localStorage.getItem(LS_KEYS.COLOR_PROFILE);
      return !!(archetype || colorProfile);
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (hasQuizData) {
      loadOutfits();
    } else {
      setIsLoadingOutfits(false);
    }
  }, [hasQuizData]);

  const loadOutfits = async () => {
    setIsLoadingOutfits(true);
    try {
      const quizAnswersStr = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      const archetypeStr = localStorage.getItem(LS_KEYS.ARCHETYPE);
      const colorProfileStr = localStorage.getItem(LS_KEYS.COLOR_PROFILE);

      const quizAnswers = quizAnswersStr ? JSON.parse(quizAnswersStr) : {};
      const archetype = archetypeStr ? JSON.parse(archetypeStr) : null;
      const colorProfile = colorProfileStr ? JSON.parse(colorProfileStr) : null;

      const fullProfile = {
        ...quizAnswers,
        archetype,
        colorProfile,
      };

      const generatedOutfits = await outfitService.generateOutfits(fullProfile, 6);
      setOutfits(generatedOutfits);
    } catch (error) {
      console.error('[ResultsPage] Error loading outfits:', error);
    } finally {
      setIsLoadingOutfits(false);
    }
  };

  const handleRetrySync = async () => {
    await manualSync();
  };

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

          {(syncStatus === 'pending' || syncStatus === 'error') && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <CloudOff className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Nog niet gesynchroniseerd
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                  Je resultaten zijn lokaal opgeslagen. We proberen het later automatisch te synchroniseren.
                  Je kunt je resultaten wel gewoon gebruiken.
                </p>
                <button
                  onClick={handleRetrySync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchroniseren...' : 'Probeer opnieuw'}
                </button>
              </div>
            </div>
          )}

          {syncStatus === 'synced' && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Je profiel is veilig opgeslagen en gesynchroniseerd
              </p>
            </div>
          )}
        </header>

        <PremiumUpsellStrip />

        {isLoadingOutfits ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-[var(--ff-color-primary-600)] animate-spin mb-4" />
            <p className="text-lg text-[var(--color-text)]/70">Je persoonlijke outfits worden samengesteld...</p>
          </div>
        ) : outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)] mb-4" />
            <p className="text-lg text-[var(--color-text)]/70 mb-4">We konden geen outfits genereren.</p>
            <Button onClick={loadOutfits} variant="primary">Probeer opnieuw</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {outfits.map((outfit) => {
              const images = outfit.products?.map(p => p.imageUrl).slice(0, 4) || [];

              return (
                <OutfitCard
                  key={outfit.id}
                  title={outfit.name || 'Outfit'}
                  description={[
                    outfit.explanation || outfit.description || '',
                    `${outfit.products?.length || 0} items`
                  ]}
                  images={images}
                  shopLink="#"
                />
              );
            })}
          </div>
        )}

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