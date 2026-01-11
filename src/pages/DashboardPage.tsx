import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Heart, Shirt, RefreshCw, Settings, Camera, TrendingUp, Target, Zap, Crown, ArrowRight } from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateAmbientInsights } from "@/services/nova/ambientInsights";
import { dismissInsight, getDismissedInsights, filterDismissedInsights } from "@/services/nova/dismissedInsightsService";
import { EnhancedFAB } from "@/components/ui/EnhancedFAB";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Premium Dashboard Page v3
 *
 * World-class design naar Stripe × Apple × Linear:
 * - Ultra-premium hero met gradient + depth
 * - Bold elevated typography
 * - Rich color palette uit tokens
 * - Visual layering & shadows
 * - Warm luxe materials
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = React.useState<string | undefined>();
  const [userName, setUserName] = React.useState<string>("");
  const [favCount, setFavCount] = React.useState(0);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const hasQuizData = !!(archetype || color);

  const { data: outfitsData, loading: outfitsLoading } = useOutfits({
    archetype: archetype?.name,
    limit: 6,
    enabled: hasQuizData
  });

  // Get user
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
  }, []);

  // Get favorites count
  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
  }, []);

  // Greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Goedenacht";
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  // Color palette
  const colorPalette = React.useMemo(() => {
    if (!color?.palette || !Array.isArray(color.palette)) return [];
    return color.palette.slice(0, 6);
  }, [color]);

  // Nova insights
  const { data: dismissedHashes } = useQuery({
    queryKey: ['dismissedInsights', userId],
    queryFn: () => getDismissedInsights(userId!),
    enabled: !!userId,
    staleTime: 60000
  });

  const rawInsights = React.useMemo(() => {
    const insights = generateAmbientInsights({
      hasQuizData,
      outfitCount: outfitsData?.length || 0,
      favCount,
      archetype: archetype?.name,
      colorPalette,
      photoAnalyzed: false
    });
    return insights || [];
  }, [hasQuizData, outfitsData?.length, favCount, archetype, colorPalette]);

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

  // Mock gamification data
  const gamificationData = {
    level: 3,
    xp: 420,
    xpToNextLevel: 500,
    streak: 7
  };

  const progress = (gamificationData.xp / gamificationData.xpToNextLevel) * 100;

  if (!hasQuizData) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <Helmet>
          <title>Dashboard - FitFi</title>
        </Helmet>

        {/* Premium empty state with gradient */}
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-25)] via-[var(--color-bg)] to-[var(--ff-color-accent-50)]" />

          {/* Decorative shapes */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--ff-color-accent-100)] rounded-full blur-3xl opacity-20" />

          <div className="ff-container py-12 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative inline-flex mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-3xl blur-xl opacity-40" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <h1 className="text-6xl sm:text-7xl font-bold text-[var(--color-text)] mb-6 tracking-tight">
                  Start je stijlreis
                </h1>
                <p className="text-xl text-[var(--color-muted)] mb-10 leading-relaxed max-w-lg mx-auto">
                  Ontdek jouw persoonlijke stijl met onze AI-powered quiz in slechts 5 minuten
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] text-white rounded-2xl text-lg font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Start stijlquiz
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Ultra-Premium Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-25)] via-[var(--color-bg)] to-[var(--ff-color-accent-50)]" />

        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--ff-color-primary-100)] to-transparent rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--ff-color-accent-100)] to-transparent rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/4" />

        <div className="relative py-16 sm:py-24 border-b border-[var(--color-border)]">
          <div className="ff-container">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Greeting Label */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] shadow-sm mb-6">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)]" />
                  <span className="text-sm font-semibold text-[var(--color-muted)]">
                    {greeting}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[var(--color-text)] mb-6 tracking-tight leading-none">
                  {userName || "Dashboard"}
                </h1>

                {/* Subtitle with Rich Info */}
                <p className="text-xl sm:text-2xl text-[var(--color-muted)] max-w-3xl leading-relaxed mb-12">
                  Jouw persoonlijke stijl dashboard.{' '}
                  <span className="font-semibold text-[var(--color-text)]">
                    {outfitsData?.length || 0} outfits
                  </span>
                  {' '}gecureerd voor jouw{' '}
                  <span className="font-semibold text-[var(--ff-color-primary-700)]">
                    {archetype?.name || 'stijl'}
                  </span>.
                </p>

                {/* Premium Stats Row */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    onClick={() => navigate('/results')}
                    className="group relative p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <Shirt className="w-10 h-10 mb-4 opacity-90" strokeWidth={2} />
                      <p className="text-5xl font-bold mb-2">{outfitsData?.length || 0}</p>
                      <p className="text-base font-semibold opacity-90">Outfits</p>
                    </div>
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative p-8 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl overflow-hidden"
                  >
                    <div className="relative">
                      <Heart className="w-10 h-10 mb-4 opacity-90" strokeWidth={2} />
                      <p className="text-5xl font-bold mb-2">{favCount}</p>
                      <p className="text-base font-semibold opacity-90">Favorieten</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl overflow-hidden"
                  >
                    <div className="relative">
                      <Zap className="w-10 h-10 mb-4 opacity-90" strokeWidth={2} />
                      <p className="text-5xl font-bold mb-2">{gamificationData.level}</p>
                      <p className="text-base font-semibold opacity-90">Niveau</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout with Sidebar */}
      <div className="ff-container py-8 sm:py-12 lg:py-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">

            {/* Desktop Sidebar Navigation - Left */}
            <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <p className="px-4 text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-4">
                  Navigatie
                </p>

                <button
                  onClick={() => navigate('/results')}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-[var(--color-surface)] border-2 border-transparent hover:border-[var(--ff-color-primary-300)] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Shirt className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] mb-0.5">Outfits</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">Bekijk alle looks</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-[var(--color-surface)] border-2 border-transparent hover:border-[var(--ff-color-primary-300)] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] mb-0.5">Profiel</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">Instellingen</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-[var(--color-surface)] border-2 border-transparent hover:border-[var(--ff-color-primary-300)] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] mb-0.5">Quiz Opnieuw</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">Update stijl</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/onboarding?step=photo')}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-[var(--color-surface)] border-2 border-transparent hover:border-[var(--ff-color-primary-300)] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] mb-0.5">Upload Foto</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">AI analyse</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Quick Stats in Sidebar */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <p className="px-4 text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-4">
                    Statistieken
                  </p>
                  <div className="space-y-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Outfits</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">{outfitsData?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Favorieten</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">{favCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Niveau</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">{gamificationData.level}</span>
                    </div>
                    {gamificationData.streak > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-muted)]">Streak</span>
                        <span className="text-sm font-bold text-orange-600">{gamificationData.streak} 🔥</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column - Main Widgets */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Style Profile Card */}
              {archetype && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="p-10 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-2xl blur-xl opacity-30" />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0 shadow-xl">
                        <Crown className="w-10 h-10 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-3 opacity-75">
                        Jouw Stijl
                      </p>
                      <h2 className="text-4xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
                        {archetype.name}
                      </h2>
                      {archetype.description && (
                        <p className="text-base text-[var(--color-muted)] mb-6 leading-relaxed">
                          {archetype.description}
                        </p>
                      )}

                      {colorPalette.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-4 opacity-75">
                            Jouw Kleuren
                          </p>
                          <div className="flex gap-3">
                            {colorPalette.map((color, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                                className="relative group"
                              >
                                <div className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity" style={{ backgroundColor: color }} />
                                <div
                                  className="relative w-14 h-14 rounded-xl shadow-md border-2 border-white/50 group-hover:scale-110 transition-transform duration-200"
                                  style={{ backgroundColor: color }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => navigate('/profile')}
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-neutral-100)] hover:bg-[var(--ff-color-neutral-200)] text-[var(--color-text)] rounded-xl text-sm font-bold transition-all duration-200"
                      >
                        Bekijk profiel
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Nova Insight Card */}
              {novaInsights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="p-10 rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] shadow-lg"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 shadow-md">
                      <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest text-[var(--ff-color-primary-700)] font-bold mb-3">
                        Nova Styling Tip
                      </p>
                      <p className="text-lg text-[var(--color-text)] leading-relaxed mb-5 font-medium">
                        {novaInsights[0].insight}
                      </p>
                      {novaInsights[0].actionLink && (
                        <button
                          onClick={() => navigate(novaInsights[0].actionLink!)}
                          className="group inline-flex items-center gap-2 text-sm font-bold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
                        >
                          {novaInsights[0].action || 'Bekijk'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions Grid - Responsive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6"
              >
                <button
                  onClick={() => navigate('/results')}
                  className="group p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-lg hover:shadow-xl transition-all duration-300 text-left"
                >
                  <Sparkles className="w-10 h-10 text-[var(--ff-color-primary-700)] mb-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                    Nieuwe outfits
                  </h3>
                  <p className="text-base text-[var(--color-muted)]">
                    Bekijk je matches
                  </p>
                </button>

                <button
                  onClick={() => navigate('/onboarding?step=photo')}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <Camera className="w-10 h-10 mb-5 opacity-90 group-hover:scale-110 transition-transform" strokeWidth={2} />
                    <h3 className="text-xl font-bold mb-2">
                      Upload foto
                    </h3>
                    <p className="text-base opacity-90">
                      Krijg AI advies
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="group p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-lg hover:shadow-xl transition-all duration-300 text-left"
                >
                  <Settings className="w-10 h-10 text-[var(--color-muted)] mb-5 group-hover:scale-110 group-hover:text-[var(--ff-color-primary-700)] transition-all" strokeWidth={2} />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                    Instellingen
                  </h3>
                  <p className="text-base text-[var(--color-muted)]">
                    Pas profiel aan
                  </p>
                </button>

                <button
                  onClick={() => navigate('/dashboard?tab=stats')}
                  className="group p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-lg hover:shadow-xl transition-all duration-300 text-left"
                >
                  <TrendingUp className="w-10 h-10 text-[var(--color-muted)] mb-5 group-hover:scale-110 group-hover:text-[var(--ff-color-primary-700)] transition-all" strokeWidth={2} />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                    Progress
                  </h3>
                  <p className="text-base text-[var(--color-muted)]">
                    Bekijk statistieken
                  </p>
                </button>
              </motion.div>
            </div>

            {/* Right Column - Stats & Featured Widgets */}
            <aside className="lg:w-96 xl:w-[420px] flex-shrink-0 space-y-6 lg:space-y-8">
              {/* Level Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-3 opacity-75">
                      Niveau
                    </p>
                    <p className="text-6xl font-bold text-[var(--color-text)] tracking-tight">
                      {gamificationData.level}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-lg opacity-30" />
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                      <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--color-muted)] font-semibold">
                      {gamificationData.xp} / {gamificationData.xpToNextLevel} XP
                    </span>
                    <span className="text-sm font-bold text-[var(--ff-color-primary-700)]">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--ff-color-neutral-200)] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>

                {/* Streak */}
                {gamificationData.streak > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-200/50 shadow-sm">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <p className="text-base font-bold text-orange-900">
                        {gamificationData.streak} dagen streak
                      </p>
                      <p className="text-sm text-orange-700 font-medium">
                        Ga zo door!
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Featured Outfit Card */}
              {outfitsData && outfitsData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                >
                  <div className="relative aspect-[3/4] bg-[var(--ff-color-neutral-100)]">
                    {outfitsData[0]?.image && (
                      <img
                        src={outfitsData[0].image}
                        alt="Featured outfit"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <p className="text-sm text-white/70 mb-2 font-semibold uppercase tracking-wider">Jouw Outfits</p>
                      <p className="text-4xl font-bold text-white mb-6">
                        {outfitsData.length} looks
                      </p>
                      <button
                        onClick={() => navigate('/results')}
                        className="w-full px-6 py-4 bg-white text-black rounded-2xl text-base font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-xl"
                      >
                        Bekijk alles
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </aside>
            {/* End Right Column */}

          </div>
          {/* End Flex Container */}
        </div>
        {/* End max-w Container */}
      </div>
      {/* End ff-container */}

      {/* Loading State Skeleton - Show while outfits loading */}
      {outfitsLoading && (
        <div className="ff-container pb-16">
          <div className="max-w-[1600px] mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-[var(--color-surface)] rounded-3xl" />
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="h-48 bg-[var(--color-surface)] rounded-3xl" />
                <div className="h-48 bg-[var(--color-surface)] rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced FAB */}
      <EnhancedFAB
        actions={[
          {
            icon: RefreshCw,
            label: 'Quiz opnieuw',
            onClick: () => navigate('/onboarding')
          },
          {
            icon: Camera,
            label: 'Upload foto',
            onClick: () => navigate('/onboarding?step=photo')
          },
          {
            icon: Settings,
            label: 'Instellingen',
            onClick: () => navigate('/profile')
          }
        ]}
      />
    </main>
  );
}
