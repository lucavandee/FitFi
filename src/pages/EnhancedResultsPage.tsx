import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Share2, Sparkles, RefreshCw, ArrowRight, ShoppingBag, Heart, Zap, Check, Grid3x3, Layers, Palette } from "lucide-react";
import toast from 'react-hot-toast';
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { getSeedOutfits, OutfitSeed } from "@/lib/quiz/seeds";
import { useOutfits } from "@/hooks/useOutfits";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useUser } from "@/context/UserContext";
import { SaveOutfitsModal } from "@/components/results/SaveOutfitsModal";
import { StyleProfileConfidenceBadge } from "@/components/results/StyleProfileConfidenceBadge";
import { ShoppingGuidance } from "@/components/results/ShoppingGuidance";
import { ColorPaletteSection } from "@/components/results/ColorPaletteSection";
import { StyleIdentityHero } from "@/components/results/StyleIdentityHero";
import { StyleDNAMixIndicator } from "@/components/results/StyleDNAMixIndicator";
import { ArchetypeBreakdown } from "@/components/results/ArchetypeBreakdown";
import { ArchetypeDetector } from "@/services/styleProfile/archetypeDetector";
import { ColorProfileExplainer } from "@/components/results/ColorProfileExplainer";
import { getMockSwipeInsights } from "@/services/visualPreferences/swipeInsightExtractor";
import type { ArchetypeKey } from "@/config/archetypes";
import type { Outfit } from "@/services/data/types";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import {
  formatStyleDNAValue,
  getSeasonDescription
} from "@/config/terminologyMapping";
import { StyleProfileGenerator } from "@/services/styleProfile/styleProfileGenerator";
import { SwipeableOutfitGallery } from "@/components/outfits/SwipeableOutfitGallery";
import { useMonthlyUpgrades } from "@/hooks/useMonthlyUpgrades";
import { getBenefitsForArchetype } from "@/config/premiumBenefitsMapping";
import { ExitIntentModal } from "@/components/results/ExitIntentModal";
import { analyzeProfileConsistency, type ConsistencyAnalysis } from "@/engine/profileConsistency";
import { ProfileConsistencyBanner } from "@/components/results/ProfileConsistencyBanner";
import { generateOutfitDescription } from "@/engine/outfitContext";
import TrendInsights from "@/components/premium/TrendInsights";
import { TrustSignals } from "@/components/results/TrustSignals";
import { PersonalizedAdviceSection } from "@/components/results/PersonalizedAdviceSection";
import { QuizInputSummary } from "@/components/results/QuizInputSummary";
import { OutfitDetailModal } from "@/components/results/OutfitDetailModal";
import { ShareModal } from "@/components/results/ShareModal";
import { canonicalUrl } from "@/utils/urls";
import track from "@/utils/telemetry";

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
      const existing = localStorage.getItem(LS_KEYS.RESULTS_TS);
      if (!existing) {
        localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      }
    } catch {}
    track("results_page_viewed", { authenticated: !!user });
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

  const archetypeKey = React.useMemo((): ArchetypeKey => {
    const nameToKey: Record<string, ArchetypeKey> = {
      'minimalist': 'MINIMALIST',
      'clean minimal': 'MINIMALIST',
      'classic': 'CLASSIC',
      'classic soft': 'CLASSIC',
      'smart casual': 'SMART_CASUAL',
      'smart_casual': 'SMART_CASUAL',
      'streetwear': 'STREETWEAR',
      'athletic': 'ATHLETIC',
      'sporty sharp': 'ATHLETIC',
      'avant-garde': 'AVANT_GARDE',
      'avant garde': 'AVANT_GARDE',
      'avant_garde': 'AVANT_GARDE',
    };

    const raw = archetypeName.toLowerCase().trim();

    if (raw === raw.toUpperCase().toLowerCase() && Object.values(nameToKey).includes(raw.toUpperCase() as ArchetypeKey)) {
      return raw.toUpperCase() as ArchetypeKey;
    }

    return nameToKey[raw] || 'SMART_CASUAL';
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

  const parsedBudget = React.useMemo(() => {
    const b = answers?.budget;
    if (b && typeof b === 'object' && typeof b.min === 'number' && typeof b.max === 'number' && b.max > 0) {
      return b as { min: number; max: number };
    }
    const slider = answers?.budgetRange;
    if (typeof slider === 'number' && slider > 0) {
      return { min: 0, max: slider };
    }
    return undefined;
  }, [answers?.budget, answers?.budgetRange]);

  const outfitLimit = React.useMemo(() => {
    if (!user) return 6;
    const tier = (user as any).tier || ((user as any).isPremium ? 'premium' : 'member');
    if (tier === 'founder') return 20;
    if (tier === 'premium' || tier === 'plus') return 12;
    if (tier === 'member') return 9;
    return 6;
  }, [user]);

  const { data: realOutfits, loading: outfitsLoading } = useOutfits({
    archetype: archetypeKey,
    secondaryArchetype: archetypeDetectionResult?.secondary || undefined,
    mixFactor: archetypeDetectionResult?.secondary ? 0.3 : 0,
    limit: outfitLimit,
    enabled: hasCompletedQuiz,
    gender: answers?.gender as any,
    fit: answers?.fit,
    prints: answers?.prints,
    goals: answers?.goals,
    materials: answers?.materials,
    colorProfile: activeColorProfile,
    occasions: answers?.occasions,
    budget: parsedBudget,
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
  const hintTimerRef = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => () => clearTimeout(hintTimerRef.current), []);

  // Gallery mode: swipe (mobile-friendly) or grid (desktop-friendly)
  const [galleryMode, setGalleryMode] = React.useState<'swipe' | 'grid'>('grid');

  // Tab navigation
  type ResultTab = 'overzicht' | 'stijl-dna' | 'outfits';
  const [activeTab, setActiveTab] = React.useState<ResultTab>('outfits');

  // Auto-detect mobile and keep in sync with window resize / orientation change
  React.useEffect(() => {
    function checkWidth() {
      setGalleryMode(window.innerWidth < 768 ? 'swipe' : 'grid');
    }
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
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

  const tabs: { id: ResultTab; label: string; sub?: string }[] = [
    { id: 'overzicht', label: 'Overzicht' },
    { id: 'stijl-dna', label: 'Stijl DNA' },
    { id: 'outfits', label: 'Outfits', sub: displayOutfits.length > 0 ? `${displayOutfits.length}` : undefined },
  ];

  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)] relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Helmet>
        <title>Jouw Style Report – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel met outfit-aanbevelingen en kleuradvies." />
        <link rel="canonical" href={canonicalUrl('/results')} />
        <meta property="og:title" content={`${archetypeName} Style Report – FitFi`} />
        <meta property="og:description" content="Ontdek jouw persoonlijke stijlprofiel met outfit-aanbevelingen en kleuradvies op FitFi." />
        <meta property="og:url" content={canonicalUrl('/results')} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${archetypeName} Style Report – FitFi`} />
        <meta name="twitter:description" content="Ontdek jouw persoonlijke stijlprofiel met outfit-aanbevelingen en kleuradvies op FitFi." />
      </Helmet>

      <SaveOutfitsModal
        isOpen={showExitIntent}
        onClose={dismissExitIntent}
        outfitCount={displayOutfits?.length || 0}
      />

      <Breadcrumbs />

      {/* ── HERO ── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-10 bg-gradient-to-b from-[var(--ff-color-primary-50)] to-[var(--color-bg)]"
      >
        <div className="ff-container relative z-10">
          <div className="max-w-3xl mx-auto">
            {hasCompletedQuiz ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)] mb-2">
                      Persoonlijk Style Report
                    </p>
                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-none tracking-tight text-[var(--color-text)] mb-2">
                      {archetypeName}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      {archetypeDetectionResult && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--ff-color-success-50)] border border-[var(--ff-color-success-200)] text-[var(--ff-color-success-700)] rounded-full text-xs font-semibold">
                          <Check className="w-3 h-3" />
                          {Math.round(archetypeDetectionResult.confidence * 100)}% match
                        </span>
                      )}
                      <span className="text-sm text-[var(--color-muted)]">
                        {displayOutfits.length} outfits{favs.length > 0 ? ` · ${favs.length} bewaard` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={sharePage}
                      className="inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-all"
                      aria-label="Delen"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <NavLink
                      to="/onboarding?step=redo"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-medium text-sm hover:bg-[var(--ff-color-primary-50)] hover:border-[var(--ff-color-primary-300)] transition-all text-[var(--color-text)]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Opnieuw</span>
                    </NavLink>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('outfits')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold text-sm hover:bg-[var(--ff-color-primary-600)] transition-all"
                      style={{ boxShadow: '0 2px 8px rgba(122,97,74,0.25)' }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Outfits
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-[var(--color-text)] tracking-tight">Jouw stijl</h1>
                <p className="text-[var(--color-muted)] mb-6 leading-relaxed">Voltooi de stijlquiz om je persoonlijke outfit-aanbevelingen te ontvangen</p>
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-7 py-3.5 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-all"
                  style={{ boxShadow: '0 2px 10px rgba(122,97,74,0.25)' }}
                >
                  Start Style Quiz
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── STICKY TAB BAR ── */}
      {hasCompletedQuiz && (
        <div className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md" style={{ boxShadow: '0 1px 0 rgba(30,35,51,0.06), 0 4px 16px rgba(30,35,51,0.04)' }}>
          <div className="ff-container">
            <div className="max-w-3xl mx-auto flex items-center justify-center py-3">
              <div
                role="tablist"
                className="relative flex items-center bg-[var(--color-bg)] rounded-full p-1 gap-0"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.07)' }}
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] ${
                        isActive
                          ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                      style={isActive ? { boxShadow: '0 1px 4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)' } : undefined}
                    >
                      {tab.label}
                      {tab.sub && (
                        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold transition-colors duration-300 ${
                          isActive
                            ? 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]'
                            : 'bg-[var(--color-border)] text-[var(--color-muted)]'
                        }`}>
                          {tab.sub}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">

      {/* TAB 1: OVERZICHT */}
      {(!hasCompletedQuiz || activeTab === 'overzicht') && (
        <motion.div
          key="tab-overzicht"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >

      {/* Style Identity Hero - Personal Style Statement */}
      {hasCompletedQuiz && activeColorProfile && (
        <section className="py-8 sm:py-12 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]/30">
          <div className="ff-container">
            <StyleIdentityHero
              primaryArchetype={archetypeKey}
              colorProfile={activeColorProfile}
              quizAnswers={answers ?? {}}
              swipeInsights={swipeInsights}
            />
            {answers && (
              <div className="mt-6">
                <QuizInputSummary
                  answers={answers}
                  archetypeName={archetypeName}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Personalized Advice Section */}
      {hasCompletedQuiz && answers && activeColorProfile && (
        <PersonalizedAdviceSection
          answers={answers}
          archetypeName={archetypeName}
          colorProfile={activeColorProfile}
        />
      )}

      {/* Profile Consistency Banner */}
      {hasCompletedQuiz && consistencyAnalysis && (
        <section className="py-4">
          <div className="ff-container">
            <ProfileConsistencyBanner
              analysis={consistencyAnalysis}
              onRetakeQuiz={() => {
                try {
                  localStorage.removeItem(LS_KEYS.QUIZ_ANSWERS);
                  localStorage.removeItem(LS_KEYS.ARCHETYPE);
                  localStorage.removeItem(LS_KEYS.COLOR_PROFILE);
                } catch {}
                navigate('/onboarding');
              }}
              onDismiss={() => {
                try {
                  sessionStorage.setItem('ff_consistency_banner_dismissed', 'true');
                } catch {}
              }}
            />
          </div>
        </section>
      )}

      {/* Quick preview strip: navigeer naar andere tabs */}
      {hasCompletedQuiz && (
        <section className="py-8 sm:py-10">
          <div className="ff-container">
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab('stijl-dna'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-left hover:border-[var(--ff-color-primary-400)] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                  <Palette className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Jouw Stijl DNA</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">Kleurprofiel, archetype & tips</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-muted)] ml-auto group-hover:text-[var(--ff-color-primary-600)] transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab('outfits'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-4 p-5 bg-[var(--ff-color-primary-700)] text-white rounded-2xl text-left hover:bg-[var(--ff-color-primary-600)] transition-all group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Jouw Outfits</p>
                  <p className="text-xs opacity-80 mt-0.5">{displayOutfits.length} looks voor jou samengesteld</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70 ml-auto group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>
          </div>
        </section>
      )}

        </motion.div>
      )}

      {/* TAB 2: STIJL DNA */}
      {hasCompletedQuiz && activeTab === 'stijl-dna' && (
        <motion.div
          key="tab-stijl-dna"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >

      {/* Style DNA Section */}
      {color && (
        <section className="py-8 sm:py-12 bg-[var(--color-surface)]/30 relative">
          <div className="ff-container">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-bold mb-6">
                  <Zap className="w-4 h-4" />
                  Jouw Style DNA Analyse
                </div>
                <h2 className="font-heading font-bold mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
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
                <div className="relative bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-bg)] backdrop-blur-xl border border-[var(--color-border)] rounded-[32px] p-10 sm:p-12 lg:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-700 overflow-hidden">

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
                      <h2 className="font-heading font-bold text-[var(--ff-color-text)] tracking-tight leading-[1.1]" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                        Je stijlprofiel:{' '}
                        <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                          {archetypeName}
                        </span>
                      </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
                      {/* Ultra-Premium Color Profile with Visual Swatches */}
                      <div className="space-y-6">
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--ff-color-text)] tracking-tight flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full" aria-hidden="true" />
                          Kleurprofiel
                        </h3>

                        <div className="space-y-5">
                          {/* Temperatuur */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Temperatuur</span>
                              <span className="px-3 py-1.5 bg-[var(--ff-color-primary-50)] text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('temperature', activeColorProfile.temperature)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 flex-1 rounded-full shadow-inner" style={{ background: 'linear-gradient(to right, var(--ff-color-accent-200), var(--ff-color-primary-300), var(--ff-color-warning-400))' }} />
                            </div>
                          </div>

                          {/* Contrast */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Contrast</span>
                              <span className="px-3 py-1.5 bg-[var(--color-bg)] text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('contrast', activeColorProfile.contrast)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 w-1/3 rounded-l-full shadow-inner" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-50), var(--ff-color-primary-200))' }} />
                              <div className="h-3 w-1/3 shadow-inner" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-400), var(--ff-color-primary-600))' }} />
                              <div className="h-3 w-1/3 rounded-r-full shadow-inner" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-800), var(--ff-color-primary-900))' }} />
                            </div>
                          </div>

                          {/* Seizoen */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Seizoen</span>
                              <span className="px-3 py-1.5 bg-[var(--ff-color-accent-50)] text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('season', activeColorProfile.season)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div role="img" aria-label={`Zomer${activeColorProfile.season === 'zomer' ? ' (actief)' : ''}`} className={`h-10 w-10 rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'zomer' ? '' : 'opacity-30'}`} style={{ background: 'linear-gradient(135deg, var(--ff-color-accent-100), var(--ff-color-accent-300))' }} />
                              <div role="img" aria-label={`Herfst${activeColorProfile.season === 'herfst' ? ' (actief)' : ''}`} className={`h-10 w-10 rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'herfst' ? '' : 'opacity-30'}`} style={{ background: 'linear-gradient(135deg, var(--ff-color-warning-200), var(--ff-color-warning-400))' }} />
                              <div role="img" aria-label={`Winter${activeColorProfile.season === 'winter' ? ' (actief)' : ''}`} className={`h-10 w-10 rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'winter' ? '' : 'opacity-30'}`} style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-50), var(--ff-color-primary-200))' }} />
                              <div role="img" aria-label={`Lente${activeColorProfile.season === 'lente' ? ' (actief)' : ''}`} className={`h-10 w-10 rounded-xl shadow-md transition-opacity duration-300 ${activeColorProfile.season === 'lente' ? '' : 'opacity-30'}`} style={{ background: 'linear-gradient(135deg, var(--ff-color-accent-200), var(--ff-color-success-300))' }} />
                            </div>
                          </div>

                          {/* Chroma */}
                          <div className="group p-5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-[20px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[var(--color-muted)] tracking-wide">Chroma</span>
                              <span className="px-3 py-1.5 bg-[var(--ff-color-primary-25)] text-[var(--ff-color-text)] text-sm font-bold rounded-full tracking-wide capitalize">
                                {formatStyleDNAValue('chroma', activeColorProfile.chroma)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-3 flex-1 rounded-full shadow-inner" style={{ background: 'linear-gradient(to right, var(--ff-color-neutral-300), var(--ff-color-accent-400), var(--ff-color-primary-600))' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ultra-Premium Key Insights */}
                      <div className="space-y-6">
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--ff-color-text)] tracking-tight flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-gradient-to-b from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full" aria-hidden="true" />
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
                                <span className="text-[var(--color-text)] leading-relaxed tracking-wide flex-1 pt-1">
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
              {(user?.tier === 'premium' || user?.tier === 'founder' || user?.isPremium) && answers?.photoUrl ? (
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
                      className="bg-gradient-to-br from-[var(--ff-color-primary-50)] via-[var(--color-surface)] to-[var(--ff-color-accent-50)] rounded-3xl border-2 border-[var(--ff-color-primary-200)] p-8 shadow-xl text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                        Wil je een persoonlijk kleurenpalet?
                      </h3>
                      <p className="text-[var(--color-muted)] mb-6 max-w-2xl mx-auto">
                        {!answers?.photoUrl
                          ? 'Kleurenanalyse is optioneel. Zonder foto geven we geen ondertoonadvies. Upload een selfie en ga over op Premium voor jouw volledige shopping-overzicht.'
                          : 'Ga over op Premium voor een persoonlijke shopping-gids met kleuradviezen op basis van jouw ondertoon.'}
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
                    <h3 className="font-heading text-3xl font-bold text-[var(--color-text)]">Hoe we jouw stijl hebben bepaald</h3>
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
                            <span className="text-[var(--color-text)] leading-relaxed"><strong>Seizoen:</strong> {getSeasonDescription(activeColorProfile.season, activeColorProfile.contrast, activeColorProfile.temperature)}</span>
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
                          <p className="text-base text-[var(--color-text)] leading-relaxed font-medium">
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

            </div>
          </div>
        </section>
      )}

        </motion.div>
      )}

      {/* TAB 3: OUTFITS */}
      {hasCompletedQuiz && activeTab === 'outfits' && (
        <motion.div
          key="tab-outfits"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
        <section id="outfits-section" className="py-8 sm:py-10 relative">
          <div className="ff-container">
            <AnimatedSection>
              {/* Quiz-anchor context strip */}
              {answers && (
                <div className="mb-5 flex flex-wrap items-center gap-2 p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-muted)] mr-1">Gebaseerd op:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)]">
                    {archetypeName}
                  </span>
                  {answers.fit && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)]">
                      Pasvorm: {answers.fit}
                    </span>
                  )}
                  {Array.isArray(answers.occasions) && answers.occasions.slice(0, 2).map((occ: string) => (
                    <span key={occ} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--ff-color-accent-50)] text-[var(--ff-color-accent-700)]">
                      {occ}
                    </span>
                  ))}
                  {activeColorProfile?.season && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]">
                      Seizoen: {activeColorProfile.season}
                    </span>
                  )}
                  {answers.budgetRange?.max && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]">
                      Tot €{answers.budgetRange.max}
                    </span>
                  )}
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="ml-auto text-[11px] font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors"
                  >
                    Aanpassen →
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                    Handpicked <span className="text-[var(--ff-color-primary-600)]">voor jou</span>
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">
                    {displayOutfits.length} outfits op basis van jouw {archetypeName} stijl
                  </p>
                </div>

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
                    <span className="hidden sm:inline">Swipe</span>
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
                    <span className="hidden sm:inline">Grid</span>
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
                  <p className="text-base font-medium text-[var(--color-text)]">Outfits worden samengesteld…</p>
                  <p className="text-sm text-[var(--color-muted)] mt-1">We selecteren looks die passen bij jouw stijl en kleurprofiel.</p>
                </div>
              </div>
            ) : displayOutfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--color-text)] mb-1">Geen outfits gevonden</p>
                  <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto leading-relaxed">
                    {(() => {
                      const budget = answers?.budget ?? answers?.budgetRange;
                      const gender = answers?.gender;
                      if (budget && budget < 50) return `Je budget (€${budget}) is erg laag — probeer het te verhogen of kies "Geen voorkeur".`;
                      if (gender === 'non-binary' || gender === 'prefer-not-to-say') return 'We hebben nog beperkt aanbod voor jouw gendervoorkeur. Doe de quiz opnieuw en kies een ruimere filteroptie.';
                      return 'We konden geen complete looks samenstellen. Dit kan door een combinatie van strakke filters zijn — doe de quiz opnieuw met ruimere voorkeuren.';
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Stijlquiz opnieuw
                </button>
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
                  const getFirstProductImage = (o: any) => {
                    if (!Array.isArray(o?.products)) return null;
                    for (const p of o.products) {
                      const img = p?.imageUrl || p?.image_url || p?.image || null;
                      if (img) return img;
                    }
                    return null;
                  };
                  const outfitImage = ('image' in outfit && outfit.image)
                    || ('imageUrl' in outfit && outfit.imageUrl)
                    || getFirstProductImage(outfit)
                    || null;

                  return (
                    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg h-full">
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)]">
                        {outfitImage ? (
                          <img
                            src={outfitImage}
                            alt={'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                            <div className="text-center p-8">
                              <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
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
                        <p className="text-sm text-[var(--color-muted)] mb-3">
                          {('explanation' in outfit && outfit.explanation)
                            ? (outfit.explanation as string)
                            : outfitInfo.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const ms = (outfit as any).matchScore ?? (outfit as any).match;
                            return typeof ms === 'number' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--ff-color-success-50)] text-[var(--ff-color-success-700)] border border-[var(--ff-color-success-200)]">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                {Math.round(ms)}% match
                              </span>
                            ) : null;
                          })()}
                          {answers?.fit && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)]">
                              {answers.fit}
                            </span>
                          )}
                        </div>
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
                  const getFirstProductImageGrid = (o: any) => {
                    if (!Array.isArray(o?.products)) return null;
                    for (const p of o.products) {
                      const img = p?.imageUrl || p?.image_url || p?.image || null;
                      if (img) return img;
                    }
                    return null;
                  };
                  const outfitImage = ('image' in outfit && outfit.image)
                    || ('imageUrl' in outfit && outfit.imageUrl)
                    || getFirstProductImageGrid(outfit)
                    || null;

                  return (
                    <AnimatedSection key={id} delay={idx * 0.05}>
                      <motion.div
                        whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                        className="group relative bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-lg transition-all"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ff-color-neutral-100)]">
                          {outfitImage ? (
                            <img
                              src={outfitImage}
                              alt={'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                              <div className="text-center p-8">
                                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--ff-color-primary-600)]" />
                                <p className="text-sm text-[var(--color-muted)] font-medium">Outfit {idx + 1}</p>
                              </div>
                            </div>
                          )}

                          {/* Overlay Actions - Always visible */}
                          <div className="absolute inset-0 opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(20,16,12,0.62) 0%, transparent 55%)' }}>
                            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  toggleFav(String(id));
                                  if (!isFav) {
                                    toast.success('Outfit opgeslagen!', {
                                      duration: 3000,
                                      position: 'top-center',
                                    });
                                    // Show hint on first save
                                    const hasSeenHint = localStorage.getItem('ff_fav_hint_seen');
                                    if (!hasSeenHint) {
                                      localStorage.setItem('ff_fav_hint_seen', 'true');
                                      hintTimerRef.current = setTimeout(() => {
                                        toast('Bewaarde outfits vind je terug in je Dashboard', {
                                          duration: 5000,
                                          position: 'top-center',
                                        });
                                      }, 1000);
                                    }
                                  } else {
                                    toast('Outfit verwijderd uit favorieten', {
                                      duration: 2000,
                                      position: 'top-center',
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
                                <span className="hidden sm:inline">Bekijk details</span>
                                <span className="sm:hidden">Details</span>
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
                          <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-3">
                            {('explanation' in outfit && outfit.explanation)
                              ? (outfit.explanation as string)
                              : outfitInfo.description}
                          </p>
                          {/* Quiz-anchor pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              const ms = (outfit as any).matchScore ?? (outfit as any).match;
                              return typeof ms === 'number' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--ff-color-success-50)] text-[var(--ff-color-success-700)] border border-[var(--ff-color-success-200)]">
                                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                  {Math.round(ms)}% match
                                </span>
                              ) : null;
                            })()}
                            {answers?.fit && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)]">
                                {answers.fit}
                              </span>
                            )}
                          </div>
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
                  className="bg-gradient-to-br from-[var(--color-surface)] via-[var(--ff-color-primary-25)] to-[var(--ff-color-accent-50)] rounded-[40px] p-10 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all duration-500 border-2 border-[var(--ff-color-primary-200)]"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                      Upgrade voor meer gepersonaliseerde outfits
                    </h3>
                    <p className="text-[var(--color-muted)] text-base sm:text-lg">
                      50+ outfits afgestemd op jouw stijl, plus een persoonlijke stylist die vragen beantwoordt
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
                        to={user ? "/dashboard" : "/registreren"}
                        className="flex items-center justify-center gap-4 px-10 py-6 min-h-[72px] bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-600)] text-white rounded-[24px] font-bold text-xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-4 relative overflow-hidden group"
                        aria-label={user ? "Ga naar je dashboard" : "Maak gratis account aan om outfits op te slaan"}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <ShoppingBag className="w-7 h-7 relative z-10" aria-hidden="true" strokeWidth={2.5} />
                        <span className="relative z-10">{user ? "Ga naar mijn dashboard" : "Sla outfits op — gratis account"}</span>
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
        </motion.div>
      )}

      </AnimatePresence>

      {/* Outfit Detail Modal */}
      <OutfitDetailModal
        outfit={selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        onToggleFav={toggleFav}
        favs={favs}
        allOutfits={displayOutfits as any[]}
        archetypeName={archetypeName}
        activeColorProfile={activeColorProfile}
        colorProfile={color}
      />

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Exit Intent Discount Modal */}
      <ExitIntentModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />

      {/* Mobile bottom padding to avoid sticky tab bar overlap */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
