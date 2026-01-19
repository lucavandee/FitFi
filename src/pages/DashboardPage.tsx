import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Heart, Camera, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
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
 * Dashboard V4 - Premium Minimal
 *
 * Design Philosophy: Instagram × Notion
 * - Visual-first (grote outfit hero)
 * - Minimaal maar powerful
 * - Consistent warm palet (geen blue/pink/purple)
 * - Mobile-perfect
 * - Clear hierarchy
 */
export default function DashboardPageV4() {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string | undefined>();
  const [userName, setUserName] = React.useState<string>("");
  const [favCount, setFavCount] = React.useState(0);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const hasQuizData = !!(archetype || color);

  const { data: outfitsData, loading: outfitsLoading } = useOutfits({
    archetype: archetype?.name,
    limit: 12,
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
      }).catch(() => {});
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

  // Empty State
  if (!hasQuizData) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <Helmet>
          <title>Dashboard - FitFi</title>
        </Helmet>

        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-25)] via-[var(--color-bg)] to-[var(--ff-color-accent-50)]" />

          <div className="ff-container py-12 relative z-10">
            <div className="max-w-xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-lg mx-auto mb-8">
                  <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] mb-4 tracking-tight">
                  Start je stijlreis
                </h1>
                <p className="text-lg text-[var(--color-muted)] mb-8 leading-relaxed">
                  Ontdek jouw persoonlijke stijl in 5 minuten
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-base font-bold hover:bg-[var(--ff-color-primary-600)] transition-all duration-200 hover:shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Start stijlquiz
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
        <meta name="description" content="Jouw persoonlijke style dashboard." />
      </Helmet>

      <div className="ff-container py-8 sm:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">

          {/* Simple Hero - No gradient chaos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm text-[var(--color-muted)] mb-2">
              {greeting}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
              {userName}
            </h1>
            <p className="text-lg text-[var(--color-muted)]">
              {outfitsData?.length || 0} outfits voor jouw{' '}
              <span className="text-[var(--ff-color-primary-700)] font-semibold">
                {archetype?.name || 'stijl'}
              </span>
            </p>
          </motion.div>

          {/* Mini Stats - Clean, inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--color-border)]"
          >
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)] transition-colors"
            >
              <span className="text-3xl font-bold">{outfitsData?.length || 0}</span>
              <span className="text-sm text-[var(--color-muted)]">Outfits</span>
            </button>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--color-muted)]" />
              <span className="text-lg font-semibold text-[var(--color-text)]">{favCount}</span>
              <span className="text-sm text-[var(--color-muted)]">Favorieten</span>
            </div>
          </motion.div>

          {/* Featured Outfit - HERO (Instagram-style) */}
          {outfitsData && outfitsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                  Jouw laatste outfits
                </h2>
                <button
                  onClick={() => navigate('/results')}
                  className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
                >
                  Bekijk alles
                </button>
              </div>

              {/* Featured outfit - GROOT */}
              <div
                onClick={() => navigate('/results')}
                className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-[var(--ff-color-neutral-100)] cursor-pointer group mb-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {outfitsData[0]?.image && (
                  <img
                    src={outfitsData[0].image}
                    alt="Featured outfit"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-white/70 mb-1 font-medium uppercase tracking-wider">
                        Match voor {archetype?.name}
                      </p>
                      <p className="text-3xl sm:text-4xl font-bold text-white">
                        Ontdek je looks
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-6 h-6 text-[var(--color-text)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini outfit grid (3 thumbnails) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {outfitsData.slice(1, 4).map((outfit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                    onClick={() => navigate('/results')}
                    className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--ff-color-neutral-100)] cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    {outfit.image && (
                      <img
                        src={outfit.image}
                        alt={`Outfit ${i + 2}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions - Simple cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            <button
              onClick={() => navigate('/onboarding?step=photo')}
              className="group p-6 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] transition-all text-left"
            >
              <Camera className="w-8 h-8 text-[var(--ff-color-primary-700)] mb-3 group-hover:scale-110 transition-transform" strokeWidth={2} />
              <p className="text-base font-bold text-[var(--color-text)] mb-1">
                Upload foto
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Krijg AI advies
              </p>
            </button>

            <button
              onClick={() => navigate('/onboarding')}
              className="group p-6 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] transition-all text-left"
            >
              <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-700)] mb-3 group-hover:scale-110 transition-transform" strokeWidth={2} />
              <p className="text-base font-bold text-[var(--color-text)] mb-1">
                Update stijl
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Doe quiz opnieuw
              </p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group p-6 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] transition-all text-left"
            >
              <TrendingUp className="w-8 h-8 text-[var(--ff-color-primary-700)] mb-3 group-hover:scale-110 transition-transform" strokeWidth={2} />
              <p className="text-base font-bold text-[var(--color-text)] mb-1">
                Instellingen
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Profiel beheren
              </p>
            </button>
          </motion.div>

          {/* Style Profile Card - Subtle */}
          {archetype && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-25)] to-[var(--ff-color-accent-25)] border border-[var(--ff-color-primary-100)]"
            >
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-3">
                Jouw Stijl DNA
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                {archetype.name}
              </h3>
              {archetype.description && (
                <p className="text-base text-[var(--color-muted)] leading-relaxed mb-6">
                  {archetype.description}
                </p>
              )}

              {color?.palette && Array.isArray(color.palette) && color.palette.length > 0 && (
                <div className="flex gap-2">
                  {color.palette.slice(0, 8).map((colorVal, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg shadow-sm border border-white/50"
                      style={{ backgroundColor: colorVal }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      {/* FAB - Simple Plus button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        onClick={() => navigate('/results')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--ff-color-primary-700)] text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50"
        aria-label="Nieuwe outfits bekijken"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>
    </main>
  );
}
