import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, Share2, Sparkles, RefreshCw, TrendingUp, Award, ArrowRight, ShoppingBag, Heart, Zap, Star, Check, Download } from "lucide-react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { getSeedOutfits, OutfitSeed } from "@/lib/quiz/seeds";
import { useOutfits } from "@/hooks/useOutfits";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useUser } from "@/context/UserContext";
import { SaveOutfitsModal } from "@/components/results/SaveOutfitsModal";
import SmartImage from "@/components/ui/SmartImage";
import type { Outfit } from "@/services/data/types";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useFadeInOnVisible(ref);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function EnhancedResultsPage() {
  const { user } = useUser();
  const { shouldShow: showExitIntent, dismiss: dismissExitIntent } = useExitIntent({
    enabled: !user,
    maxDisplays: 1,
    threshold: 50,
  });

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
    } catch {}
  }, []);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetypeRaw = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);

  const hasCompletedQuiz = !!answers;

  // Parse archetype safely - can be string or object
  const archetypeName = React.useMemo(() => {
    if (!archetypeRaw) return "Smart Casual";
    if (typeof archetypeRaw === 'string') return archetypeRaw;
    if (archetypeRaw && typeof archetypeRaw === 'object' && 'name' in archetypeRaw) {
      return archetypeRaw.name;
    }
    return "Smart Casual";
  }, [archetypeRaw]);

  const { data: realOutfits, loading: outfitsLoading } = useOutfits({
    archetype: archetypeName,
    limit: 9,
    enabled: hasCompletedQuiz
  });

  const seeds: OutfitSeed[] = React.useMemo(() => {
    if (color) return getSeedOutfits(color, archetypeName);
    return getSeedOutfits(
      {
        temperature: "neutraal",
        value: "medium",
        contrast: "laag",
        chroma: "zacht",
        season: "zomer",
        paletteName: "Soft Cool Tonals (neutraal)",
        notes: ["Tonal outfits met zachte texturen.", "Vermijd harde contrasten."],
      },
      "Smart Casual"
    );
  }, [color, archetypeName]);

  const displayOutfits: (Outfit | OutfitSeed)[] = React.useMemo(() => {
    if (realOutfits && realOutfits.length > 0) {
      return realOutfits;
    }
    return seeds;
  }, [realOutfits, seeds]);

  const [favs, setFavs] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]");
    } catch {
      return [];
    }
  });

  const [showShareModal, setShowShareModal] = React.useState(false);

  function toggleFav(id: string) {
    setFavs((curr) => {
      const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
      try {
        localStorage.setItem("ff_fav_outfits", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function sharePage() {
    const url = typeof window !== "undefined" ? window.location.href : "https://fitfi.ai/results";
    if (navigator.share) {
      navigator.share({ title: "Mijn FitFi Style Report", url }).catch(() => setShowShareModal(true));
    } else {
      setShowShareModal(true);
    }
  }

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <Helmet>
        <title>Jouw Style Report – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel met outfit-aanbevelingen en kleuradvies." />
      </Helmet>

      <SaveOutfitsModal
        isOpen={showExitIntent}
        onClose={dismissExitIntent}
        outfitCount={displayOutfits.length}
      />

      <Breadcrumbs />

      {/* Premium Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden py-24 md:py-32 lg:py-40"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)]">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-[var(--ff-color-primary-200)] rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-[var(--ff-color-accent-200)] rounded-full blur-3xl"
          />
        </div>

        <div className="ff-container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-full text-sm font-bold mb-8 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Jouw Persoonlijke Style Report
            </motion.div>

            {hasCompletedQuiz ? (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-5xl md:text-6xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
                >
                  Je stijl,
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-primary-600)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                  >
                    perfect ontcijferd
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                >
                  We hebben <strong className="font-semibold text-[var(--ff-color-primary-700)]">{displayOutfits.length} unieke outfits</strong> samengesteld die perfect
                  <br className="hidden md:block" /> bij jouw {archetypeName} stijl passen
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sharePage}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-2xl font-semibold hover:bg-[var(--color-surface)] transition-all shadow-lg"
                  >
                    <Share2 className="w-5 h-5" />
                    Deel je stijl
                  </motion.button>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <NavLink
                      to="/onboarding"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-2xl font-semibold hover:bg-[var(--color-surface)] transition-all shadow-lg"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Opnieuw doen
                    </NavLink>
                  </motion.div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">{displayOutfits.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Outfits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">100%</div>
                    <div className="text-sm text-gray-600 font-medium">Op maat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">{favs.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Favorieten</div>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-5xl md:text-6xl lg:text-8xl font-bold mb-8 leading-[1.1]"
                >
                  Ontdek jouw
                  <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                    perfecte stijl
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                  Voltooi de stijlquiz om je persoonlijke outfit-aanbevelingen te ontvangen
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NavLink
                    to="/onboarding"
                    className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    <Sparkles className="w-6 h-6" />
                    Start Style Quiz
                    <ArrowRight className="w-6 h-6" />
                  </NavLink>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-10 w-20 h-20 border-4 border-[var(--ff-color-primary-300)] rounded-full opacity-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 left-10 w-32 h-32 border-4 border-[var(--ff-color-accent-300)] rounded-full opacity-20"
        />
      </motion.section>

      {/* Style DNA Section */}
      {hasCompletedQuiz && color && (
        <section className="py-20 md:py-32 bg-[var(--color-surface)]/30 relative">
          <div className="ff-container">
            <AnimatedSection>
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-bold mb-6">
                  <Zap className="w-4 h-4" />
                  Jouw Style DNA
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Perfect afgestemd
                  <span className="block text-[var(--ff-color-primary-600)] mt-2">{color.paletteName}</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Elk element is zorgvuldig geanalyseerd om jouw unieke stijl te bepalen
                </p>
              </div>
            </AnimatedSection>

            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                <AnimatedSection delay={0.1}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-8 shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)] flex items-center justify-center mb-6">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Archetype</h3>
                    <p className="text-3xl font-bold text-[var(--ff-color-primary-600)] mb-2">{archetypeName}</p>
                    <p className="text-sm text-gray-600">Jouw basis stijl</p>
                  </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-8 shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-500)] mb-6"></div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Seizoen</h3>
                    <p className="text-3xl font-bold capitalize mb-2">{color.season}</p>
                    <p className="text-sm text-gray-600 capitalize">{color.temperature} tonen</p>
                  </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-8 shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-accent-400)] to-[var(--ff-color-accent-600)] flex items-center justify-center mb-6">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Contrast</h3>
                    <p className="text-3xl font-bold capitalize mb-2">{color.contrast}</p>
                    <p className="text-sm text-gray-600">Lichtheid: {color.value}</p>
                  </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                  <motion.div
                    whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-8 shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Chroma</h3>
                    <p className="text-3xl font-bold capitalize mb-2">{color.chroma}</p>
                    <p className="text-sm text-gray-600">Kleurintensiteit</p>
                  </motion.div>
                </AnimatedSection>
              </div>

              {/* Style Tips */}
              <AnimatedSection delay={0.5}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--ff-color-primary-25)] rounded-3xl border border-[var(--color-border)] p-10 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Persoonlijke Styling Tips</h3>
                  </div>
                  <ul className="space-y-4">
                    {color.notes.map((note, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4 group"
                      >
                        <div className="mt-1 w-6 h-6 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-600)] transition-colors">
                          <Check className="w-4 h-4 text-[var(--ff-color-primary-600)] group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">{note}</p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* Outfit Gallery - Premium */}
      {hasCompletedQuiz && (
        <section className="py-20 md:py-32 relative">
          <div className="ff-container">
            <AnimatedSection>
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-accent-100)] text-[var(--ff-color-accent-700)] rounded-full text-sm font-bold mb-6">
                  <ShoppingBag className="w-4 h-4" />
                  Jouw Outfits
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Handpicked <span className="text-[var(--ff-color-primary-600)]">voor jou</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {displayOutfits.length} zorgvuldig samengestelde outfits die perfect bij jouw stijl passen
                </p>
              </div>
            </AnimatedSection>

            {outfitsLoading ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-[var(--ff-color-primary-600)] border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 text-lg">Jouw perfecte outfits worden geladen...</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {displayOutfits.map((outfit, idx) => {
                  const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                  const isFav = favs.includes(String(id));

                  return (
                    <AnimatedSection key={id} delay={idx * 0.05}>
                      <motion.div
                        whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                        className="group relative bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg transition-all"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                          {outfit && 'image' in outfit && outfit.image ? (
                            <img
                              src={outfit.image}
                              alt={'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                              <div className="text-center p-8">
                                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--ff-color-primary-600)]" />
                                <p className="text-sm text-gray-600 font-medium">Outfit {idx + 1}</p>
                              </div>
                            </div>
                          )}

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleFav(String(id))}
                                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                                  isFav
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 text-gray-700 hover:bg-white'
                                }`}
                              >
                                {isFav ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                              </motion.button>

                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="#"
                                className="px-6 py-3 bg-white text-[var(--ff-color-primary-700)] rounded-full font-semibold text-sm hover:bg-[var(--ff-color-primary-600)] hover:text-white transition-all"
                              >
                                Bekijk details
                              </motion.a>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold mb-2 text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-600)] transition-colors">
                            {'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            Perfect voor {archetypeName.toLowerCase()} stijl
                          </p>
                        </div>
                      </motion.div>
                    </AnimatedSection>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            <AnimatedSection delay={0.6}>
              <div className="mt-20 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NavLink
                    to="/dashboard"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    Bekijk meer outfits
                    <ArrowRight className="w-6 h-6" />
                  </NavLink>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">Deel je Style Report</h3>
              <p className="text-gray-600 mb-6">Link gekopieerd naar klembord!</p>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
              >
                Sluiten
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
