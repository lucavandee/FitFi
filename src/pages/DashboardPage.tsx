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
 * Premium Dashboard Page v2
 *
 * Redesigned naar Apple × Linear × Notion niveau:
 * - Bold hero section met motivational subtitle
 * - Large elevated stats cards met depth
 * - 2-column balanced desktop layout
 * - Featured outfit showcase met visuals
 * - Premium typography & spacing
 * - Subtle animations & layering
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
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Helmet>
          <title>Dashboard - FitFi</title>
        </Helmet>

        <div className="ff-container py-12">
          <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[var(--color-text)] mb-3">
                Start je stijlreis
              </h1>
              <p className="text-lg text-[var(--color-muted)] mb-8">
                Ontdek jouw persoonlijke stijl met onze AI-powered quiz in 5 minuten
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-base font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Start stijlquiz
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
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

      {/* Premium Hero Section */}
      <div className="relative py-12 sm:py-16 bg-gradient-to-b from-[var(--ff-color-neutral-50)] to-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-medium text-[var(--color-muted)] mb-3">
                {greeting}
              </p>
              <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] mb-4">
                {userName || "Dashboard"}
              </h1>
              <p className="text-lg text-[var(--color-muted)] max-w-2xl">
                Jouw persoonlijke stijl dashboard. {outfitsData?.length || 0} outfits gecureerd voor jouw {archetype?.name || 'stijl'}.
              </p>
            </motion.div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                onClick={() => navigate('/results')}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Shirt className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-4xl font-bold mb-1">{outfitsData?.length || 0}</p>
                  <p className="text-sm font-medium opacity-90">Outfits</p>
                </div>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <Heart className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-4xl font-bold mb-1">{favCount}</p>
                  <p className="text-sm font-medium opacity-90">Favorieten</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <Zap className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-4xl font-bold mb-1">{gamificationData.level}</p>
                  <p className="text-sm font-medium opacity-90">Niveau</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="ff-container py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Left Column - Main Widgets */}
            <div className="space-y-6">
              {/* Style Profile Card */}
              {archetype && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0 shadow-md">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-2">
                        Jouw Stijl
                      </p>
                      <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {archetype.name}
                      </h2>
                      {archetype.description && (
                        <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                          {archetype.description}
                        </p>
                      )}

                      {colorPalette.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-3">
                            Kleuren
                          </p>
                          <div className="flex gap-2">
                            {colorPalette.map((color, i) => (
                              <div
                                key={i}
                                className="w-12 h-12 rounded-xl shadow-sm border border-black/10"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => navigate('/profile')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-neutral-100)] hover:bg-[var(--ff-color-neutral-200)] text-[var(--color-text)] rounded-xl text-sm font-semibold transition-colors"
                      >
                        Bekijk profiel
                        <ArrowRight className="w-4 h-4" />
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
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-[var(--ff-color-primary-700)] font-bold mb-2">
                        Nova Styling Tip
                      </p>
                      <p className="text-base text-[var(--color-text)] leading-relaxed mb-4">
                        {novaInsights[0].insight}
                      </p>
                      {novaInsights[0].actionLink && (
                        <button
                          onClick={() => navigate(novaInsights[0].actionLink!)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
                        >
                          {novaInsights[0].action || 'Bekijk'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <button
                  onClick={() => navigate('/results')}
                  className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-sm hover:shadow-md transition-all text-left"
                >
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-700)] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                    Nieuwe outfits
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Bekijk je matches
                  </p>
                </button>

                <button
                  onClick={() => navigate('/onboarding?step=photo')}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Camera className="w-8 h-8 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold mb-1">
                      Upload foto
                    </h3>
                    <p className="text-sm opacity-90">
                      Krijg AI advies
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-sm hover:shadow-md transition-all text-left"
                >
                  <Settings className="w-8 h-8 text-[var(--color-muted)] mb-4 group-hover:scale-110 group-hover:text-[var(--ff-color-primary-700)] transition-all" />
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                    Instellingen
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Pas profiel aan
                  </p>
                </button>

                <button
                  onClick={() => navigate('/dashboard?tab=stats')}
                  className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-sm hover:shadow-md transition-all text-left"
                >
                  <TrendingUp className="w-8 h-8 text-[var(--color-muted)] mb-4 group-hover:scale-110 group-hover:text-[var(--ff-color-primary-700)] transition-all" />
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                    Progress
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Bekijk statistieken
                  </p>
                </button>
              </motion.div>
            </div>

            {/* Right Column - Sidebar Widgets */}
            <div className="space-y-6">
              {/* Level Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-2">
                      Niveau
                    </p>
                    <p className="text-5xl font-bold text-[var(--color-text)]">
                      {gamificationData.level}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-muted)] font-medium">
                      {gamificationData.xp} / {gamificationData.xpToNextLevel} XP
                    </span>
                    <span className="text-sm font-bold text-[var(--ff-color-primary-700)]">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--ff-color-neutral-200)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Streak */}
                {gamificationData.streak > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="text-sm font-bold text-orange-900">
                        {gamificationData.streak} dagen streak
                      </p>
                      <p className="text-xs text-orange-700">
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
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-sm text-white/80 mb-1 font-medium">Jouw Outfits</p>
                      <p className="text-3xl font-bold text-white mb-4">
                        {outfitsData.length} looks
                      </p>
                      <button
                        onClick={() => navigate('/results')}
                        className="w-full px-5 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                      >
                        Bekijk alles
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

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
