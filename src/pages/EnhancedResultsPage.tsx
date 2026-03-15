import React from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Share2, Sparkles, RefreshCw, ArrowRight, Heart, Check, Grid3x3, Layers, Palette, Eye, Shirt, SlidersHorizontal, Briefcase, Coffee, PartyPopper, Dumbbell, Plane, ShoppingBag, ExternalLink } from "lucide-react";
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
import { SUB_SEASON_PALETTES } from "@/data/colorPalettes";
import { StyleProfileGenerator } from "@/services/styleProfile/styleProfileGenerator";
import { SwipeableOutfitGallery } from "@/components/outfits/SwipeableOutfitGallery";
import { useMonthlyUpgrades } from "@/hooks/useMonthlyUpgrades";
import { getBenefitsForArchetype } from "@/config/premiumBenefitsMapping";
import { ExitIntentModal } from "@/components/results/ExitIntentModal";
import { analyzeProfileConsistency, type ConsistencyAnalysis } from "@/engine/profileConsistency";
import { ProfileConsistencyBanner } from "@/components/results/ProfileConsistencyBanner";
import { generateOutfitDescription } from "@/engine/outfitContext";
import TrendInsights from "@/components/premium/TrendInsights";
import { PersonalizedAdviceSection } from "@/components/results/PersonalizedAdviceSection";
import { QuizInputSummary } from "@/components/results/QuizInputSummary";
import { OutfitDetailModal } from "@/components/results/OutfitDetailModal";
import { ShareModal } from "@/components/results/ShareModal";
import { ResultsOutfitCard } from "@/components/results/ResultsOutfitCard";
import { canonicalUrl } from "@/utils/urls";
import track from "@/utils/telemetry";
import OutfitCard from "@/components/outfits/OutfitCard";
import { openProductLink } from "@/utils/affiliate";
import { getColorPalette } from "@/data/colorPalettes";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Get display-friendly sub-season name from SUB_SEASON_PALETTES or fall back to base season.
 */
