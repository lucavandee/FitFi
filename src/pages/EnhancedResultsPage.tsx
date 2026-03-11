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
import { ResultsOutfitCard } from "@/components/results/ResultsOutfitCard";
import { canonicalUrl } from "@/utils/urls";
import track from "@/utils/telemetry";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
  ProductSectionHeader,
  MetaInlineRow,
  BadgePill,
} from "@/components/ui/primitives";

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
    track("results_view", {
      authenticated: !!user,
      archetype: archetypeName,
    });
  }, []);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetypeRaw = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);

  const hasCompletedQuiz = !!answers;

  const [consistencyAnalysis, setConsistencyAnalysis] = React.useState<ConsistencyAnalysis | null>(null);

  React.useEffect(() => {
    if (answers) {
      const analysis = analyzeProfileConsistency(answers);
      setConsistencyAnalysis(analysis);
    }
  }, [answers]);

  React.useEffect(() => {
    if (showExitIntent && !user) {
      setShowExitModal(true);
      dismissExitIntent();
    }
  }, [showExitIntent, user, dismissExitIntent]);

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

  const swipeInsights = React.useMemo(() => {
    return getMockSwipeInsights();
  }, []);

  const [generatedProfile, setGeneratedProfile] = React.useState<ColorProfile | null>(null);
  const [profileDataSource, setProfileDataSource] = React.useState<'photo_analysis' | 'quiz+swipes' | 'quiz_only' | 'swipes_only' | 'fallback'>('fallback');
  const [profileConfidence, setProfileConfidence] = React.useState<number>(0.5);
  const [profileLoading, setProfileLoading] = React.useState(false);

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

    if (!color) {
      generateProfile();
    }
  }, [answers, user?.id, color]);

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

  const outfitsLoadedTrackedRef = React.useRef(false);
  React.useEffect(() => {
    if (outfitsLoadedTrackedRef.current) return;
    if (!outfitsLoading && displayOutfits.length > 0) {
      outfitsLoadedTrackedRef.current = true;
      track("results_outfits_loaded", {
        archetype: archetypeName,
        outfit_count: displayOutfits.length,
        source: realOutfits && realOutfits.length > 0 ? "realtime" : "seed",
        gallery_mode: galleryMode,
      });
    }
  }, [outfitsLoading, displayOutfits.length]);

  const [galleryMode, setGalleryMode] = React.useState<'swipe' | 'grid'>('grid');

  type ResultTab = 'overzicht' | 'stijl-dna' | 'outfits';
  const [activeTab, setActiveTab] = React.useState<ResultTab>('outfits');

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

      {/* ── HERO ── compact product-page hero, not a marketing banner */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-6 pb-5 sm:pt-8 sm:pb-6 bg-gradient-to-b from-[var(--ff-color-primary-50)] to-[var(--color-bg)]"
      >
        <div className="ff-container">
          <div className="max-w-3xl mx-auto">
            {hasCompletedQuiz ? (
              <div className="flex flex-col gap-3">
                {/* Kicker */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)]">
                  Persoonlijk Style Report
                </p>

                {/* H1 — product scale */}
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-[var(--color-text)]">
                  {archetypeName}
                </h1>

                {/* Stats row — compact inline meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  {archetypeDetectionResult && (
                    <BadgePill variant="success" icon={<Check className="w-2.5 h-2.5" strokeWidth={3} />}>
                      {Math.round(archetypeDetectionResult.confidence * 100)}% match
                    </BadgePill>
                  )}
                  <span className="text-xs text-[var(--color-muted)]">
                    {displayOutfits.length} outfits{favs.length > 0 ? ` · ${favs.length} bewaard` : ''}
                  </span>
                </div>

                {/* CTA row */}
                <div className="flex items-center gap-2 pt-1">
                  <PrimaryButton
                    size="sm"
                    icon={<ShoppingBag className="w-3.5 h-3.5" />}
                    onClick={() => setActiveTab('outfits')}
                  >
                    Bekijk outfits
                  </PrimaryButton>

                  <SecondaryButton
                    size="sm"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/onboarding?step=redo')}
                  >
                    Quiz opnieuw
                  </SecondaryButton>

                  <IconButton label="Delen" onClick={sharePage}>
                    <Share2 className="w-4 h-4 shrink-0" />
                  </IconButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-3 text-[var(--color-text)] tracking-tight">Jouw stijl</h1>
                <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed max-w-sm mx-auto">Voltooi de stijlquiz om je persoonlijke outfit-aanbevelingen te ontvangen</p>
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold text-sm hover:bg-[var(--ff-color-primary-600)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
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
            <div className="max-w-3xl mx-auto flex items-center justify-center py-2">
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

      {hasCompletedQuiz && answers && activeColorProfile && (
        <PersonalizedAdviceSection
          answers={answers}
          archetypeName={archetypeName}
          colorProfile={activeColorProfile}
        />
      )}

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

      {hasCompletedQuiz && (
        <section className="py-6 sm:py-8">
          <div className="ff-container">
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab('stijl-dna'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-left hover:border-[var(--ff-color-primary-300)] transition-all group"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                  <Palette className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text)]">Jouw Stijl DNA</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">Kleurprofiel, archetype &amp; tips</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-muted)] ml-auto flex-shrink-0 group-hover:text-[var(--ff-color-primary-600)] transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab('outfits'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 p-4 bg-[var(--ff-color-primary-700)] text-white rounded-2xl text-left hover:bg-[var(--ff-color-primary-600)] transition-all group"
                style={{ boxShadow: '0 2px 10px rgba(122,97,74,0.20)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Jouw Outfits</p>
                  <p className="text-xs opacity-75 mt-0.5">{displayOutfits.length} outfits voor jou samengesteld</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60 ml-auto flex-shrink-0 group-hover:opacity-100 transition-opacity" />
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

      {color && (
        <section className="py-8 sm:py-10">
          <div className="ff-container">
            <AnimatedSection>
              {/* Section header — compact product discipline */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)]">
                    Stijl DNA Analyse
                  </span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-1">
                  Kleuranalyse &amp; Stijlprofiel
                </h2>
                <p className="text-sm text-[var(--color-muted)]">
                  {activeColorProfile.paletteName}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">
                  {answers?.photoUrl
                    ? 'Op basis van jouw kleurvoorkeur én huidondertoon uit je foto'
                    : 'Op basis van jouw kleurvoorkeur uit de quiz'}
                </p>
                <div className="mt-3">
                  <StyleProfileConfidenceBadge
                    dataSource={profileDataSource}
                    confidence={profileConfidence}
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Style Profile Card — product-page scale, no oversized radius */}
            <div className="max-w-5xl mx-auto mb-8">
              <AnimatedSection delay={0.1}>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8" style={{ boxShadow: 'var(--shadow-soft)' }}>

                  {/* Card header */}
                  <div className="flex items-center gap-2.5 mb-6">
                    <BadgePill variant="soft" icon={<Sparkles className="w-3 h-3" />}>
                      Jouw Stijl
                    </BadgePill>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text)] tracking-tight">
                      {archetypeName}
                    </h2>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Color profile column */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                        <div className="w-1 h-5 bg-[var(--ff-color-primary-600)] rounded-full" aria-hidden="true" />
                        Kleurprofiel
                      </h3>

                      <div className="space-y-2">
                        {/* Temperatuur */}
                        <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--color-muted)]">Temperatuur</span>
                            <BadgePill variant="neutral">
                              {formatStyleDNAValue('temperature', activeColorProfile.temperature)}
                            </BadgePill>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, var(--ff-color-accent-200), var(--ff-color-primary-300), var(--ff-color-warning-400))' }} />
                        </div>

                        {/* Contrast */}
                        <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--color-muted)]">Contrast</span>
                            <BadgePill variant="neutral">
                              {formatStyleDNAValue('contrast', activeColorProfile.contrast)}
                            </BadgePill>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-2 w-1/3 rounded-l-full" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-50), var(--ff-color-primary-200))' }} />
                            <div className="h-2 w-1/3" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-400), var(--ff-color-primary-600))' }} />
                            <div className="h-2 w-1/3 rounded-r-full" style={{ background: 'linear-gradient(to right, var(--ff-color-primary-800), var(--ff-color-primary-900))' }} />
                          </div>
                        </div>

                        {/* Seizoen */}
                        <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--color-muted)]">Seizoen</span>
                            <BadgePill variant="season">
                              {formatStyleDNAValue('season', activeColorProfile.season)}
                            </BadgePill>
                          </div>
                          <div className="flex gap-1.5">
                            {(['zomer', 'herfst', 'winter', 'lente'] as const).map((s) => (
                              <div
                                key={s}
                                role="img"
                                aria-label={`${s}${activeColorProfile.season === s ? ' (actief)' : ''}`}
                                className={`h-7 w-7 rounded-lg transition-opacity duration-300 ${activeColorProfile.season === s ? 'opacity-100 ring-2 ring-[var(--ff-color-primary-400)] ring-offset-1' : 'opacity-30'}`}
                                style={{ background: s === 'zomer' ? 'linear-gradient(135deg, var(--ff-color-accent-100), var(--ff-color-accent-300))' : s === 'herfst' ? 'linear-gradient(135deg, var(--ff-color-warning-200), var(--ff-color-warning-400))' : s === 'winter' ? 'linear-gradient(135deg, var(--ff-color-primary-50), var(--ff-color-primary-200))' : 'linear-gradient(135deg, var(--ff-color-accent-200), var(--ff-color-success-300))' }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Chroma */}
                        <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--color-muted)]">Chroma</span>
                            <BadgePill variant="neutral">
                              {formatStyleDNAValue('chroma', activeColorProfile.chroma)}
                            </BadgePill>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, var(--ff-color-neutral-300), var(--ff-color-accent-400), var(--ff-color-primary-600))' }} />
                        </div>
                      </div>
                    </div>

                    {/* Key insights column */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                        <div className="w-1 h-5 bg-[var(--ff-color-primary-600)] rounded-full" aria-hidden="true" />
                        Belangrijkste inzichten
                      </h3>

                      <ul className="space-y-2">
                        {activeColorProfile.notes && activeColorProfile.notes.map((note, i) => (
                          <li
                            key={i}
                            className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--ff-color-success-100)] flex items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[var(--ff-color-success-600)]" strokeWidth={2.5} />
                              </div>
                              <span className="text-sm text-[var(--color-text)] leading-relaxed">
                                {note}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Shopping Guidance */}
              {(user?.tier === 'premium' || user?.tier === 'founder' || user?.isPremium) && answers?.photoUrl ? (
                <AnimatedSection delay={0.5}>
                  <div className="mb-6">
                    <ShoppingGuidance
                      season={activeColorProfile.season}
                      contrast={activeColorProfile.contrast}
                      chroma={activeColorProfile.chroma}
                    />
                  </div>
                </AnimatedSection>
              ) : (
                <AnimatedSection delay={0.5}>
                  <div className="mb-6">
                    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--ff-color-primary-200)] p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)] mb-0.5">
                            Premium kleuranalyse
                          </p>
                          <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug mb-1">
                            Persoonlijk kleurenpalet op basis van jouw ondertoon
                          </h3>
                          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                            {!answers?.photoUrl
                              ? 'Upload een selfie en activeer Premium voor kleuradvies afgestemd op jouw huidtint.'
                              : 'Activeer Premium voor jouw persoonlijke shopping-gids met seizoensgebonden kleuradviezen.'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <NavLink
                            to="/prijzen#premium"
                            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-xs hover:bg-[var(--ff-color-primary-600)] transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Bekijk Premium
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )}

              <AnimatedSection delay={0.58}>
                <div className="mb-6">
                  <ColorProfileExplainer
                    colorProfile={activeColorProfile}
                    confidence={profileConfidence}
                  />
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.6}>
                <div className="mb-6">
                  <ColorPaletteSection
                    season={activeColorProfile.season}
                    hasPhoto={!!answers?.photoUrl}
                  />
                </div>
              </AnimatedSection>

              {user?.isPremium && (
                <AnimatedSection delay={0.62}>
                  <div className="mb-6">
                    <TrendInsights
                      userSeason={activeColorProfile.season as 'winter' | 'zomer' | 'herfst' | 'lente'}
                      compact={false}
                    />
                  </div>
                </AnimatedSection>
              )}

              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.65}>
                  <div className="mb-6">
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

              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.67}>
                  <div className="mb-6">
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

              {/* How We Determined Your Style — normalized to product-page card discipline */}
              <AnimatedSection delay={0.7}>
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 mb-8" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-accent-50)] flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-[var(--ff-color-accent-600)]" />
                    </div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--color-text)]">Hoe we jouw stijl hebben bepaald</h3>
                  </div>

                  <div className="space-y-5">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--ff-color-primary-600)] flex items-center justify-center">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[var(--color-text)] mb-2">Je stijltype: {archetypeName}</h4>
                        <ul className="space-y-1.5">
                          {answers?.fit && (
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Pasvorm:</strong> {answers.fit}</span>
                            </li>
                          )}
                          {answers?.occasions && Array.isArray(answers.occasions) && answers.occasions.length > 0 && (
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Gelegenheden:</strong> {answers.occasions.join(', ')}</span>
                            </li>
                          )}
                          {answers?.goals && Array.isArray(answers.goals) && answers.goals.length > 0 && (
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Stijldoelen:</strong> {answers.goals.join(', ')}</span>
                            </li>
                          )}
                          {!(answers?.fit || answers?.occasions || answers?.goals) && (
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-xs text-[var(--color-text)] leading-relaxed">Jouw antwoorden zijn verwerkt in dit profiel.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="h-px bg-[var(--color-border)]" />

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--ff-color-accent-600)] flex items-center justify-center">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[var(--color-text)] mb-2">Kleuranalyse: {activeColorProfile.paletteName}</h4>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Temperatuur:</strong> {formatStyleDNAValue('temperature', activeColorProfile.temperature)}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Contrast:</strong> {formatStyleDNAValue('contrast', activeColorProfile.contrast)}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Seizoen:</strong> {getSeasonDescription(activeColorProfile.season, activeColorProfile.contrast, activeColorProfile.temperature)}</span>
                          </li>
                          {!answers?.photoUrl && (
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[var(--ff-color-warning-500)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="text-xs text-[var(--color-text)] leading-relaxed">Kleurenanalyse is gebaseerd op voorkeur. Zonder foto geven we geen ondertoonadvies.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="h-px bg-[var(--color-border)]" />

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--ff-color-primary-600)] flex items-center justify-center">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[var(--color-text)] mb-2">Intelligente matching</h4>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Kleurharmonie:</strong> Seizoensgebonden palet per outfit</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Stijlcompatibiliteit:</strong> Past bij jouw {archetypeName.toLowerCase()} DNA</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-xs text-[var(--color-text)] leading-relaxed"><strong>Gelegenheidscontext:</strong> Geschikt voor jouw dagelijkse situaties</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Result note */}
                    <div className="p-4 bg-[var(--ff-color-primary-25,var(--ff-color-primary-50))] rounded-xl border border-[var(--ff-color-primary-100)]">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-xs text-[var(--color-text)] leading-relaxed">
                          <strong>Resultaat:</strong> Door quiz-data, visuele voorkeuren en kleuranalyse te combineren, krijg je aanbevelingen afgestemd op jouw unieke stijl én seizoensgebonden kleurpalet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
        <section id="outfits-section" className="py-6 sm:py-8">
          <div className="ff-container">
            <AnimatedSection>
              <div className="max-w-5xl mx-auto">
              {/* Quiz-anchor context strip */}
              {answers && (
                <div className="mb-2 flex items-center gap-2 overflow-hidden">
                  <MetaInlineRow
                    className="min-w-0 flex-1 overflow-hidden"
                    items={[
                      { label: archetypeName, pill: true },
                      ...[
                        answers.fit,
                        ...(Array.isArray(answers.occasions) ? answers.occasions.slice(0, 1) : []),
                      ].filter(Boolean).map((v) => ({ label: v as string })),
                      ...(activeColorProfile?.season ? [{ label: activeColorProfile.season, pill: true }] : []),
                      ...(answers.budgetRange?.max ? [{ label: `€${answers.budgetRange.max}` }] : []),
                    ]}
                  />
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="ml-auto shrink-0 text-[10px] font-medium text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors underline-offset-2 hover:underline"
                  >
                    Aanpassen
                  </button>
                </div>
              )}

              <ProductSectionHeader
                title="Handpicked voor jou"
                subtitle={`${displayOutfits.length} outfits · ${archetypeName}`}
                className="mb-4"
                actions={
                  <div className="inline-flex items-center p-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
                    <button
                      onClick={() => setGalleryMode('swipe')}
                      aria-pressed={galleryMode === 'swipe'}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-1 ${
                        galleryMode === 'swipe'
                          ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                      aria-label="Swipe weergave"
                    >
                      <Layers className="w-3 h-3" aria-hidden="true" />
                      <span>Swipe</span>
                    </button>
                    <button
                      onClick={() => setGalleryMode('grid')}
                      aria-pressed={galleryMode === 'grid'}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-1 ${
                        galleryMode === 'grid'
                          ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                      aria-label="Grid weergave"
                    >
                      <Grid3x3 className="w-3 h-3" aria-hidden="true" />
                      <span>Grid</span>
                    </button>
                  </div>
                }
              />
              </div>
            </AnimatedSection>

            {outfitsLoading ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--ff-color-primary-600)] rounded-full animate-spin" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--color-text)]">Outfits worden samengesteld…</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">We selecteren outfits die passen bij jouw stijl en kleurprofiel.</p>
                </div>
              </div>
            ) : displayOutfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--color-text)] mb-1">Geen outfits gevonden</p>
                  <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto leading-relaxed">
                    {(() => {
                      const budget = answers?.budget ?? answers?.budgetRange;
                      const gender = answers?.gender;
                      if (budget && budget < 50) return `Je budget (€${budget}) is erg laag — probeer het te verhogen of kies "Geen voorkeur".`;
                      if (gender === 'non-binary' || gender === 'prefer-not-to-say') return 'We hebben nog beperkt aanbod voor jouw gendervoorkeur. Doe de quiz opnieuw en kies een ruimere filteroptie.';
                      return 'We konden geen complete outfits samenstellen. Dit kan door een combinatie van strakke filters zijn — doe de quiz opnieuw met ruimere voorkeuren.';
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
                onDislike={() => {}}
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
                    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] overflow-hidden h-full" style={{ boxShadow: 'var(--shadow-soft)' }}>
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ff-color-neutral-100)]">
                        {outfitImage ? (
                          <img
                            src={outfitImage}
                            alt={'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              track("product_image_fallback_shown", {
                                outfit_id: String('id' in outfit ? outfit.id : `seed-${idx}`),
                                outfit_index: idx,
                                archetype: archetypeName,
                                source: "swipe",
                              });
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                            <div className="text-center p-6">
                              <Sparkles className="w-12 h-12 mx-auto mb-3 text-[var(--ff-color-primary-400)]" aria-hidden="true" />
                              <p className="text-xs text-[var(--color-muted)] font-medium">Outfit {idx + 1}</p>
                            </div>
                          </div>
                        )}

                        {/* Favorite */}
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const outfitId = 'id' in outfit ? outfit.id : `seed-${idx}`;
                              const isCurrentlyFav = favs.includes(String(outfitId));
                              track("save_outfit_click", {
                                outfit_id: String(outfitId),
                                outfit_title: 'name' in outfit ? (outfit as any).name : outfitInfo.title,
                                outfit_index: idx,
                                occasion: outfitInfo.context.label,
                                archetype: archetypeName,
                                action: isCurrentlyFav ? "unsave" : "save",
                                source: "swipe",
                              });
                              toggleFav(String(outfitId));
                            }}
                            className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                              favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`))
                                ? 'bg-[var(--ff-color-danger-500)] text-white'
                                : 'bg-[var(--color-surface)]/90 text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                            }`}
                            aria-label={favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`)) ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                          >
                            <Heart className={`w-3 h-3 ${favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`)) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* CTA */}
                        <div className="absolute inset-x-0 bottom-0 pointer-events-none h-16 bg-gradient-to-t from-[rgba(10,10,10,0.45)] to-transparent" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            track("outfit_card_click", {
                              outfit_id: String('id' in outfit ? outfit.id : `seed-${idx}`),
                              outfit_title: 'name' in outfit ? (outfit as any).name : outfitInfo.title,
                              outfit_index: idx,
                              occasion: outfitInfo.context.label,
                              archetype: archetypeName,
                              match_score: (outfit as any).matchScore ?? (outfit as any).match ?? null,
                              shoppable_product_count: Array.isArray((outfit as any).products) ? (outfit as any).products.length : 0,
                              source: "swipe",
                            });
                            setSelectedOutfit(outfit);
                          }}
                          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] bg-[var(--ff-color-primary-700)]/95 text-white text-[11px] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Bekijk &amp; shop
                        </button>
                      </div>

                      {/* Info */}
                      <div className="px-3 pt-2.5 pb-3">
                        {/* Occasion */}
                        <div className="flex items-center gap-1 mb-1.5">
                          <span className="text-[11px]">{outfitInfo.context.emoji}</span>
                          <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                            {outfitInfo.context.label}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2 mb-1">
                          {'name' in outfit ? outfit.name : outfitInfo.title}
                        </h3>
                        <p className="text-[11px] text-[var(--color-muted)] line-clamp-2 leading-normal mb-2">
                          {('explanation' in outfit && outfit.explanation)
                            ? (outfit.explanation as string)
                            : outfitInfo.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const ms = (outfit as any).matchScore ?? (outfit as any).match;
                            return typeof ms === 'number' ? (
                              <BadgePill variant="success" icon={<Check className="w-2.5 h-2.5" strokeWidth={3} />}>
                                {Math.round(ms)}% match
                              </BadgePill>
                            ) : null;
                          })()}
                          {answers?.fit && (
                            <BadgePill variant="arch">{answers.fit}</BadgePill>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
                className="max-w-5xl mx-auto"
              />
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {displayOutfits.map((outfit, idx) => {
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
                  const matchScore = (outfit as any).matchScore ?? (outfit as any).match ?? null;

                  return (
                    <AnimatedSection key={String(id)} delay={idx * 0.05}>
                      <ResultsOutfitCard
                        id={String(id)}
                        index={idx}
                        name={'name' in outfit ? (outfit as any).name : outfitInfo.title}
                        description={
                          ('explanation' in outfit && outfit.explanation)
                            ? (outfit.explanation as string)
                            : outfitInfo.description
                        }
                        imageUrl={outfitImage as string | null}
                        imageAlt={'name' in outfit ? (outfit as any).name : `Outfit ${idx + 1}`}
                        occasionContext={outfitInfo.context}
                        matchScore={typeof matchScore === 'number' ? matchScore : null}
                        fitLabel={answers?.fit ?? null}
                        productCount={Array.isArray((outfit as any).products) ? (outfit as any).products.length : 0}
                        isFavorite={isFav}
                        onSelect={(e) => {
                          e.stopPropagation();
                          track("outfit_card_click", {
                            outfit_id: String(id),
                            outfit_title: 'name' in outfit ? (outfit as any).name : outfitInfo.title,
                            outfit_index: idx,
                            occasion: outfitInfo.context.label,
                            archetype: archetypeName,
                            match_score: matchScore,
                            shoppable_product_count: Array.isArray((outfit as any).products) ? (outfit as any).products.length : 0,
                            source: "grid",
                          });
                          setSelectedOutfit(outfit);
                        }}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          toggleFav(String(id));
                          track("save_outfit_click", {
                            outfit_id: String(id),
                            outfit_title: 'name' in outfit ? (outfit as any).name : outfitInfo.title,
                            outfit_index: idx,
                            occasion: outfitInfo.context.label,
                            archetype: archetypeName,
                            action: isFav ? "unsave" : "save",
                            source: "grid",
                          });
                          if (!isFav) {
                            toast.success('Outfit opgeslagen!', { duration: 3000, position: 'top-center' });
                            const hasSeenHint = localStorage.getItem('ff_fav_hint_seen');
                            if (!hasSeenHint) {
                              localStorage.setItem('ff_fav_hint_seen', 'true');
                              hintTimerRef.current = setTimeout(() => {
                                toast('Bewaarde outfits vind je terug in je Dashboard', { duration: 5000, position: 'top-center' });
                              }, 1000);
                            }
                          } else {
                            toast('Outfit verwijderd uit favorieten', { duration: 2000, position: 'top-center' });
                          }
                        }}
                        onImageError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          track("product_image_fallback_shown", {
                            outfit_id: String(id),
                            outfit_index: idx,
                            archetype: archetypeName,
                            source: "grid",
                          });
                        }}
                      />
                    </AnimatedSection>
                  );
                })}
              </div>
            )}

            {/* Upsell Block — product-page card discipline */}
            <AnimatedSection delay={0.6}>
              <div className="mt-10 sm:mt-12 mb-6 max-w-3xl mx-auto">
                {/* Preview label */}
                <div className="text-center mb-4">
                  <BadgePill variant="success" icon={<Sparkles className="w-3 h-3" />}>
                    Gratis preview: 9 van 50+ gepersonaliseerde outfits
                  </BadgePill>
                </div>

                {/* Upsell card */}
                <div
                  className="bg-[var(--color-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--color-border)]"
                  style={{ boxShadow: 'var(--shadow-soft)' }}
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-1">
                      Upgrade voor meer gepersonaliseerde outfits
                    </h3>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                      50+ outfits afgestemd op jouw stijl, plus een persoonlijke stylist die vragen beantwoordt
                    </p>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {getBenefitsForArchetype(archetypeName).map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-[var(--color-bg)] rounded-xl p-3 text-center border border-[var(--color-border)]"
                      >
                        <div className="text-lg font-bold text-[var(--ff-color-primary-700)] mb-0.5">
                          {benefit.value}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] leading-snug">
                          {benefit.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-bold text-[var(--color-text)]">€9,99</span>
                    <span className="text-sm text-[var(--color-muted)]">/maand</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mb-3">
                    Eerste maand gratis · Stop wanneer je wilt
                  </p>

                  {/* Social proof */}
                  <p className="text-xs text-[var(--color-muted)] mb-4">
                    <span className="font-semibold text-[var(--color-text)]">
                      {upgradesLoading ? "2.847+" : `${monthlyUpgradeCount?.toLocaleString("nl-NL") || "2.847"}+`} gebruikers
                    </span>{" "}geüpgraded deze maand
                  </p>

                  {/* Trust Signals */}
                  <div className="mb-4">
                    <TrustSignals />
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <NavLink
                      to={user ? "/dashboard" : "/registreren"}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold text-sm hover:bg-[var(--ff-color-primary-600)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                      aria-label={user ? "Ga naar je dashboard" : "Maak gratis account aan om outfits op te slaan"}
                    >
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>{user ? "Ga naar mijn dashboard" : "Sla outfits op — gratis account"}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </NavLink>

                    <NavLink
                      to="/prijzen#premium"
                      className="sm:flex-none flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] bg-transparent text-[var(--ff-color-primary-700)] rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-50)] transition-all border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                      aria-label="Upgrade naar Premium voor meer functies"
                    >
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      <span>Bekijk Premium</span>
                    </NavLink>
                  </div>
                </div>
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

      {/* Mobile bottom padding */}
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
