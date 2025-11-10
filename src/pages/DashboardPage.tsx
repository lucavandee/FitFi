import React from "react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Heart,
  Shirt,
  ArrowRight,
  RefreshCw,
  Settings,
  TrendingUp,
  Award,
  CheckCircle,
  X,
  Zap,
  Crown,
  Target,
  Clock
} from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import SavedOutfitsGallery from "@/components/dashboard/SavedOutfitsGallery";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";
import { RefineStyleWidget } from "@/components/dashboard/RefineStyleWidget";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import toast from "react-hot-toast";

function readJson<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [favCount, setFavCount] = React.useState(0);
  const [userId, setUserId] = React.useState<string | undefined>();
  const [showSuccessBanner, setShowSuccessBanner] = React.useState(false);
  const [userName, setUserName] = React.useState<string>("");

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
      });
    }
  }, []);

  const ts = React.useMemo(() => {
    try { const raw = localStorage.getItem(LS_KEYS.RESULTS_TS); return raw ? parseInt(raw, 10) : null; } catch { return null; }
  }, []);

  const outfitCount = outfitsData?.length || 0;
  const featuredOutfit = outfitsData?.[0] || null;

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(favs.length);
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <OnboardingTour />

      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw persoonlijke style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <div className="ff-container py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto fade-in-up">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">Betaling succesvol!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Welkom bij FitFi Premium. Je hebt nu toegang tot alle premium features.</p>
                </div>
              </div>
              <button
                onClick={handleCloseBanner}
                className="flex-shrink-0 p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors rounded-lg hover:bg-green-100 dark:hover:bg-green-900"
                aria-label="Sluit melding"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Hero with Glassmorphism */}
      <section className="relative overflow-hidden py-12 md:py-16">
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
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-[var(--color-surface)]/80 backdrop-blur-xl rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-6 shadow-lg border border-[var(--color-border)] hover-lift">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  JOUW STYLE DASHBOARD
                </div>

                {/* Greeting */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-4 leading-tight">
                  {greeting},{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                      {userName || "Welkom"}
                    </span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-[var(--color-muted)] mb-8 max-w-2xl leading-relaxed">
                  {hasQuizData
                    ? `Je Style Report is klaar met ${outfitCount} gepersonaliseerde outfits`
                    : "Start de quiz om je persoonlijke style report te ontdekken"
                  }
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {hasQuizData ? (
                    <>
                      <NavLink
                        to="/results"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift focus-ring-premium"
                      >
                        <Sparkles className="w-5 h-5" />
                        Bekijk resultaten
                        <ArrowRight className="w-5 h-5" />
                      </NavLink>
                      <NavLink
                        to="/onboarding"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-50)] transition-all shadow-md hover-lift border-2 border-[var(--color-border)]"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Opnieuw doen
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/onboarding"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift focus-ring-premium"
                      >
                        <Sparkles className="w-5 h-5" />
                        Start stijlquiz
                        <ArrowRight className="w-5 h-5" />
                      </NavLink>
                      <NavLink
                        to="/hoe-het-werkt"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-50)] transition-all shadow-md hover-lift border-2 border-[var(--color-border)]"
                      >
                        Hoe werkt het?
                      </NavLink>
                    </>
                  )}
                </div>

                {/* Last Updated */}
                <p className="text-sm text-[var(--color-muted)] mt-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Laatst bijgewerkt: {lastText}
                </p>
              </div>

              {/* Right: Style Profile Card */}
              {hasQuizData && archetype && (
                <div className="w-full lg:w-auto slide-in-right">
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-[var(--color-surface)]/90 dark:to-[var(--color-surface)]/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/50 dark:border-[var(--color-border)] hover-lift card-interactive max-w-md">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-lg">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted)] font-medium uppercase tracking-wide">Je Stijlarchetype</p>
                        <h3 className="text-2xl font-bold text-[var(--color-text)]">{archetype.name}</h3>
                      </div>
                    </div>

                    {archetype.description && (
                      <p className="text-[var(--color-muted)] mb-6 leading-relaxed">
                        {archetype.description.substring(0, 120)}...
                      </p>
                    )}

                    {color && (
                      <div className="border-t-2 border-[var(--color-border)] pt-6 mt-6">
                        <p className="text-sm text-[var(--color-muted)] font-medium uppercase tracking-wide mb-3">Jouw Kleuren</p>
                        <div className="flex gap-2 flex-wrap">
                          {color.palette.slice(0, 6).map((c, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-lg shadow-md hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <NavLink
                      to="/profile"
                      className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-scale"
                    >
                      <Settings className="w-4 h-4" />
                      Bekijk profiel
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards - Premium Design */}
      <section className="py-12 bg-[var(--color-surface)]">
        <div className="ff-container">
          {/* Refine Style Widget */}
          <div className="mb-12 fade-in-up" data-tour="refine-style">
            <RefineStyleWidget />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-fade-in">

            {/* Outfits Card */}
            <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-white dark:from-[var(--ff-color-primary-900)]/20 dark:to-[var(--color-bg)] rounded-2xl p-6 shadow-lg hover-lift card-interactive border-2 border-[var(--color-border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-600)] flex items-center justify-center shadow-md">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">{outfitCount}</div>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Outfits</h3>
              <p className="text-sm text-[var(--color-muted)]">Gepersonaliseerd voor jou</p>
            </div>

            {/* Favorites Card */}
            <div className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-[var(--color-bg)] rounded-2xl p-6 shadow-lg hover-lift card-interactive border-2 border-[var(--color-border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">{favCount}</div>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Favorieten</h3>
              <p className="text-sm text-[var(--color-muted)]">Je saved looks</p>
            </div>

            {/* Profile Progress Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-[var(--color-bg)] rounded-2xl p-6 shadow-lg hover-lift card-interactive border-2 border-[var(--color-border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">
                  {hasQuizData ? "100" : "0"}%
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Profiel</h3>
              <p className="text-sm text-[var(--color-muted)]">
                {hasQuizData ? "Helemaal klaar!" : "Start de quiz"}
              </p>
            </div>

            {/* Activity Card */}
            <div className="bg-gradient-to-br from-[var(--ff-color-accent-50)] to-white dark:from-[var(--ff-color-accent-900)]/20 dark:to-[var(--color-bg)] rounded-2xl p-6 shadow-lg hover-lift card-interactive border-2 border-[var(--color-border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">
                  {hasQuizData ? "12" : "0"}
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Activiteit</h3>
              <p className="text-sm text-[var(--color-muted)]">Views deze week</p>
            </div>
          </div>

          {/* Gamification - Premium Widget */}
          <div className="mb-12 fade-in-up" data-tour="gamification">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2">
                Jouw <span className="text-gradient">Progressie</span>
              </h2>
              <p className="text-[var(--color-muted)]">
                Verdien XP, unlock achievements en level up je style
              </p>
            </div>
            <GamificationWidget />
          </div>

          {/* Subscription Management */}
          <div className="mb-12 fade-in-up">
            <SubscriptionManager />
          </div>

          {/* Saved Outfits Gallery */}
          {hasQuizData && (
            <div className="fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2">
                    Jouw <span className="text-gradient">Outfits</span>
                  </h2>
                  <p className="text-[var(--color-muted)]">
                    Gepersonaliseerde looks speciaal voor jou samengesteld
                  </p>
                </div>
                <NavLink
                  to="/results"
                  className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift"
                >
                  Bekijk alles
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
              <SavedOutfitsGallery />
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions - Floating */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <NavLink
          to="/onboarding"
          className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-700)] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover-glow"
          title="Opnieuw doen"
        >
          <RefreshCw className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/profile"
          className="w-14 h-14 rounded-full bg-[var(--color-surface)] text-[var(--color-text)] flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-2 border-[var(--color-border)]"
          title="Instellingen"
        >
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </main>
  );
}
