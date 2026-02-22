import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, Share2, Sparkles, RefreshCw, TrendingUp, Award, ArrowRight, ShoppingBag, Heart, Zap, Star, Check, Download, X, Grid3x3, Layers } from "lucide-react";
import toast from 'react-hot-toast';
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { getSeedOutfits, OutfitSeed } from "@/lib/quiz/seeds";
import { useOutfits } from "@/hooks/useOutfits";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useUser } from "@/context/UserContext";
import { SaveOutfitsModal } from "@/components/results/SaveOutfitsModal";
import { StyleProfileConfidenceBadge } from "@/components/results/StyleProfileConfidenceBadge";
import { StyleDNATooltip } from "@/components/results/StyleDNATooltip";
import { ShoppingGuidance } from "@/components/results/ShoppingGuidance";
import { ColorPaletteSection } from "@/components/results/ColorPaletteSection";
import { StyleIdentityHero } from "@/components/results/StyleIdentityHero";
import { StyleDNAMixIndicator } from "@/components/results/StyleDNAMixIndicator";
import { ArchetypeBreakdown } from "@/components/results/ArchetypeBreakdown";
import { ArchetypeDetector } from "@/services/styleProfile/archetypeDetector";
import { ColorProfileExplainer } from "@/components/results/ColorProfileExplainer";
import SmartImage from "@/components/ui/SmartImage";
import { getMockSwipeInsights } from "@/services/visualPreferences/swipeInsightExtractor";
import type { ArchetypeKey } from "@/config/archetypes";
import type { Outfit } from "@/services/data/types";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import {
  getStyleDNALabel,
  formatStyleDNAValue,
  getSeasonDescription
} from "@/config/terminologyMapping";
import { OutfitFilters, type FilterOptions } from "@/components/results/OutfitFilters";
import { OutfitZoomModal } from "@/components/results/OutfitZoomModal";
import { PremiumOutfitCard as PremiumOutfitCardComponent } from "../components/outfits/PremiumOutfitCard";
import { StyleProfileGenerator } from "@/services/styleProfile/styleProfileGenerator";
import { canonicalUrl } from "@/utils/urls";
import { SwipeableOutfitGallery } from "@/components/outfits/SwipeableOutfitGallery";
import { useMonthlyUpgrades } from "@/hooks/useMonthlyUpgrades";
import { getBenefitsForArchetype } from "@/config/premiumBenefitsMapping";
import { ExitIntentModal } from "@/components/results/ExitIntentModal";
import { analyzeProfileConsistency, type ConsistencyAnalysis } from "@/engine/profileConsistency";
import { ProfileConsistencyBanner } from "@/components/results/ProfileConsistencyBanner";
import { useNavigate } from "react-router-dom";
import { generateOutfitDescription } from "@/engine/outfitContext";
import TrendInsights from "@/components/premium/TrendInsights";
import { TrustSignals } from "@/components/results/TrustSignals";
import { PersonalizedAdviceSection } from "@/components/results/PersonalizedAdviceSection";
import { QuizInputSummary } from "@/components/results/QuizInputSummary";

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
  const navigate = useNavigate();
  const { shouldShow: showExitIntent, dismiss: dismissExitIntent } = useExitIntent({
    enabled: !user,
    maxDisplays: 1,
    threshold: 50,
  });

  const [showExitModal, setShowExitModal] = React.useState(false);
  const { data: monthlyUpgradeCount, isLoading: upgradesLoading } = useMonthlyUpgrades();

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

  // ✅ NEW: Analyze profile consistency for mixed/eclectic profiles
  const [consistencyAnalysis, setConsistencyAnalysis] = React.useState<ConsistencyAnalysis | null>(null);

  React.useEffect(() => {
    if (answers) {
      const analysis = analyzeProfileConsistency(answers);
      setConsistencyAnalysis(analysis);
    }
  }, [answers]);

  // Exit intent modal trigger
  React.useEffect(() => {
    if (showExitIntent && !user) {
      setShowExitModal(true);
      dismissExitIntent();
    }
  }, [showExitIntent, user, dismissExitIntent]);

  // Parse archetype safely - can be string or object
  const archetypeName = React.useMemo(() => {
    if (!archetypeRaw) return "Smart Casual";
    if (typeof archetypeRaw === 'string') return archetypeRaw;
    if (archetypeRaw && typeof archetypeRaw === 'object' && 'name' in archetypeRaw) {
      return archetypeRaw.name;
    }
    return "Smart Casual";
  }, [archetypeRaw]);

  // Convert archetype name to ArchetypeKey
  const archetypeKey = React.useMemo((): ArchetypeKey => {
    const nameToKey: Record<string, ArchetypeKey> = {
      'minimalist': 'MINIMALIST',
      'classic': 'CLASSIC',
      'smart casual': 'SMART_CASUAL',
      'streetwear': 'STREETWEAR',
      'athletic': 'ATHLETIC',
      'avant-garde': 'AVANT_GARDE',
      'avant garde': 'AVANT_GARDE'
    };

    const normalized = archetypeName.toLowerCase();
    return nameToKey[normalized] || 'SMART_CASUAL';
  }, [archetypeName]);

  // Get swipe insights (mock for now, later from DB)
  const swipeInsights = React.useMemo(() => {
    return getMockSwipeInsights();
  }, []);

  // ✅ GENERATE STYLE PROFILE FROM QUIZ + SWIPES + PHOTO
  const [generatedProfile, setGeneratedProfile] = React.useState<ColorProfile | null>(null);
  const [profileDataSource, setProfileDataSource] = React.useState<'photo_analysis' | 'quiz+swipes' | 'quiz_only' | 'swipes_only' | 'fallback'>('fallback');
  const [profileConfidence, setProfileConfidence] = React.useState<number>(0.5);
  const [profileLoading, setProfileLoading] = React.useState(false);

  // ✅ NEW: Calculate archetype detection result with confidence
  const [archetypeDetectionResult, setArchetypeDetectionResult] = React.useState<{
    primary: string;
    secondary: string | null;
    scores: Array<{ archetype: string; score: number }>;
    confidence: number;
  } | null>(null);

  React.useEffect(() => {
    if (!answers) return;

    async function generateProfile() {
      setProfileLoading(true);
      try {
        // Get session ID from localStorage for anonymous users
        const sessionId = user?.id || localStorage.getItem('ff_session_id') || crypto.randomUUID();
        if (!user?.id) {
          localStorage.setItem('ff_session_id', sessionId);
        }

        const result = await StyleProfileGenerator.generateStyleProfile(
          answers,
          user?.id,
          !user?.id ? sessionId : undefined
        );

        setGeneratedProfile(result.colorProfile);
        setProfileDataSource(result.dataSource);
        setProfileConfidence(result.confidence);

        try {
          const detectionResult = ArchetypeDetector.detect(answers);
          setArchetypeDetectionResult(detectionResult as any);
        } catch {
        }

        try {
          localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(result.colorProfile));
          localStorage.setItem('ff_profile_data_source', result.dataSource);
          localStorage.setItem('ff_profile_confidence', result.confidence.toString());
        } catch {
        }
      } catch {
        setGeneratedProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }

    // Only generate if we don't have a saved color profile
    if (!color) {
      generateProfile();
    }
  }, [answers, user?.id, color]);

  // Use generated profile if available, otherwise fallback to saved or default
  const activeColorProfile = generatedProfile || color || {
    temperature: "neutraal",
    value: "medium",
    contrast: "laag",
    chroma: "zacht",
    season: "zomer",
    paletteName: "Soft Cool Tonals (neutraal)",
    notes: ["Tonal outfits met zachte texturen.", "Vermijd harde contrasten."],
  };

  const { data: realOutfits, loading: outfitsLoading } = useOutfits({
    archetype: archetypeName,
    limit: 9,
    enabled: hasCompletedQuiz
  });

  const seeds: OutfitSeed[] = React.useMemo(() => {
    try {
      return getSeedOutfits(activeColorProfile, archetypeName) || [];
    } catch {
      return [];
    }
  }, [activeColorProfile, archetypeName]);

  const displayOutfits: (Outfit | OutfitSeed)[] = React.useMemo(() => {
    try {
      if (realOutfits && Array.isArray(realOutfits) && realOutfits.length > 0) {
        return realOutfits;
      }
      if (seeds && Array.isArray(seeds) && seeds.length > 0) {
        return seeds;
      }
      return [];
    } catch {
      return [];
    }
  }, [realOutfits, seeds]);

  const [favs, setFavs] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]");
    } catch {
      return [];
    }
  });

  const [showShareModal, setShowShareModal] = React.useState(false);
  const [selectedOutfit, setSelectedOutfit] = React.useState<(Outfit | OutfitSeed) | null>(null);
  const [showZoomModal, setShowZoomModal] = React.useState(false);
  const [zoomedOutfit, setZoomedOutfit] = React.useState<any | null>(null);

  const [filters, setFilters] = React.useState<FilterOptions>({
    categories: [],
    seasons: [],
    colors: [],
    sortBy: "match",
    viewMode: "grid-2",
  });

  // Gallery mode: swipe (mobile-friendly) or grid (desktop-friendly)
  const [galleryMode, setGalleryMode] = React.useState<'swipe' | 'grid'>('grid');

  // Auto-detect mobile and default to swipe on small screens
  React.useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setGalleryMode('swipe');
    }
  }, []);

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
    const url = typeof window !== "undefined" ? window.location.href : canonicalUrl('/results');
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
        outfitCount={displayOutfits?.length || 0}
      />

      <Breadcrumbs />

      {/* Premium Hero Section - Responsive padding */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden py-16 sm:py-24 md:py-32 lg:py-40"
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
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-lg"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Jouw Persoonlijke Style Report
            </motion.div>

            {hasCompletedQuiz ? (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-[1.1] tracking-tight px-4"
                >
                  Jouw rapport,
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-primary-600)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                  >
                    op basis van jouw keuzes
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[var(--color-muted)] mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-4"
                >
                  {archetypeDetectionResult && archetypeDetectionResult.confidence >= 0.7 ? (
                    <>
                      We hebben <strong className="font-semibold text-[var(--ff-color-primary-700)]">{displayOutfits?.length || 0} unieke outfits</strong> samengesteld die perfect
                      <br className="hidden md:block" /> bij jouw duidelijke {archetypeName} stijl passen
                    </>
                  ) : archetypeDetectionResult && archetypeDetectionResult.confidence >= 0.5 ? (
                    <>
                      We hebben <strong className="font-semibold text-[var(--ff-color-primary-700)]">{displayOutfits?.length || 0} veelzijdige outfits</strong> samengesteld die verschillende
                      <br className="hidden md:block" /> aspecten van jouw {archetypeName} stijl reflecteren
                    </>
                  ) : (
                    <>
                      We hebben <strong className="font-semibold text-[var(--ff-color-primary-700)]">{displayOutfits?.length || 0} diverse outfits</strong> samengesteld die jouw
                      <br className="hidden md:block" /> eclectische stijlmix met {archetypeName} elementen weerspiegelen
                    </>
                  )}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.getElementById('outfits-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-4 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-base hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all shadow-xl"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Bekijk outfits</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <NavLink
                      to="/onboarding"
                      title="Pas je antwoorden aan om een nieuw rapport te genereren"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl sm:rounded-2xl font-semibold text-base sm:text-base hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all shadow-lg w-full sm:w-auto text-[var(--color-text)]"
                    >
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Vernieuw mijn rapport</span>
                    </NavLink>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sharePage}
                    className="inline-flex items-center justify-center gap-2 px-5 py-4 min-h-[52px] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors text-sm font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Deel</span>
                  </motion.button>
                </motion.div>

                {/* Stats Bar - Responsive */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-4"
                >
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-1 sm:mb-2">{displayOutfits.length}</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">Outfits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-1 sm:mb-2">100%</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">Op maat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-1 sm:mb-2">{favs.length}</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">Favorieten</div>
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
                  Jouw
                  <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                    stijl
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed"
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

      {/* Style Identity Hero - Personal Style Statement */}
      {hasCompletedQuiz && activeColorProfile && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]/30">
          <div className="ff-container">
            <StyleIdentityHero
              primaryArchetype={archetypeKey}
              colorProfile={activeColorProfile}
              quizAnswers={answers ?? {}}
              swipeInsights={swipeInsights}
            />
            {answers && (
              <div className="mt-8">
                <QuizInputSummary
                  answers={answers}
                  archetypeName={archetypeName}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ✅ NEW: Personalized Advice Section - Testcase specific */}
      {hasCompletedQuiz && answers && activeColorProfile && (
        <PersonalizedAdviceSection
          answers={answers}
          archetypeName={archetypeName}
          colorProfile={activeColorProfile}
        />
      )}

      {/* Style DNA Section - Responsive padding with wider desktop layout */}
      {hasCompletedQuiz && color && (
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-[var(--color-surface)]/30 relative">
          <div className="ff-container">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-bold mb-6">
                  <Zap className="w-4 h-4" />
                  Jouw Style DNA Analyse
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Kleuranalyse & Stijlprofiel
                  <span className="block text-[var(--ff-color-primary-600)] mt-2">{activeColorProfile.paletteName}</span>
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] max-w-3xl mx-auto mb-4 leading-relaxed">
                  {answers?.photoUrl
                    ? 'Op basis van jouw kleurvoorkeur én huidondertoon uit je foto'
                    : 'Op basis van jouw kleurvoorkeur uit de quiz — zonder foto geven we geen ondertoonadvies'}
                </p>

                {/* Confidence Badge - Show data source transparency */}
                <div className="max-w-3xl mx-auto">
                  <StyleProfileConfidenceBadge
                    dataSource={profileDataSource}
                    confidence={profileConfidence}
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Ultra-Premium Style Profile Card */}
            <div className="max-w-5xl mx-auto mb-12">
              <AnimatedSection delay={0.1}>
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
                        Je stijlprofiel:{' '}
                        <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                          {archetypeName}
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
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Temperatuur</span>
                              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-orange-50 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('temperature', activeColorProfile.temperature)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 flex-1 bg-gradient-to-r from-blue-400 via-slate-300 to-orange-400 rounded-full shadow-inner" />
                            </div>
                          </div>

                          {/* Contrast */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Contrast</span>
                              <span className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('contrast', color.contrast)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 w-1/3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-l-full shadow-inner" />
                              <div className="h-3 w-1/3 bg-gradient-to-r from-slate-400 to-slate-500 shadow-inner" />
                              <div className="h-3 w-1/3 bg-gradient-to-r from-slate-700 to-slate-900 rounded-r-full shadow-inner" />
                            </div>
                          </div>

                          {/* Seizoen */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Seizoen</span>
                              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('season', activeColorProfile.season)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className={`h-10 w-10 bg-gradient-to-br rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'zomer' ? 'from-sky-200 to-blue-300' : 'from-sky-200 to-blue-300 opacity-30'}`} title="Zomer" />
                              <div className={`h-10 w-10 bg-gradient-to-br rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'herfst' ? 'from-amber-200 to-orange-300' : 'from-amber-200 to-orange-300 opacity-30'}`} title="Herfst" />
                              <div className={`h-10 w-10 bg-gradient-to-br rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'winter' ? 'from-slate-200 to-blue-200' : 'from-slate-200 to-blue-200 opacity-30'}`} title="Winter" />
                              <div className={`h-10 w-10 bg-gradient-to-br rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'lente' ? 'from-pink-200 to-green-200' : 'from-pink-200 to-green-200 opacity-30'}`} title="Lente" />
                            </div>
                          </div>

                          {/* Chroma */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Chroma</span>
                              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('chroma', activeColorProfile.chroma)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 flex-1 bg-gradient-to-r from-gray-300 via-pink-300 to-purple-500 rounded-full shadow-inner" />
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
                          {activeColorProfile.notes && activeColorProfile.notes.map((note, i) => (
                            <li
                              key={i}
                              className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:bg-[var(--color-surface)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[var(--ff-color-primary-300)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ff-color-success-500)] to-[var(--ff-color-success-600)] flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
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
              </AnimatedSection>
            </div>

            <div className="max-w-7xl mx-auto">
              {/* Shopping Guidance - PREMIUM ONLY with Photo Required */}
              {(user?.tier === 'premium' || user?.tier === 'founder' || user?.isPremium) && profileData?.photo_url ? (
                <AnimatedSection delay={0.5}>
                  <div className="mb-12">
                    <ShoppingGuidance
                      season={activeColorProfile.season}
                      contrast={activeColorProfile.contrast}
                      chroma={activeColorProfile.chroma}
                    />
                  </div>
                </AnimatedSection>
              ) : (
                <AnimatedSection delay={0.5}>
                  <div className="mb-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] rounded-3xl border-2 border-[var(--ff-color-primary-200)] p-8 shadow-xl text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                        Wil je een persoonlijk kleurenpalet?
                      </h3>
                      <p className="text-[var(--color-muted)] mb-6 max-w-2xl mx-auto">
                        {!answers?.photoUrl
                          ? 'Kleurenanalyse is optioneel. Zonder foto geven we geen ondertoonadvies. Upload een selfie en ontgrendel Premium voor jouw volledige shopping-cheatsheet.'
                          : 'Ontgrendel Premium voor een persoonlijke shopping-gids met kleuradviezen op basis van jouw ondertoon.'}
                      </p>
                      <NavLink
                        to="/prijzen#premium"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] hover:shadow-lg transition-all"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Upgrade voor kleuranalyse</span>
                      </NavLink>
                    </motion.div>
                  </div>
                </AnimatedSection>
              )}

              {/* ✅ NEW: Color Profile Explainer - Neutral Undertone Context */}
              <AnimatedSection delay={0.58}>
                <div className="mb-12">
                  <ColorProfileExplainer
                    colorProfile={activeColorProfile}
                    confidence={profileConfidence}
                  />
                </div>
              </AnimatedSection>

              {/* Complete Color Palette - Named Swatches */}
              <AnimatedSection delay={0.6}>
                <div className="mb-12">
                  <ColorPaletteSection
                    season={activeColorProfile.season}
                    hasPhoto={!!answers?.photoUrl}
                  />
                </div>
              </AnimatedSection>

              {/* 2025 Trend Insights - Premium Only */}
              {user?.isPremium && (
                <AnimatedSection delay={0.62}>
                  <div className="mb-12">
                    <TrendInsights
                      userSeason={activeColorProfile.season as 'winter' | 'zomer' | 'herfst' | 'lente'}
                      compact={false}
                    />
                  </div>
                </AnimatedSection>
              )}

              {/* ✅ NEW: Style DNA Mix Indicator - Visual Breakdown */}
              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.65}>
                  <div className="mb-12">
                    <StyleDNAMixIndicator
                      mixItems={archetypeDetectionResult.scores.map(s => ({
                        archetype: s.archetype as ArchetypeKey,
                        percentage: s.score
                      }))}
                      confidence={archetypeDetectionResult.confidence}
                    />
                  </div>
                </AnimatedSection>
              )}

              {/* ✅ NEW: Archetype Breakdown with Confidence */}
              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.67}>
                  <div className="mb-12">
                    <ArchetypeBreakdown
                      archetypeScores={archetypeDetectionResult.scores.map(s => ({
                        archetype: s.archetype as ArchetypeKey,
                        percentage: s.score
                      }))}
                      confidence={archetypeDetectionResult.confidence}
                    />
                  </div>
                </AnimatedSection>
              )}

              {/* How We Determined Your Style - IMPROVED with bullets */}
              <AnimatedSection delay={0.7}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-[var(--color-surface)] rounded-[32px] border-2 border-[var(--ff-color-primary-200)] p-10 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-all duration-500 mb-12"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-accent-700)] flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-bold text-[var(--color-text)]">Hoe we jouw stijl hebben bepaald</h3>
                  </div>

                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--ff-color-primary-600)] flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[var(--color-text)] mb-4">Je stijltype: {archetypeName}</h4>
                        <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                          Dit advies komt uit jouw keuzes:
                        </p>
                        <ul className="space-y-3">
                          {answers?.fit && (
                            <li className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-[var(--color-text)] leading-relaxed"><strong>Pasvorm:</strong> {answers.fit}</span>
                            </li>
                          )}
                          {answers?.occasions && Array.isArray(answers.occasions) && answers.occasions.length > 0 && (
                            <li className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-[var(--color-text)] leading-relaxed"><strong>Gelegenheden:</strong> {answers.occasions.join(', ')}</span>
                            </li>
                          )}
                          {answers?.goals && Array.isArray(answers.goals) && answers.goals.length > 0 && (
                            <li className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-[var(--color-text)] leading-relaxed"><strong>Stijldoelen:</strong> {answers.goals.join(', ')}</span>
                            </li>
                          )}
                          {!(answers?.fit || answers?.occasions || answers?.goals) && (
                            <li className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-[var(--color-text)] leading-relaxed">Jouw antwoorden zijn verwerkt in dit profiel.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

                    {/* Step 2 */}
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[var(--color-text)] mb-4">Kleuranalyse: {activeColorProfile.paletteName}</h4>
                        <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                          Dit advies komt uit jouw keuzes:
                        </p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Temperatuur:</strong> {formatStyleDNAValue('temperature', activeColorProfile.temperature)}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Contrast:</strong> {formatStyleDNAValue('contrast', activeColorProfile.contrast)}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Seizoen:</strong> {getSeasonDescription(activeColorProfile.season, color.contrast, activeColorProfile.temperature)}</span>
                          </li>
                          {!answers?.photoUrl && (
                            <li className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--ff-color-warning-500)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-[var(--color-text)] leading-relaxed">Kleurenanalyse is gebaseerd op voorkeur. Zonder foto geven we geen ondertoonadvies.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

                    {/* Step 3 */}
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--ff-color-primary-600)] flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-[var(--color-text)] mb-4">Intelligente matching</h4>
                        <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                          We combineren alles voor de perfecte match:
                        </p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Kleurharmonie:</strong> Seizoensgebonden palet per outfit</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Stijlcompatibiliteit:</strong> Past bij jouw {archetypeName.toLowerCase()} DNA</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Gelegenheidscontext:</strong> Geschikt voor jouw dagelijkse situaties</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Result Banner */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border-2 border-[var(--ff-color-primary-200)] shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center shadow-sm">
                          <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-base text-text leading-relaxed font-medium">
                            <strong className="font-bold">Resultaat:</strong> Door quiz-data, visuele voorkeuren en kleuranalyse
                            te combineren, krijg je aanbevelingen die verder gaan dan een simpel stijltype. Elke outfit is afgestemd op jouw
                            unieke stijl én seizoensgebonden kleurpalet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>

              {/* Style Tips */}
              <AnimatedSection delay={0.6}>
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
                        <p className="text-[var(--color-text)] leading-relaxed text-lg">{note}</p>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* Profile Consistency Banner - Only show if needed */}
      {hasCompletedQuiz && consistencyAnalysis && (
        <section className="py-6">
          <div className="ff-container">
            <ProfileConsistencyBanner
              analysis={consistencyAnalysis}
              onRetakeQuiz={() => {
                // Clear quiz answers and navigate to quiz
                try {
                  localStorage.removeItem(LS_KEYS.QUIZ_ANSWERS);
                  localStorage.removeItem(LS_KEYS.ARCHETYPE);
                  localStorage.removeItem(LS_KEYS.COLOR_PROFILE);
                } catch {}
                navigate('/onboarding');
              }}
              onDismiss={() => {
                // User can dismiss the banner
                try {
                  sessionStorage.setItem('ff_consistency_banner_dismissed', 'true');
                } catch {}
              }}
            />
          </div>
        </section>
      )}

      {/* Outfit Gallery - Premium - Responsive padding with wider desktop layout */}
      {hasCompletedQuiz && (
        <section id="outfits-section" className="py-12 sm:py-16 md:py-20 lg:py-32 relative">
          <div className="ff-container">
            <AnimatedSection>
              <div className="text-center mb-8 sm:mb-12 lg:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-accent-100)] text-[var(--ff-color-accent-700)] rounded-full text-sm font-bold mb-6">
                  <ShoppingBag className="w-4 h-4" />
                  Jouw Outfits
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Handpicked <span className="text-[var(--ff-color-primary-600)]">voor jou</span>
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] max-w-3xl mx-auto mb-8 leading-relaxed">
                  {displayOutfits.length} zorgvuldig samengestelde outfits die perfect bij jouw stijl passen
                </p>

                {/* View Mode Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 p-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-sm"
                >
                  <button
                    onClick={() => setGalleryMode('swipe')}
                    aria-pressed={galleryMode === 'swipe'}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] rounded-lg font-semibold text-sm sm:text-base transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 ${
                      galleryMode === 'swipe'
                        ? 'bg-[var(--ff-color-primary-700)] text-white shadow-md'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                    aria-label="Swipe weergave"
                  >
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    <span className="hidden xs:inline">Swipe</span>
                  </button>
                  <button
                    onClick={() => setGalleryMode('grid')}
                    aria-pressed={galleryMode === 'grid'}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 min-h-[48px] rounded-lg font-semibold text-sm sm:text-base transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 ${
                      galleryMode === 'grid'
                        ? 'bg-[var(--ff-color-primary-700)] text-white shadow-md'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                    aria-label="Grid weergave"
                  >
                    <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    <span className="hidden xs:inline">Grid</span>
                  </button>
                </motion.div>
              </div>
            </AnimatedSection>

            {outfitsLoading ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="w-12 h-12 border-[3px] border-[var(--color-border)] border-t-[var(--ff-color-primary-600)] rounded-full animate-spin" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-base font-medium text-[var(--color-text)]">We maken je stijlrapport…</p>
                  <p className="text-sm text-[var(--color-muted)] mt-1">Bijna klaar — dit duurt meestal minder dan een minuut.</p>
                </div>
              </div>
            ) : galleryMode === 'swipe' ? (
              <SwipeableOutfitGallery
                outfits={displayOutfits as any[]}
                onLike={(outfit) => {
                  const id = 'id' in outfit ? outfit.id : outfit.toString();
                  toggleFav(String(id));
                }}
                onDislike={() => {
                  // Optional: track dislikes
                }}
                renderCard={(outfit) => {
                  const idx = displayOutfits.findIndex(o => o === outfit);
                  const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                  const isFav = favs.includes(String(id));
                  const outfitInfo = generateOutfitDescription(archetypeName, idx, displayOutfits.length);

                  return (
                    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg h-full">
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)]">
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
                              <p className="text-sm text-[var(--color-muted)] font-medium">Outfit {idx + 1}</p>
                            </div>
                          </div>
                        )}

                        {/* Details Button Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOutfit(outfit);
                            }}
                            className="w-full px-6 py-3 min-h-[52px] bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-600)] hover:text-white active:scale-[0.98] transition-all shadow-lg"
                          >
                            Bekijk details
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6">
                        {/* Occasion Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ff-color-accent-100)] rounded-full mb-3">
                          <span className="text-base">{outfitInfo.context.emoji}</span>
                          <span className="text-xs font-bold text-[var(--ff-color-accent-700)] uppercase tracking-wide">
                            {outfitInfo.context.label}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">
                          {'name' in outfit ? outfit.name : outfitInfo.title}
                        </h3>
                        <p className="text-base text-[var(--color-muted)]">
                          {outfitInfo.description}
                        </p>
                      </div>
                    </div>
                  );
                }}
                className="max-w-7xl mx-auto"
              />
            ) : (
              <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1600px] mx-auto">
                {displayOutfits.map((outfit, idx) => {
                  const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                  const isFav = favs.includes(String(id));
                  const outfitInfo = generateOutfitDescription(archetypeName, idx, displayOutfits.length);

                  return (
                    <AnimatedSection key={id} delay={idx * 0.05}>
                      <motion.div
                        whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                        className="group relative bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg transition-all"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)]">
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
                                <p className="text-sm text-[var(--color-muted)] font-medium">Outfit {idx + 1}</p>
                              </div>
                            </div>
                          )}

                          {/* Overlay Actions - Always visible on mobile, hover on desktop */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  toggleFav(String(id));
                                  if (!isFav) {
                                    toast.success('Outfit opgeslagen!', {
                                      duration: 3000,
                                      position: 'bottom-center',
                                      icon: '💚',
                                    });
                                    // Show hint on first save
                                    const hasSeenHint = localStorage.getItem('ff_fav_hint_seen');
                                    if (!hasSeenHint) {
                                      localStorage.setItem('ff_fav_hint_seen', 'true');
                                      setTimeout(() => {
                                        toast('Bewaarde outfits vind je terug in je Dashboard', {
                                          duration: 5000,
                                          position: 'bottom-center',
                                          icon: '💡',
                                        });
                                      }, 1000);
                                    }
                                  } else {
                                    toast('Outfit verwijderd uit favorieten', {
                                      duration: 2000,
                                      position: 'bottom-center',
                                      icon: '🗑️',
                                    });
                                  }
                                }}
                                className={`w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                                  isFav
                                    ? 'bg-[var(--ff-color-danger-500)] text-white'
                                    : 'bg-[var(--color-surface)]/90 text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                                }`}
                                aria-label={isFav ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                              >
                                {isFav ? <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOutfit(outfit);
                                }}
                                className="px-4 sm:px-6 py-3 min-h-[44px] bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] rounded-full font-semibold text-sm sm:text-sm hover:bg-[var(--ff-color-primary-600)] hover:text-white active:scale-[0.95] transition-all flex-1 sm:flex-none"
                              >
                                <span className="hidden xs:inline">Bekijk details</span>
                                <span className="xs:hidden">Details</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-6">
                          {/* Occasion Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ff-color-accent-100)] rounded-full mb-2">
                            <span className="text-sm">{outfitInfo.context.emoji}</span>
                            <span className="text-[10px] font-bold text-[var(--ff-color-accent-700)] uppercase tracking-wider">
                              {outfitInfo.context.label}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold mb-1 text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-600)] transition-colors">
                            {'name' in outfit ? outfit.name : outfitInfo.title}
                          </h3>
                          {answers && (
                            <p className="text-xs text-[var(--color-muted)] mb-1.5">
                              Op basis van jouw keuzes: {[answers.fit, answers.occasions?.[0]].filter(Boolean).join(', ') || archetypeName}
                            </p>
                          )}
                          <p className="text-sm text-[var(--color-muted)] line-clamp-2">
                            {outfitInfo.description}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatedSection>
                  );
                })}
              </div>
            )}

            {/* Premium Preview Card - SUPER PROMINENT with whitespace */}
            <AnimatedSection delay={0.6}>
              <div className="mt-24 md:mt-32 mb-20 max-w-4xl mx-auto">
                {/* Free Preview Badge */}
                <div className="text-center mb-10">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-success-50)] text-[var(--ff-color-success-700)] rounded-full text-base font-bold shadow-sm border-2 border-[var(--ff-color-success-200)]">
                    <Sparkles className="w-5 h-5" />
                    Gratis preview: 9 van 50+ gepersonaliseerde outfits
                  </span>
                </div>

                {/* Premium Preview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-white via-[var(--ff-color-primary-25)] to-[var(--ff-color-accent-50)] rounded-[40px] p-10 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all duration-500 border-2 border-[var(--ff-color-primary-200)]"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                      Upgrade voor meer gepersonaliseerde outfits
                    </h3>
                    <p className="text-[var(--color-muted)] text-base sm:text-lg">
                      Ontgrendel 50+ outfits afgestemd op jouw stijl + AI styling assistent
                    </p>
                  </div>

                  {/* Benefits Grid - Personalized */}
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {getBenefitsForArchetype(archetypeName).map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-[var(--color-surface)]/80 backdrop-blur-sm rounded-xl p-4 text-center"
                      >
                        <div className="text-3xl font-bold text-[var(--ff-color-primary-700)] mb-1">
                          {benefit.value}
                        </div>
                        <div className="text-sm text-[var(--color-muted)]">
                          {benefit.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[var(--color-text)]">€9,99</span>
                      <span className="text-[var(--color-muted)]">/maand</span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] mt-2">
                      Eerste maand gratis · Stop wanneer je wilt
                    </p>
                  </div>

                  {/* Social Proof - Dynamic */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-[var(--color-muted)]">
                      ⭐ <span className="font-semibold text-[var(--color-text)]">
                        {upgradesLoading ? "2.847+" : `${monthlyUpgradeCount?.toLocaleString("nl-NL") || "2.847"}+`} gebruikers
                      </span> geüpgraded deze maand
                    </p>
                  </div>

                  {/* Trust Signals */}
                  <div className="mb-8">
                    <TrustSignals />
                  </div>

                  {/* CTA Buttons - SUPER PROMINENT with extra whitespace */}
                  <div className="space-y-5 pt-4">
                    {/* PRIMARY CTA - HUGE & eye-catching */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full"
                    >
                      <NavLink
                        to="/dashboard"
                        className="flex items-center justify-center gap-4 px-10 py-6 min-h-[72px] bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-600)] text-white rounded-[24px] font-bold text-xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-4 relative overflow-hidden group"
                        aria-label="Bekijk je gepersonaliseerde outfits"
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <ShoppingBag className="w-7 h-7 relative z-10" aria-hidden="true" strokeWidth={2.5} />
                        <span className="relative z-10">Bekijk jouw outfits</span>
                        <ArrowRight className="w-7 h-7 relative z-10 group-hover:translate-x-1 transition-transform" aria-hidden="true" strokeWidth={2.5} />
                      </NavLink>
                    </motion.div>

                    {/* SECONDARY CTA - Still prominent but clearly secondary */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <NavLink
                        to="/prijzen#premium"
                        className="flex items-center justify-center gap-3 px-8 py-5 min-h-[64px] bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] rounded-[20px] font-semibold text-lg hover:bg-[var(--ff-color-primary-50)] transition-all border-2 border-[var(--ff-color-primary-300)] hover:border-[var(--ff-color-primary-500)] w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 shadow-sm hover:shadow-md"
                        aria-label="Upgrade naar Premium voor meer functies"
                      >
                        <Sparkles className="w-6 h-6" aria-hidden="true" strokeWidth={2.5} />
                        <span>Upgrade naar Premium</span>
                      </NavLink>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Outfit Detail Modal */}
      <AnimatePresence>
        {selectedOutfit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOutfit(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    {'name' in selectedOutfit ? selectedOutfit.name : `Outfit Details`}
                  </h3>
                  <p className="text-[var(--color-muted)]">
                    Perfect voor {archetypeName.toLowerCase()} stijl
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="p-2 rounded-full hover:bg-[var(--ff-color-neutral-100)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image */}
              {selectedOutfit && 'image' in selectedOutfit && selectedOutfit.image && (
                <div className="mb-6 rounded-2xl overflow-hidden">
                  <img
                    src={selectedOutfit.image}
                    alt={'name' in selectedOutfit ? selectedOutfit.name : 'Outfit'}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Waarom dit outfit?</h4>
                  <p className="text-[var(--color-text)]">
                    Dit outfit is speciaal voor jou samengesteld op basis van je stijlvoorkeuren en kleurprofiel.
                    De combinatie past perfect bij {archetypeName.toLowerCase()} en benadrukt jouw unieke style DNA.
                  </p>
                </div>

                {color && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Kleuradvies</h4>
                    <p className="text-[var(--color-text)]">
                      Gebaseerd op jouw kleurprofiel "{activeColorProfile.paletteName}" hebben we kleuren gekozen die jouw
                      natuurlijke uitstraling versterken.
                    </p>
                  </div>
                )}

                {'products' in selectedOutfit && selectedOutfit.products && selectedOutfit.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Producten in dit outfit</h4>
                    <div className="space-y-2">
                      {selectedOutfit.products.map((product: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
                          <div className="w-16 h-16 bg-[var(--ff-color-neutral-200)] rounded-lg overflow-hidden flex-shrink-0">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {product.name || `Product ${idx + 1}`}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-[var(--color-muted)]">{product.brand}</p>
                            )}
                          </div>
                          {product.price && (
                            <div className="text-right">
                              <p className="font-semibold">€{product.price}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    const id = 'id' in selectedOutfit ? String(selectedOutfit.id) : `seed-${displayOutfits.indexOf(selectedOutfit)}`;
                    toggleFav(id);
                  }}
                  className="flex-1 px-6 py-3 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-200)] transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Bewaar outfit
                </button>
                <button
                  onClick={() => setSelectedOutfit(null)}
                  className="px-6 py-3 bg-[var(--ff-color-neutral-100)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--ff-color-neutral-200)] transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Share Modal - Apple-inspired */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="relative p-8 pb-6 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)]">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface)]/50 transition-colors"
                  aria-label="Sluit modal"
                >
                  <X className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center mb-4 shadow-lg">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">Deel je Style Report</h3>
                <p className="text-base text-[var(--color-muted)]">Laat anderen zien wat jouw unieke stijl is</p>
              </div>

              {/* Share options */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : canonicalUrl('/results');
                    navigator.clipboard.writeText(url);
                    toast.success('Link gekopieerd!', {
                      icon: '📋',
                      duration: 2000,
                    });
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--color-surface)] transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                    <Download className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text)]">Kopieer link</p>
                    <p className="text-sm text-[var(--color-muted)]">Deel via WhatsApp, email of social media</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : canonicalUrl('/results');
                    const text = `Bekijk mijn persoonlijke Style Report van FitFi! 👗✨`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--color-surface)] transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                    <Share2 className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text)]">Deel op Twitter</p>
                    <p className="text-sm text-[var(--color-muted)]">Tweet je stijlrapport</p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-6 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-2xl font-bold text-base hover:bg-[var(--ff-color-primary-700)] transition-all shadow-lg active:scale-[0.98]"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Intent Discount Modal */}
      <ExitIntentModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />

      {/* Mobile Sticky CTA - Only show on scroll & mobile */}
      {hasCompletedQuiz && !user && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: scrollY.get() > 400 ? 0 : 100,
            opacity: scrollY.get() > 400 ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white shadow-2xl border-t-2 border-[var(--ff-color-primary-700)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold opacity-90 mb-0.5">
                  Ontgrendel 50+ outfits
                </p>
                <p className="text-lg font-bold leading-tight">
                  €9,99<span className="text-xs font-normal opacity-80">/maand</span>
                </p>
              </div>
              <NavLink
                to="/prijzen#premium"
                className="flex-shrink-0 px-5 py-3 bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] rounded-xl font-bold text-sm hover:bg-[var(--ff-color-primary-50)] transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Upgrade nu
              </NavLink>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
