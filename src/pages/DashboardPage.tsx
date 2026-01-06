import React from "react";
import { NavLink, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Sparkles, Heart, Shirt, ArrowRight, RefreshCw, Settings, TrendingUp, Award, CircleCheck as CheckCircle, X, Zap, Crown, Target, Clock, Trophy } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";
import { RefineStyleWidget } from "@/components/dashboard/RefineStyleWidget";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { WelcomeTour } from "@/components/dashboard/WelcomeTour";
import { NovaContextualBubble } from "@/components/nova/NovaContextualBubble";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import toast from "react-hot-toast";
import { AnimatedStatCard } from "@/components/dashboard/AnimatedStatCard";
import { PremiumGamificationPanel } from "@/components/dashboard/PremiumGamificationPanel";
import { EnhancedSavedOutfitsGallery } from "@/components/dashboard/EnhancedSavedOutfitsGallery";
import { PhotoAnalysisWidget } from "@/components/dashboard/PhotoAnalysisWidget";
import { NovaProactiveSuggestion, generateProactiveSuggestions } from "@/components/nova/NovaProactiveSuggestion";
import { useEnhancedNova } from "@/hooks/useEnhancedNova";
import type { StyleProfile } from "@/engine/types";
import { generateAmbientInsights } from "@/services/nova/ambientInsights";
import { dismissInsight, getDismissedInsights, filterDismissedInsights } from "@/services/nova/dismissedInsightsService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NovaInsightCard } from "@/components/Dashboard/NovaInsightCard";
import { SmartDailyRecommendation } from "@/components/dashboard/SmartDailyRecommendation";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[Dashboard] Failed to read ${key}:`, e);
    return null;
  }
}

function safeGetArray<T>(obj: any, key: string): T[] {
  try {
    const val = obj?.[key];
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [favCount, setFavCount] = React.useState(0);
  const [userId, setUserId] = React.useState<string | undefined>();
  const [showSuccessBanner, setShowSuccessBanner] = React.useState(false);
  const queryClient = useQueryClient();
  const [userName, setUserName] = React.useState<string>("");
  const [showWelcomeTour, setShowWelcomeTour] = React.useState(false);
  const [showNovaBubble, setShowNovaBubble] = React.useState(false);
  const { context: novaContext } = useEnhancedNova();

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);

  const hasQuizData = !!(archetype || color);

  const { data: outfitsData, loading: outfitsLoading } = useOutfits({
    archetype: archetype?.name,
    limit: 6,
    enabled: hasQuizData
  });

  React.useEffect(() => {
    const client = supabase();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        setUserId(data?.user?.id);
        const email = data?.user?.email || "";
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }).catch(err => {
        console.warn('[Dashboard] Failed to get user:', err);
      });
    }

    const hasSeenWelcome = localStorage.getItem('ff_welcome_tour_completed');
    if (!hasSeenWelcome && hasQuizData) {
      setShowWelcomeTour(true);
    }
  }, [hasQuizData]);

  React.useEffect(() => {
    if (!showWelcomeTour && hasQuizData) {
      const timer = setTimeout(() => {
        setShowNovaBubble(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeTour, hasQuizData]);

  const ts = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.RESULTS_TS);
      return raw ? parseInt(raw, 10) : null;
    } catch {
      return null;
    }
  }, []);

  const outfitCount = outfitsData?.length || 0;
  const featuredOutfit = outfitsData?.[0] || null;

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
  }, []);

  const last = ts ? new Date(ts) : null;
  const lastText = last ? last.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" }) : "Vandaag";

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Goedenacht";
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  React.useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');

    if (checkoutStatus === 'success') {
      setShowSuccessBanner(true);
      toast.success('Betaling succesvol! Welkom bij FitFi Premium.');

      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  const handleCloseBanner = () => {
    setShowSuccessBanner(false);
    navigate('/dashboard', { replace: true });
  };

  const colorPalette = React.useMemo(() => {
    if (!color) return [];
    if (!color.palette) return [];
    if (!Array.isArray(color.palette)) return [];
    return color.palette.slice(0, 6);
  }, [color]);

  const hasColorPalette = colorPalette.length > 0;

  const { data: dismissedHashes } = useQuery({
    queryKey: ['dismissedInsights', userId],
    queryFn: () => getDismissedInsights(userId!),
    enabled: !!userId,
    staleTime: 60000
  });

  const rawInsights = React.useMemo(() => {
    const insights = generateAmbientInsights({
      hasQuizData,
      outfitCount,
      favCount,
      archetype: archetype?.name,
      colorPalette,
      photoAnalyzed: false
    });
    return insights || [];
  }, [hasQuizData, outfitCount, favCount, archetype, colorPalette]);

  const novaInsights = React.useMemo(() => {
    if (!dismissedHashes) return rawInsights;
    return filterDismissedInsights(rawInsights, dismissedHashes);
  }, [rawInsights, dismissedHashes]);

  const handleDismissInsight = React.useCallback(async (
    type: any,
    insight: string
  ) => {
    if (!userId) return;

    const success = await dismissInsight(userId, type, insight, 7);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['dismissedInsights', userId] });
      toast.success('Inzicht verborgen voor 7 dagen');
    }
  }, [userId, queryClient]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <OnboardingTour />

      {showWelcomeTour && (
        <WelcomeTour
          userName={userName}
          onComplete={() => setShowWelcomeTour(false)}
        />
      )}

      {showNovaBubble && (
        <NovaContextualBubble
          context="dashboard"
          onInteract={() => {
            setShowNovaBubble(false);
            navigate('/dashboard?nova=true');
          }}
        />
      )}

      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <div className="ff-container py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto fade-in-up gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-100 text-base sm:text-lg">Betaling succesvol!</h3>
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">Welkom bij FitFi Premium. Je hebt nu toegang tot alle premium features.</p>
                </div>
              </div>
              <button
                onClick={handleCloseBanner}
                className="flex-shrink-0 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors rounded-lg hover:bg-green-100 dark:hover:bg-green-900 active:scale-[0.95]"
                aria-label="Sluit melding"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Hero with Glassmorphism - Responsive padding */}
      <section className="relative overflow-hidden py-8 sm:py-12 md:py-16">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] via-[var(--color-bg)] to-[var(--ff-color-accent-50)] opacity-60"></div>

        {/* Animated blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="ff-container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

              {/* Left: Greeting & Info */}
              <div className="flex-1 fade-in-up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/80 dark:bg-[var(--color-surface)]/80 backdrop-blur-xl rounded-full text-xs sm:text-sm font-bold text-[var(--ff-color-primary-700)] mb-4 sm:mb-6 shadow-lg border border-[var(--color-border)] hover-lift">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] xs:text-xs sm:text-sm">JOUW STYLE DASHBOARD</span>
                </div>

                {/* Greeting */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-text)] mb-3 sm:mb-4 leading-tight px-4 sm:px-0">
                  {greeting},{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                      {userName || "Welkom"}
                    </span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] mb-6 sm:mb-8 max-w-2xl leading-relaxed px-4 sm:px-0">
                  {hasQuizData
                    ? `Je Style Report is klaar met ${outfitCount} outfits`
                    : "Start de quiz om je style report te krijgen"
                  }
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
                  {hasQuizData ? (
                    <>
                      <NavLink
                        to="/results"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift focus-ring-premium active:scale-[0.98] w-full sm:w-auto"
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        Bekijk resultaten
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </NavLink>
                      <NavLink
                        to="/onboarding"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 min-h-[52px] bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-50)] transition-all shadow-md hover-lift border-2 border-[var(--color-border)] active:scale-[0.98] w-full sm:w-auto"
                      >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        Opnieuw doen
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/onboarding"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift focus-ring-premium active:scale-[0.98] w-full sm:w-auto"
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        Start stijlquiz
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </NavLink>
                      <NavLink
                        to="/hoe-het-werkt"
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 min-h-[52px] bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-50)] transition-all shadow-md hover-lift border-2 border-[var(--color-border)] active:scale-[0.98] w-full sm:w-auto"
                      >
                        Hoe werkt het?
                      </NavLink>
                    </>
                  )}
                </div>

                {/* Last Updated */}
                <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-4 sm:mt-6 flex items-center gap-2 px-4 sm:px-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Laatst bijgewerkt: {lastText}
                </p>
              </div>

              {/* Right: Style Profile Card */}
              {hasQuizData && archetype && (
                <div className="w-full lg:w-auto slide-in-right">
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[var(--color-surface)]/90 dark:to-[var(--color-surface)]/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 dark:border-[var(--color-border)] hover-lift max-w-md">
                    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-lg">
                        <Crown className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-[var(--color-muted)] font-medium uppercase tracking-wide">Je Stijlarchetype</p>
                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">{archetype.name || "Onbekend"}</h3>
                      </div>
                    </div>

                    {archetype.description && typeof archetype.description === 'string' && (
                      <p className="text-sm sm:text-base text-[var(--color-muted)] mb-5 sm:mb-6 leading-relaxed">
                        {archetype.description.substring(0, 120)}...
                      </p>
                    )}

                    {hasColorPalette && (
                      <div className="border-t-2 border-[var(--color-border)] pt-5 sm:pt-6 mt-5 sm:mt-6">
                        <p className="text-xs sm:text-sm text-[var(--color-muted)] font-medium uppercase tracking-wide mb-3">Jouw Kleuren</p>
                        <div className="flex gap-2 flex-wrap">
                          {colorPalette.map((c, i) => (
                            <div
                              key={i}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg shadow-md hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <NavLink
                      to="/profile"
                      className="mt-5 sm:mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-scale active:scale-[0.98]"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      Bekijk profiel
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Smart Daily Recommendation - Temporarily disabled */}

      {/* Nova Ambient Intelligence - Only show if user has completed quiz */}
      {novaInsights.length > 0 && hasQuizData && (
        <section className="py-6 sm:py-8 bg-[var(--color-bg)]">
          <div className="ff-container">
            <div className="mb-5 sm:mb-6 fade-in-up">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[var(--ff-color-primary-100)] dark:bg-[var(--ff-color-primary-900)] rounded-full">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" />
                  <span className="text-xs sm:text-sm font-bold text-[var(--ff-color-primary-700)] uppercase tracking-wide">Styling Tips</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">
                Persoonlijk advies
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {novaInsights.slice(0, 3).map((insight, idx) => (
                <NovaInsightCard
                  key={idx}
                  type={insight.type}
                  insight={insight.insight}
                  action={insight.action}
                  actionLink={insight.actionLink}
                  confidence={insight.confidence}
                  priority={insight.priority}
                  onDismiss={() => handleDismissInsight(insight.type, insight.insight)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Analysis Widget - Only for users who completed quiz */}
      {hasQuizData && (
        <section className="py-6 sm:py-8 bg-[var(--color-bg)]">
          <div className="ff-container">
            <PhotoAnalysisWidget />
          </div>
        </section>
      )}

      {/* Stats Cards - Premium Design */}
      <section className="py-8 sm:py-12 bg-[var(--color-surface)]">
        <div className="ff-container">
          {/* Refine Style Widget - Only for users with quiz data */}
          {hasQuizData && (
            <div className="mb-8 sm:mb-12 fade-in-up" data-tour="refine-style">
              <RefineStyleWidget />
            </div>
          )}

          {/* Stats Grid - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <AnimatedStatCard
              icon={<Shirt className="w-6 h-6" />}
              label="Outfits"
              value={outfitCount}
              trend={{
                value: 12,
                isPositive: true,
                label: "deze week",
              }}
              gradient="from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
              delay={0}
            />

            <AnimatedStatCard
              icon={<Heart className="w-6 h-6" />}
              label="Favorieten"
              value={favCount}
              trend={{
                value: 8,
                isPositive: true,
                label: "nieuwe saves",
              }}
              gradient="from-pink-500 to-pink-600"
              delay={0.1}
            />

            <AnimatedStatCard
              icon={<Target className="w-6 h-6" />}
              label="Profiel"
              value={hasQuizData ? 100 : 0}
              suffix="%"
              trend={
                hasQuizData
                  ? undefined
                  : {
                      value: 100,
                      isPositive: true,
                      label: "te voltooien",
                    }
              }
              gradient="from-emerald-500 to-emerald-600"
              delay={0.2}
            />

          </div>

          {/* Gamification - Only show if user has quiz data */}
          {hasQuizData && userId && (
            <div className="mb-8 sm:mb-12 fade-in-up" data-tour="gamification">
              <PremiumGamificationPanel userId={userId} />
            </div>
          )}

          {/* Subscription Management */}
          <div className="mb-8 sm:mb-12 fade-in-up">
            <SubscriptionManager />
          </div>

          {/* Saved Outfits Gallery - Enhanced */}
          {hasQuizData && userId && (
            <div className="fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
                    Jouw <span className="text-gradient">Outfits</span>
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--color-muted)]">
                    Looks op basis van jouw stijl
                  </p>
                </div>
                <NavLink
                  to="/results"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 min-h-[48px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  Bekijk alles
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
              <EnhancedSavedOutfitsGallery userId={userId} />
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions - Enhanced Floating Buttons */}
      <div
        className="fixed right-4 sm:right-6 md:right-8 flex flex-col gap-2 sm:gap-3 z-50"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="group relative"
        >
          <NavLink
            to="/onboarding"
            className="w-12 h-12 sm:w-14 sm:h-14 min-w-[52px] min-h-[52px] rounded-full bg-[var(--ff-color-primary-700)] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-[0.95] transition-all hover:shadow-[0_0_30px_rgba(var(--ff-color-primary-rgb),0.5)] relative"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </NavLink>
          <div className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            Quiz opnieuw doen
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="group relative"
        >
          <NavLink
            to="/profile"
            className="w-12 h-12 sm:w-14 sm:h-14 min-w-[52px] min-h-[52px] rounded-full bg-[var(--color-surface)] text-[var(--color-text)] flex items-center justify-center shadow-xl hover:scale-110 active:scale-[0.95] transition-all border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)]"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </NavLink>
          <div className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            Profiel instellingen
          </div>
        </motion.div>
      </div>
    </main>
  );
}