function getSeasonDisplayName(colorProfile: ColorProfile): string {
  if (colorProfile.subSeason) {
    const palette = SUB_SEASON_PALETTES[colorProfile.subSeason];
    if (palette) return palette.season;
  }
  // Fallback: capitalize base season
  const s = colorProfile.season;
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

const OCCASION_LABELS: Record<string, string> = {
  work: 'Kantoor',
  casual: 'Casual',
  date: 'Avondje uit',
  party: 'Feest',
  formal: 'Formeel',
  sports: 'Sport',
  travel: 'Op reis',
};

/** Dutch display names for archetype keys/labels */
const ARCHETYPE_DISPLAY_NL: Record<string, string> = {
  minimalist: 'Minimalistisch',
  'clean minimal': 'Minimalistisch',
  classic: 'Klassiek',
  'classic soft': 'Klassiek',
  'smart casual': 'Smart Casual',
  smart_casual: 'Smart Casual',
  streetwear: 'Streetwear',
  athletic: 'Sportief',
  'sporty sharp': 'Sportief',
  'avant-garde': 'Avant-Garde',
  'avant garde': 'Avant-Garde',
  avant_garde: 'Avant-Garde',
};

/** Dutch display names for fit values */
const FIT_DISPLAY_NL: Record<string, string> = {
  slim: 'Slim fit',
  relaxed: 'Relaxed fit',
  regular: 'Regular fit',
  oversized: 'Oversized',
  tailored: 'Tailored fit',
};

function getArchetypeDisplayNL(name: string): string {
  return ARCHETYPE_DISPLAY_NL[name.toLowerCase().trim()] || name;
}

function getOccasionLabel(occasion: string): string {
  return OCCASION_LABELS[occasion.toLowerCase()] || occasion.charAt(0).toUpperCase() + occasion.slice(1);
}

/**
 * Map Dutch occasion strings (from generated outfits) to English quiz occasion keys.
 * Generated outfits use: "Werk", "Dagelijks", "Date", "Avond uit", "Weekend",
 * "Smart Casual", "Relaxed", "Actief".
 * Quiz answers use: "work", "casual", "formal", "date", "party", "sports", "travel".
 */
const OCCASION_ALIAS_TO_KEY: Record<string, string> = {
  // Direct English matches
  work: 'work',
  casual: 'casual',
  formal: 'formal',
  date: 'date',
  party: 'party',
  sports: 'sports',
  travel: 'travel',
  // Dutch → English mappings (from generated outfits)
  werk: 'work',
  kantoor: 'work',
  office: 'work',
  dagelijks: 'casual',
  weekend: 'casual',
  relaxed: 'casual',
  'smart casual': 'casual',
  'avond uit': 'date',
  'avondje uit': 'date',
  evening: 'date',
  feest: 'party',
  uitgaan: 'party',
  formeel: 'formal',
  'formeel event': 'formal',
  actief: 'sports',
  sport: 'sports',
  gym: 'sports',
  reizen: 'travel',
  'op reis': 'travel',
};

/**
 * Extract the occasion from an outfit (via occasion property or tags),
 * mapping Dutch and alias strings to the canonical English quiz occasion key.
 */
function getOutfitOccasion(outfit: any, userOccasions: string[]): string | null {
  const userOccLower = userOccasions.map(o => o.toLowerCase());

  // Check explicit occasion field
  if (outfit.occasion && typeof outfit.occasion === 'string') {
    const mapped = OCCASION_ALIAS_TO_KEY[outfit.occasion.toLowerCase()];
    if (mapped && userOccLower.includes(mapped)) return mapped;
    // Direct match fallback
    const direct = outfit.occasion.toLowerCase();
    if (userOccLower.includes(direct)) return direct;
  }

  // Check tags for matching user occasions (with alias mapping)
  if (Array.isArray(outfit.tags)) {
    for (const tag of outfit.tags) {
      const t = tag.toLowerCase();
      const mapped = OCCASION_ALIAS_TO_KEY[t];
      if (mapped && userOccLower.includes(mapped)) return mapped;
      if (userOccLower.includes(t)) return t;
    }
  }

  return null;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const occasionFilter = searchParams.get('occasion')?.toLowerCase() || null;
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

  /** Dutch-friendly display name for the archetype */
  const archetypeDisplayNL = React.useMemo(() => getArchetypeDisplayNL(archetypeName), [archetypeName]);

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

  const allOutfits: (Outfit | OutfitSeed)[] = React.useMemo(() => {
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

  // Filter outfits by occasion when ?occasion= param is set (from dashboard click)
  const displayOutfits: (Outfit | OutfitSeed)[] = React.useMemo(() => {
    if (!occasionFilter || allOutfits.length === 0) return allOutfits;

    const filtered = allOutfits.filter((outfit) => {
      const tags = (outfit as any)?.tags as string[] | undefined;
      const occasion = (outfit as any)?.occasion as string | undefined;
      // Match against tags or occasion field (case-insensitive)
      if (tags && tags.some(t => t.toLowerCase() === occasionFilter)) return true;
      if (occasion && occasion.toLowerCase() === occasionFilter) return true;
      return false;
    });

    // If filter matches nothing, show all outfits rather than an empty page
    return filtered.length > 0 ? filtered : allOutfits;
  }, [allOutfits, occasionFilter]);

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
    if (!outfitsLoading && allOutfits.length > 0) {
      outfitsLoadedTrackedRef.current = true;
      track("results_outfits_loaded", {
        archetype: archetypeName,
        outfit_count: allOutfits.length,
        source: realOutfits && realOutfits.length > 0 ? "realtime" : "seed",
        gallery_mode: galleryMode,
      });
    }
  }, [outfitsLoading, allOutfits.length]);

  const [galleryMode, setGalleryMode] = React.useState<'swipe' | 'grid'>('grid');

  // Occasion grouping: check if outfits have occasion data
  const userOccasions: string[] = React.useMemo(() => {
    return Array.isArray(answers?.occasions) ? answers.occasions : [];
  }, [answers?.occasions]);

  const [activeOccasionTab, setActiveOccasionTab] = React.useState<string>('all');

  const occasionGroupedOutfits = React.useMemo(() => {
    if (userOccasions.length === 0 || displayOutfits.length === 0) return null;

    const groups: Record<string, (Outfit | OutfitSeed)[]> = {};
    const ungrouped: (Outfit | OutfitSeed)[] = [];

    for (const outfit of displayOutfits) {
      const occ = getOutfitOccasion(outfit, userOccasions);
      if (occ) {
        if (!groups[occ]) groups[occ] = [];
        groups[occ].push(outfit);
      } else {
        ungrouped.push(outfit);
      }
    }

    // Only use grouping if at least one outfit has an occasion
    const hasGroupedOutfits = Object.keys(groups).length > 0;
    if (!hasGroupedOutfits) return null;

    // Distribute ungrouped outfits evenly across groups if needed
    // or keep them in an "overig" group
    if (ungrouped.length > 0) {
      groups['overig'] = ungrouped;
    }

    return groups;
  }, [displayOutfits, userOccasions]);

  const occasionTabs = React.useMemo(() => {
    if (!occasionGroupedOutfits) return null;
    const tabs: { value: string; label: string; count: number }[] = [
      { value: 'all', label: 'Alle', count: displayOutfits.length },
    ];
    for (const occ of userOccasions) {
      const key = occ.toLowerCase();
      if (occasionGroupedOutfits[key]) {
        tabs.push({
          value: key,
          label: getOccasionLabel(key),
          count: occasionGroupedOutfits[key].length,
        });
      }
    }
    if (occasionGroupedOutfits['overig']) {
      tabs.push({
        value: 'overig',
        label: 'Overig',
        count: occasionGroupedOutfits['overig'].length,
      });
    }
    return tabs;
  }, [occasionGroupedOutfits, userOccasions, displayOutfits.length]);

  // Filtered outfits based on occasion tab selection
  const occasionFilteredOutfits = React.useMemo(() => {
    if (!occasionGroupedOutfits || activeOccasionTab === 'all') return displayOutfits;
    return occasionGroupedOutfits[activeOccasionTab] || displayOutfits;
  }, [occasionGroupedOutfits, activeOccasionTab, displayOutfits]);

  type ResultTab = 'overzicht' | 'stijl-dna' | 'outfits';
  const [activeTab, setActiveTab] = React.useState<ResultTab>(occasionFilter ? 'outfits' : 'outfits');

  // Auto-switch to outfits tab and scroll when navigating with ?occasion= param
  React.useEffect(() => {
    if (occasionFilter) {
      setActiveTab('outfits');
    }
  }, [occasionFilter]);

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
    { id: 'outfits', label: 'Outfits' },
  ];

  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A] relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
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
        style={{
          opacity: heroOpacity,
          scale: heroScale,
        }}
        className="relative bg-[#F5F0EB] pt-44 md:pt-48 pb-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {hasCompletedQuiz ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center gap-3"
              >
                {/* Eyebrow */}
                <p className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A] mb-4">
                  Jouw stijlrapport
                </p>

                {/* Style name — Instrument Serif italic (inline style fallback) */}
                <h1
                  className="mb-3"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "clamp(40px, 8vw, 64px)",
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: "-1px",
                    color: "#1A1A1A",
                    lineHeight: 1.05,
                    textAlign: "center",
                  }}
                >
                  {archetypeName}
                </h1>

                {/* Outfit count */}
                <p className="text-base text-[#4A4A4A] mb-8">
                  {displayOutfits.length} outfits{favs.length > 0 ? ` · ${favs.length} bewaard` : ''}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('outfits');
                      // Scroll to tab bar so outfits content is immediately visible
                      requestAnimationFrame(() => {
                        const tabBar = document.querySelector('[role="tablist"]');
                        if (tabBar) {
                          const rect = tabBar.getBoundingClientRect();
                          const scrollTop = window.scrollY + rect.top - 72; // 72px = fixed header height
                          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
                        }
                      });
                    }}
                    className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)]"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    Bekijk outfits
                  </button>

                  <button
                    onClick={() => navigate('/onboarding?step=redo')}
                    className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-sm py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Quiz opnieuw
                  </button>

                  <button
                    onClick={sharePage}
                    className="w-10 h-10 rounded-full border border-[#E5E5E5] hover:border-[#C2654A] flex items-center justify-center transition-colors duration-200"
                    aria-label="Delen"
                  >
                    <Share2 className="w-4 h-4 text-[#4A4A4A]" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-4 text-left">
                <p className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A] mb-4">
                  Style Report
                </p>
                <h1
                  className="font-serif italic text-[#1A1A1A] leading-[1.05] mb-3"
                  style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
                >
                  Jouw stijl
                </h1>
                <p className="text-base text-[#4A4A4A] mb-8 leading-relaxed max-w-sm">Voltooi de stijlquiz om je persoonlijke outfit-aanbevelingen te ontvangen</p>
                <NavLink
                  to="/onboarding"
                  className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)]"
                >
                  Begin gratis
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── STICKY TAB BAR ── */}
      {hasCompletedQuiz && (
        <div className="sticky top-[80px] z-30 bg-white border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-0">
              <div
                role="tablist"
                className="flex items-center gap-0"
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
                      className={`relative flex items-center gap-1.5 py-4 px-6 text-sm whitespace-nowrap transition-colors duration-200 border-b-2 cursor-pointer bg-transparent rounded-none shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 focus-visible:ring-inset ${
                        isActive
                          ? 'font-semibold text-[#C2654A] border-[#C2654A]'
                          : 'font-medium text-[#8A8A8A] border-transparent hover:text-[#4A4A4A]'
                      }`}
                    >
                      {tab.label}
                      {tab.sub && (
                        <span className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                          isActive
                            ? 'bg-[#F4E8E3] text-[#C2654A]'
                            : 'bg-[#E5E5E5] text-[#8A8A8A]'
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
      )}

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">

      {/* TAB 1: OVERZICHT */}
      {(!hasCompletedQuiz || activeTab === 'overzicht') && (
        <motion.div
          key="tab-overzicht"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >

      {hasCompletedQuiz && activeColorProfile && (
        <section className="py-8 sm:py-10">
          <div className="ff-container">
            <div className="max-w-5xl mx-auto">
              <StyleIdentityHero
                primaryArchetype={archetypeKey}
                colorProfile={activeColorProfile}
                quizAnswers={answers ?? {}}
                swipeInsights={swipeInsights}
              />
              {answers && (
                <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
                  <QuizInputSummary
                    answers={answers}
                    archetypeName={archetypeName}
                  />
                </div>
              )}
            </div>
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
        <section className="py-3">
          <div className="ff-container">
            <div className="max-w-5xl mx-auto">
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
          </div>
        </section>
      )}

      {/* Top outfits voor jou */}
      {hasCompletedQuiz && (
        <section className="py-12 sm:py-16 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <div className="text-center mb-8">
                  <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-3">
                    Jouw top outfits
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Instrument Serif', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "clamp(28px, 5vw, 40px)",
                      fontWeight: 400,
                      color: "#1A1A1A",
                      lineHeight: 1.15,
                    }}
                  >
                    Direct aan de slag
                  </h2>
                </div>
              </AnimatedSection>

              {outfitsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 animate-pulse">
                      <div className="aspect-[4/5] rounded-xl bg-[#F5F0EB] mb-4" />
                      <div className="h-4 bg-[#F5F0EB] rounded w-3/4 mb-2" />
                      <div className="h-3 bg-[#F5F0EB] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : displayOutfits.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...displayOutfits]
                      .sort((a, b) => {
                        const scoreA = (a as any).matchScore ?? (a as any).match ?? (a as any).matchPercentage ?? 0;
                        const scoreB = (b as any).matchScore ?? (b as any).match ?? (b as any).matchPercentage ?? 0;
                        return scoreB - scoreA;
                      })
                      .slice(0, 3)
                      .map((outfit, idx) => {
                        const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                        const title = (outfit as any).name || (outfit as any).title || `Outfit ${idx + 1}`;
                        const description = (outfit as any).explanation || (outfit as any).description || '';
                        const imageUrl = (outfit as any).image || (outfit as any).imageUrl || '';
                        const matchPct = (outfit as any).matchScore ?? (outfit as any).match ?? (outfit as any).matchPercentage;
                        const products = Array.isArray((outfit as any).products)
                          ? (outfit as any).products.map((p: any) => ({
                              id: p.id || `p-${idx}`,
                              name: p.name || p.title || 'Product',
                              brand: p.brand,
                              imageUrl: p.imageUrl || p.image_url || p.image || '',
                              price: p.price,
                              currency: p.currency || 'EUR',
                              retailer: p.retailer,
                              affiliateUrl: p.affiliateUrl || p.affiliate_url,
                              productUrl: p.productUrl || p.product_url || p.url,
                              category: p.category,
                              color: p.color,
                              colors: p.colors,
                            }))
                          : [];

                        return (
                          <AnimatedSection key={String(id)} delay={idx * 0.08}>
                            <OutfitCard
                              outfit={{
                                id: String(id),
                                title,
                                description,
                                imageUrl,
                                matchPercentage: typeof matchPct === 'number' ? matchPct : undefined,
                                archetype: archetypeName,
                                tags: (outfit as any).tags,
                                products,
                              }}
                            />
                          </AnimatedSection>
                        );
                      })}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={() => {
                        setActiveTab('outfits');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[#C2654A] hover:text-[#A8513A] font-semibold text-sm transition-colors duration-200"
                    >
                      Bekijk alle outfits →
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {hasCompletedQuiz && (
        <section className="py-6 sm:py-8 border-t border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] mb-3">Verder verkennen</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-8">
                <button
                  onClick={() => { setActiveTab('stijl-dna'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-[#C2654A] transition-all duration-300 flex items-center gap-4 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#F4E8E3] transition-colors duration-200">
                    <Palette className="w-5 h-5 text-[#C2654A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[#1A1A1A]">Stijl DNA</p>
                    <p className="text-sm text-[#8A8A8A]">Kleurprofiel, archetype &amp; tips</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8A8A8A] shrink-0 ml-auto group-hover:text-[#C2654A] transition-colors duration-200" />
                </button>

                <button
                  onClick={() => { setActiveTab('outfits'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-[#C2654A] transition-all duration-300 flex items-center gap-4 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#F4E8E3] transition-colors duration-200">
                    <Shirt className="w-5 h-5 text-[#C2654A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[#1A1A1A]">Outfits</p>
                    <p className="text-sm text-[#8A8A8A]">{displayOutfits.length} looks voor jouw stijl</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8A8A8A] shrink-0 ml-auto group-hover:text-[#C2654A] transition-colors duration-200" />
                </button>
              </div>
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >

      {color && (
        <section className="py-8 sm:py-10">
          <div className="ff-container">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Section header */}
              <AnimatedSection>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C2654A] mb-1.5">
                      Stijl DNA
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                      {archetypeName} · {activeColorProfile.paletteName}
                    </h2>
                    <p className="text-sm text-[#8A8A8A] mt-1">
                      {answers?.photoUrl
                        ? 'Op basis van jouw kleurvoorkeur én huidondertoon uit je foto'
                        : 'Op basis van jouw kleurvoorkeur uit de quiz'}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1">
                    <StyleProfileConfidenceBadge
                      dataSource={profileDataSource}
                      confidence={profileConfidence}
                    />
                  </div>
                </div>
              </AnimatedSection>

              {/* Color profile + insights — single unified card */}
              <AnimatedSection delay={0.1}>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5]">

                    {/* Color profile column */}
                    <div className="p-5 sm:p-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] mb-4">Kleurprofiel</p>
                      <div className="divide-y divide-[#E5E5E5]">
                        <div className="flex items-center justify-between py-3 first:pt-0">
                          <span className="text-sm text-[#8A8A8A]">Temperatuur</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #F4E8E3, #C2654A, #D4913D)' }} aria-hidden="true" />
                            <span className="text-sm font-medium text-[#1A1A1A] min-w-[4rem] text-right">{formatStyleDNAValue('temperature', activeColorProfile.temperature)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-[#8A8A8A]">Contrast</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 w-20" aria-hidden="true">
                              <div className="h-1.5 flex-1 rounded-l-full" style={{ background: 'linear-gradient(to right, #F4E8E3, #D4917A)' }} />
                              <div className="h-1.5 flex-1" style={{ background: 'linear-gradient(to right, #C2654A, #A8513A)' }} />
                              <div className="h-1.5 flex-1 rounded-r-full" style={{ background: 'linear-gradient(to right, #8B3D2E, #5C2820)' }} />
                            </div>
                            <span className="text-sm font-medium text-[#1A1A1A] min-w-[4rem] text-right">{formatStyleDNAValue('contrast', activeColorProfile.contrast)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-[#8A8A8A]">Seizoen</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1" aria-hidden="true">
                              {(['zomer', 'herfst', 'winter', 'lente'] as const).map((s) => (
                                <div
                                  key={s}
                                  className={`h-4 w-4 rounded transition-opacity duration-200 ${activeColorProfile.season === s ? 'opacity-100 ring-1 ring-[#C2654A]/20 ring-offset-1' : 'opacity-25'}`}
                                  style={{ background: s === 'zomer' ? 'linear-gradient(135deg, #d4e8c2, #a8cc8a)' : s === 'herfst' ? 'linear-gradient(135deg, #e8c4a2, #c47a3a)' : s === 'winter' ? 'linear-gradient(135deg, #d0dce8, #7a9ab8)' : 'linear-gradient(135deg, #e8d4c0, #c4956a)' }}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-[#1A1A1A] min-w-[4rem] text-right">{getSeasonDisplayName(activeColorProfile)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 last:pb-0">
                          <span className="text-sm text-[#8A8A8A]">Chroma</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #F4E8E3, #C2654A, #8B3D2E)' }} aria-hidden="true" />
                            <span className="text-sm font-medium text-[#1A1A1A] min-w-[4rem] text-right">{formatStyleDNAValue('chroma', activeColorProfile.chroma)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key insights column */}
                    <div className="p-5 sm:p-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] mb-4">Inzichten</p>
                      <ul className="space-y-3">
                        {activeColorProfile.notes && activeColorProfile.notes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-[#C2654A]" strokeWidth={3} aria-hidden="true" />
                            </div>
                            <span className="text-sm text-[#1A1A1A] leading-snug">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Shopping Guidance */}
              {(user?.tier === 'premium' || user?.tier === 'founder' || user?.isPremium) && answers?.photoUrl ? (
                <AnimatedSection delay={0.15}>
                  <ShoppingGuidance
                    season={activeColorProfile.season}
                    contrast={activeColorProfile.contrast}
                    chroma={activeColorProfile.chroma}
                  />
                </AnimatedSection>
              ) : (
                <AnimatedSection delay={0.15}>
                  <div className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-[#C2654A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">Persoonlijk kleurenpalet op basis van jouw ondertoon</p>
                        <p className="text-xs text-[#4A4A4A] mt-0.5">
                          {!answers?.photoUrl ? 'Upload een selfie en activeer Premium voor kleuradvies op maat.' : 'Activeer Premium voor jouw seizoensgebonden shopping-gids.'}
                        </p>
                      </div>
                    </div>
                    <NavLink
                      to="/prijzen#premium"
                      className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 bg-[#C2654A] hover:bg-[#A8513A] text-white rounded-xl font-semibold text-base transition-colors duration-200 whitespace-nowrap"
                    >
                      Bekijk Premium
                    </NavLink>
                  </div>
                </AnimatedSection>
              )}

              <AnimatedSection delay={0.2}>
                <ColorProfileExplainer
                  colorProfile={activeColorProfile}
                  confidence={profileConfidence}
                />
              </AnimatedSection>

              <AnimatedSection delay={0.25}>
                <ColorPaletteSection
                  season={activeColorProfile.season}
                  subSeason={activeColorProfile.subSeason}
                  hasPhoto={!!answers?.photoUrl}
                />
              </AnimatedSection>

              {/* Shop in jouw kleuren */}
              {(() => {
                const palette = getColorPalette(activeColorProfile.subSeason || activeColorProfile.season);
                const doColorHexes = palette?.doColors?.map(c => c.hex.toLowerCase()) || [];

                if (doColorHexes.length === 0 || !displayOutfits.length) return null;

                // Find products from top outfits that color-match doColors
                const colorMatchProducts: Array<{
                  product: any;
                  outfitId: string;
                  slot: number;
                }> = [];

                const topOutfits = [...displayOutfits]
                  .sort((a, b) => {
                    const sa = (a as any).matchScore ?? (a as any).match ?? 0;
                    const sb = (b as any).matchScore ?? (b as any).match ?? 0;
                    return sb - sa;
                  })
                  .slice(0, 6);

                for (const outfit of topOutfits) {
                  const products = (outfit as any).products;
                  const outfitId = String((outfit as any).id || '');
                  if (!Array.isArray(products)) continue;

                  products.forEach((p: any, pIdx: number) => {
                    if (colorMatchProducts.length >= 4) return;
                    const productColors = [
                      ...(Array.isArray(p.colors) ? p.colors : []),
                      p.color,
                    ].filter(Boolean).map((c: string) => c.toLowerCase());

                    const hasColorMatch = productColors.some((pc: string) =>
                      doColorHexes.some((dc) => {
                        // Match exact hex or close enough by name
                        if (pc === dc) return true;
                        // Also check if color name matches any doColor name
                        return false;
                      })
                    );

                    // Also include if product has a url (we want to show shoplinks)
                    const hasUrl = p.affiliateUrl || p.affiliate_url || p.productUrl || p.product_url || p.url;
                    if ((hasColorMatch || productColors.length === 0) && hasUrl) {
                      // Avoid duplicates
                      if (!colorMatchProducts.some(cp => cp.product.id === p.id)) {
                        colorMatchProducts.push({ product: p, outfitId, slot: pIdx + 1 });
                      }
                    }
                  });
                }

                if (colorMatchProducts.length === 0) return null;

                return (
                  <AnimatedSection delay={0.28}>
                    <div className="bg-[#F5F0EB] rounded-2xl p-6">
                      <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-3">
                        Shop in jouw kleuren
                      </p>
                      <h3
                        className="mb-5"
                        style={{
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          fontStyle: "italic",
                          fontSize: "clamp(22px, 4vw, 28px)",
                          fontWeight: 400,
                          color: "#1A1A1A",
                          lineHeight: 1.2,
                        }}
                      >
                        Producten in jouw palet
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {colorMatchProducts.slice(0, 4).map(({ product, outfitId, slot }, idx) => {
                          const name = product.name || product.title || `Product ${idx + 1}`;
                          const brand = product.brand || product.retailer || null;
                          const imageUrl = product.imageUrl || product.image_url || product.image || '';
                          const rawPrice = typeof product.price === 'number'
                            ? product.price
                            : parseFloat(String(product.price ?? '')) || null;

                          return (
                            <div
                              key={product.id || idx}
                              className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                              onClick={async () => {
                                await openProductLink({
                                  product: {
                                    id: product.id || `cp-${idx}`,
                                    name,
                                    retailer: brand || undefined,
                                    price: rawPrice || undefined,
                                    affiliateUrl: product.affiliateUrl || product.affiliate_url,
                                    productUrl: product.productUrl || product.product_url || product.url,
                                  },
                                  outfitId,
                                  slot,
                                  source: 'shop_in_jouw_kleuren',
                                });
                              }}
                            >
                              {imageUrl ? (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F0EB]">
                                  <img
                                    src={imageUrl}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-[#F5F0EB] flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-[#C2654A]/30" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                {brand && (
                                  <p className="text-[11px] font-medium text-[#8A8A8A] mb-0.5 truncate">{brand}</p>
                                )}
                                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{name}</p>
                                {rawPrice != null && rawPrice > 0 && (
                                  <p className="text-sm font-bold text-[#1A1A1A] mt-1">
                                    €{rawPrice % 1 === 0 ? rawPrice.toFixed(0) : rawPrice.toFixed(2)}
                                  </p>
                                )}
                                <p className="text-xs font-semibold text-[#C2654A] mt-1.5 inline-flex items-center gap-1">
                                  Bekijk bij partner
                                  <ExternalLink className="w-3 h-3" />
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })()}

              {user?.isPremium && (
                <AnimatedSection delay={0.3}>
                  <TrendInsights
                    userSeason={activeColorProfile.season as 'winter' | 'zomer' | 'herfst' | 'lente'}
                    compact={false}
                  />
                </AnimatedSection>
              )}

              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.3}>
                  <StyleDNAMixIndicator
                    mixItems={archetypeDetectionResult.scores.map(s => ({
                      archetype: s.archetype as ArchetypeKey,
                      percentage: s.score
                    }))}
                    confidence={archetypeDetectionResult.confidence}
                  />
                </AnimatedSection>
              )}

              {archetypeDetectionResult && archetypeDetectionResult.scores.length > 0 && (
                <AnimatedSection delay={0.35}>
                  <ArchetypeBreakdown
                    archetypeScores={archetypeDetectionResult.scores.map(s => ({
                      archetype: s.archetype as ArchetypeKey,
                      percentage: s.score
                    }))}
                    confidence={archetypeDetectionResult.confidence}
                  />
                </AnimatedSection>
              )}

              {/* How your style was determined — condensed */}
              <AnimatedSection delay={0.4}>
                <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-[#E5E5E5]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Methodologie</p>
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mt-0.5">Zo hebben we jouw stijl bepaald</h3>
                  </div>
                  <div className="divide-y divide-[#E5E5E5]">
                    <div className="flex items-start gap-4 px-5 sm:px-6 py-4">
                      <span className="w-6 h-6 rounded-full bg-[#C2654A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Stijltype: {archetypeName}</p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                          {[answers?.fit && `Pasvorm: ${answers.fit}`, answers?.occasions?.length && `Gelegenheden: ${(answers.occasions as string[]).join(', ')}`, answers?.goals?.length && `Doelen: ${(answers.goals as string[]).join(', ')}`].filter(Boolean).join(' · ') || 'Jouw quiz-antwoorden zijn verwerkt in dit profiel.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 px-5 sm:px-6 py-4">
                      <span className="w-6 h-6 rounded-full bg-[#A8513A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Kleuranalyse: {getSeasonDisplayName(activeColorProfile)} — {activeColorProfile.paletteName}</p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                          {formatStyleDNAValue('temperature', activeColorProfile.temperature)} temperatuur · {formatStyleDNAValue('contrast', activeColorProfile.contrast)} contrast · {getSeasonDescription(activeColorProfile.season, activeColorProfile.contrast, activeColorProfile.temperature)}
                          {!answers?.photoUrl && ' · Gebaseerd op voorkeur, geen foto gebruikt'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 px-5 sm:px-6 py-4">
                      <span className="w-6 h-6 rounded-full bg-[#C2654A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Intelligente matching</p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                          Kleurharmonie, stijlcompatibiliteit en gelegenheidscontext gecombineerd tot outfits die passen bij jouw {archetypeName.toLowerCase()} DNA.
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
        <section id="outfits-section" className="pt-10 sm:pt-12 pb-8">
          <div className="ff-container">
            <AnimatedSection>
              <div className="max-w-5xl mx-auto">

              {/* Compact header: headline + toggle + Aanpassen */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2
                  className="text-xl sm:text-2xl text-[#1A1A1A] tracking-tight"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {occasionFilter
                    ? `${occasionFilter.charAt(0).toUpperCase() + occasionFilter.slice(1)}`
                    : 'Handpicked voor jou'}
                </h2>
                <div className="shrink-0 flex items-center gap-3">
                  {/* Swipe/Grid toggle — compact */}
                  <div className="hidden sm:flex items-center gap-1 bg-[#F5F0EB] rounded-full p-1">
                    <button
                      onClick={() => setGalleryMode('swipe')}
                      aria-pressed={galleryMode === 'swipe'}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 ${
                        galleryMode === 'swipe'
                          ? 'bg-white text-[#1A1A1A] shadow-sm'
                          : 'text-[#8A8A8A] hover:text-[#4A4A4A]'
                      }`}
                      aria-label="Swipe weergave"
                    >
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setGalleryMode('grid')}
                      aria-pressed={galleryMode === 'grid'}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 ${
                        galleryMode === 'grid'
                          ? 'bg-white text-[#1A1A1A] shadow-sm'
                          : 'text-[#8A8A8A] hover:text-[#4A4A4A]'
                      }`}
                      aria-label="Grid weergave"
                    >
                      <Grid3x3 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  {occasionFilter && (
                    <button
                      onClick={() => {
                        searchParams.delete('occasion');
                        setSearchParams(searchParams, { replace: true });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C2654A] text-sm font-medium text-white hover:bg-[#A8513A] transition-all duration-200 whitespace-nowrap"
                    >
                      Alle outfits
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-sm font-medium text-[#4A4A4A] hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Aanpassen</span>
                  </button>
                </div>
              </div>

              {/* Occasion tabs — inline, no label, no counts */}
              {occasionTabs && occasionTabs.length > 2 && (
                <div className="mt-4 mb-8 border-b border-[#E5E5E5]">
                  <div className="flex gap-0 overflow-x-auto -mb-px" role="tablist" aria-label="Filter op gelegenheid">
                    {occasionTabs.map((tab) => {
                      const isActive = activeOccasionTab === tab.value;
                      return (
                        <button
                          key={tab.value}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveOccasionTab(tab.value)}
                          className={`relative py-3 px-5 text-sm whitespace-nowrap transition-colors duration-200 border-b-2 cursor-pointer bg-transparent rounded-none shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 focus-visible:ring-inset ${
                            isActive
                              ? 'font-semibold text-[#C2654A] border-[#C2654A]'
                              : 'font-medium text-[#8A8A8A] border-transparent hover:text-[#4A4A4A]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spacer when no occasion tabs */}
              {(!occasionTabs || occasionTabs.length <= 2) && (
                <div className="mb-8" />
              )}

              </div>
            </AnimatedSection>

            {outfitsLoading ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="w-10 h-10 border-[3px] border-[#E5E5E5] border-t-[#C2654A] rounded-full animate-spin" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[#1A1A1A]">Outfits worden samengesteld…</p>
                  <p className="text-xs text-[#8A8A8A] mt-1">We selecteren outfits die passen bij jouw stijl en kleurprofiel.</p>
                </div>
              </div>
            ) : displayOutfits.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F0EB] flex items-center justify-center mx-auto mb-6">
                  <Shirt className="w-7 h-7 text-[#C2654A]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1A1A1A] mb-2">Geen outfits gevonden</p>
                  <p className="text-sm text-[#4A4A4A] max-w-sm mx-auto leading-relaxed">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2654A] text-white rounded-xl text-sm font-bold hover:bg-[#A8513A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 focus-visible:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Stijlquiz opnieuw
                </button>
              </div>
            ) : galleryMode === 'swipe' ? (
              <SwipeableOutfitGallery
                outfits={occasionFilteredOutfits as any[]}
                onLike={(outfit) => {
                  const id = 'id' in outfit ? outfit.id : outfit.toString();
                  toggleFav(String(id));
                }}
                onDislike={() => {}}
                renderCard={(outfit) => {
                  const idx = occasionFilteredOutfits.findIndex(o => o === outfit);
                  const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                  const isFav = favs.includes(String(id));
                  const outfitInfo = generateOutfitDescription(archetypeName, idx, occasionFilteredOutfits.length);
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
                    <div
                      className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden h-full hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#C2654A] transition-all duration-300 cursor-pointer group"
                      onClick={() => {
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
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EB]">
                        {outfitImage ? (
                          <img
                            src={outfitImage}
                            alt={'name' in outfit ? outfit.name : `Outfit ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                          <div className="w-full h-full bg-gradient-to-br from-[#F4E8E3] to-[#F5F0EB] flex items-center justify-center">
                            <div className="text-center p-6">
                              <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#C2654A]" aria-hidden="true" />
                              <p className="text-xs text-[#8A8A8A] font-medium">Outfit {idx + 1}</p>
                            </div>
                          </div>
                        )}

                        {/* Occasion badge */}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[1px] uppercase text-[#1A1A1A] shadow-sm z-10">
                          {outfitInfo.context.label}
                        </span>

                        {/* Favorite */}
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
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm z-10 transition-all duration-200 hover:bg-white hover:scale-110 ${
                            favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`))
                              ? 'text-[#C2654A]'
                              : 'text-[#8A8A8A] hover:text-[#C2654A]'
                          }`}
                          aria-label={favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`)) ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                        >
                          <Heart className={`w-4 h-4 ${favs.includes(String('id' in outfit ? outfit.id : `seed-${idx}`)) ? 'fill-[#C2654A]' : ''}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-[#1A1A1A] mb-1.5 group-hover:text-[#C2654A] transition-colors duration-200">
                          {'name' in outfit ? outfit.name : outfitInfo.title}
                        </h3>
                        <p className="text-sm text-[#4A4A4A] leading-[1.5] line-clamp-1 mb-3">
                          {('explanation' in outfit && outfit.explanation)
                            ? (outfit.explanation as string)
                            : outfitInfo.description}
                        </p>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const ms = (outfit as any).matchScore ?? (outfit as any).match;
                            return typeof ms === 'number' ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-[#C2654A]" strokeWidth={3} />
                                </span>
                                <span className="text-sm font-semibold text-[#C2654A]">{Math.round(ms)}% match</span>
                              </span>
                            ) : null;
                          })()}
                          {answers?.fit && (
                            <span className="px-2.5 py-1 rounded-full bg-[#F5F0EB] text-xs font-medium text-[#4A4A4A]">{answers.fit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
                className="max-w-5xl mx-auto"
              />
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {occasionFilteredOutfits.map((outfit, idx) => {
                  const id = 'id' in outfit ? outfit.id : `seed-${idx}`;
                  const isFav = favs.includes(String(id));
                  const outfitInfo = generateOutfitDescription(archetypeName, idx, occasionFilteredOutfits.length);
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
                  const rowIndex = Math.floor(idx / 3);
                  const colIndex = idx % 3;

                  return (
                    <AnimatedSection key={String(id)} delay={rowIndex === 0 ? colIndex * 0.08 : 0.05}>
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

            {/* Upsell Block */}
            <AnimatedSection delay={0.6}>
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 md:p-10 max-w-[800px] mx-auto mt-12">
                {/* PREMIUM label */}
                <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-3">
                  Premium
                </p>

                {/* Headline */}
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  Ontgrendel je volledige garderobe
                </h3>

                {/* Features */}
                <div className="flex flex-col gap-2.5 mb-6">
                  {[
                    'Alle 50+ outfitcombinaties',
                    'Matchscores en stijluitleg per item',
                    'Directe shoplinks naar webshops',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] shrink-0" aria-hidden="true" />
                      <span className="text-sm text-[#4A4A4A]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price + buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-6 border-t border-[#E5E5E5]">
                  <div>
                    <div>
                      <span className="text-2xl font-extrabold text-[#1A1A1A]">€9,99</span>
                      <span className="text-base font-normal text-[#8A8A8A] ml-1">/maand</span>
                    </div>
                    <p className="text-xs text-[#8A8A8A]">Maandelijks opzegbaar</p>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <NavLink
                      to="/prijzen#premium"
                      className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3 px-6 rounded-full transition-all duration-200"
                    >
                      Ontgrendel premium →
                    </NavLink>
                    <NavLink
                      to={user ? "/dashboard" : "/registreren"}
                      className="text-sm font-medium text-[#4A4A4A] hover:text-[#C2654A] transition-colors duration-200"
                    >
                      Ga naar dashboard
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
