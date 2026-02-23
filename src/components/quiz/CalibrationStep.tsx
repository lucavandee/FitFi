import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { OutfitCalibrationCard } from './OutfitCalibrationCard';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { CalibrationService } from '@/services/visualPreferences/calibrationService';
import { CalibrationBridge } from '@/services/calibration/calibrationBridge';
import { VisualPreferenceService } from '@/services/visualPreferences/visualPreferenceService';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';

interface CalibrationStepProps {
  onComplete: () => void;
  quizData?: any;
  sessionId?: string;
  onBack?: () => void;
}

const OUTFIT_CACHE_KEY = 'fitfi_calibration_outfits';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Feature flag for adaptive system
const USE_ADAPTIVE_SYSTEM = true;

export function CalibrationStep({ onComplete, quizData, sessionId: sessionIdProp, onBack }: CalibrationStepProps) {
  const [outfits, setOutfits] = useState<CalibrationOutfit[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'spot_on' | 'not_for_me' | 'maybe'>>({});
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [swappingState, setSwappingState] = useState<{ outfitId: string; category: 'top' | 'bottom' | 'shoes' } | null>(null);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const { user } = useUser();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadCalibrationOutfits();
    }
  }, []);

  const loadCalibrationOutfits = async () => {
    try {
      const userId = user?.id;
      const sessionId = sessionIdProp || sessionStorage.getItem('fitfi_session_id');

      // Check cache first (only for non-adaptive mode)
      if (!USE_ADAPTIVE_SYSTEM) {
        const cachedData = sessionStorage.getItem(OUTFIT_CACHE_KEY);
        if (cachedData) {
          try {
            const { outfits: cachedOutfits, timestamp } = JSON.parse(cachedData);
            const age = Date.now() - timestamp;

            if (age < CACHE_DURATION_MS && cachedOutfits.length === 3) {
              console.log('✅ Using cached calibration outfits');
              setOutfits(cachedOutfits);
              setLoading(false);
              return;
            }
          } catch (parseErr) {
            console.warn('Failed to parse cached outfits, regenerating...');
          }
        }
      }

      let generatedOutfits: CalibrationOutfit[];

      if (USE_ADAPTIVE_SYSTEM) {
        // Use new adaptive system
        console.log('🚀 Using ADAPTIVE outfit generation system');
        setIsAdaptive(true);

        generatedOutfits = await CalibrationBridge.generateAdaptiveCalibrationOutfits(
          userId,
          sessionId || undefined,
          quizData
        );

        console.log(`✅ Generated ${generatedOutfits.length} adaptive outfits`);
      } else {
        // Use legacy system
        const embedding = await VisualPreferenceService.getVisualEmbeddingFromProfile(
          userId,
          sessionId || undefined
        );

        if (!embedding || Object.keys(embedding).length === 0) {
          console.warn('No visual preferences found, using defaults');
          const defaultEmbedding = {
            minimal: 70,
            classic: 60,
            casual: 50
          };
          generatedOutfits = await CalibrationService.generateCalibrationOutfits(
            defaultEmbedding,
            quizData,
            userId,
            sessionId || undefined
          );
        } else {
          generatedOutfits = await CalibrationService.generateCalibrationOutfits(
            embedding,
            quizData,
            userId,
            sessionId || undefined
          );
        }

        // Cache for next time
        try {
          sessionStorage.setItem(OUTFIT_CACHE_KEY, JSON.stringify({
            outfits: generatedOutfits,
            timestamp: Date.now()
          }));
          console.log('✅ Cached calibration outfits');
        } catch (cacheErr) {
          console.warn('Failed to cache outfits:', cacheErr);
        }
      }

      setOutfits(generatedOutfits);
    } catch (err) {
      console.error('Failed to load calibration outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapItem = async (outfitId: string, category: 'top' | 'bottom' | 'shoes') => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    setSwappingState({ outfitId, category });

    try {
      const newItem = await CalibrationService.swapOutfitItem(outfit, category, quizData);

      if (newItem) {
        setOutfits(prev => prev.map(o => {
          if (o.id === outfitId) {
            return {
              ...o,
              items: {
                ...o.items,
                [category]: newItem
              }
            };
          }
          return o;
        }));

        // Update cache
        const cachedData = sessionStorage.getItem(OUTFIT_CACHE_KEY);
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            const updatedOutfits = parsed.outfits.map((o: CalibrationOutfit) => {
              if (o.id === outfitId) {
                return {
                  ...o,
                  items: {
                    ...o.items,
                    [category]: newItem
                  }
                };
              }
              return o;
            });
            sessionStorage.setItem(OUTFIT_CACHE_KEY, JSON.stringify({
              outfits: updatedOutfits,
              timestamp: parsed.timestamp
            }));
          } catch (e) {
            console.warn('Failed to update cache:', e);
          }
        }

        console.log(`✅ Swapped ${category} in outfit ${outfitId}:`, newItem.name);
      }
    } catch (err) {
      console.error('Failed to swap item:', err);
    } finally {
      setSwappingState(null);
    }
  };

  const handleFeedback = async (
    outfitId: string,
    feedbackType: 'spot_on' | 'not_for_me' | 'maybe',
    responseTimeMs: number
  ) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    setFeedback(prev => ({ ...prev, [outfitId]: feedbackType }));

    try {
      const userId = user?.id;
      const sessionId = sessionIdProp || sessionStorage.getItem('fitfi_session_id');

      if (USE_ADAPTIVE_SYSTEM) {
        // Use adaptive feedback recording
        await CalibrationBridge.recordAdaptiveFeedback(
          outfitId,
          userId,
          sessionId || undefined,
          feedbackType,
          outfit
        );
        console.log(`✅ Recorded adaptive feedback: ${feedbackType}`);
      } else {
        // Use legacy feedback recording
        await CalibrationService.recordFeedback({
          user_id: userId || undefined,
          session_id: sessionId || undefined,
          outfit_data: outfit.items,
          feedback: feedbackType,
          response_time_ms: responseTimeMs,
          outfit_archetypes: outfit.archetypes,
          dominant_colors: outfit.dominantColors,
          occasion: outfit.occasion
        });
      }
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  const handleContinue = async () => {
    setApplying(true);

    try {
      const userId = user?.id;
      const sessionId = sessionIdProp || sessionStorage.getItem('fitfi_session_id');

      // Apply calibration to profile
      await CalibrationService.applyCalibrationToProfile(
        userId,
        !userId ? sessionId || undefined : undefined
      );

      // Clear cache after successful completion
      sessionStorage.removeItem(OUTFIT_CACHE_KEY);
      console.log('✅ Cleared calibration cache after completion');

      // Short delay for UI feedback
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Failed to apply calibration:', err);
      setApplying(false);
    }
  };

  // Calculate feedback impact summary
  const getFeedbackImpact = () => {
    const spotOnCount = Object.values(feedback).filter(f => f === 'spot_on').length;
    const notForMeCount = Object.values(feedback).filter(f => f === 'not_for_me').length;
    const maybeCount = Object.values(feedback).filter(f => f === 'maybe').length;

    if (spotOnCount === 3) {
      return '✨ Perfect! We begrijpen je stijl nu volledig. Je aanbevelingen blijven binnen deze richtlijnen.';
    }
    if (notForMeCount >= 2) {
      return '🔄 We zien dat deze outfits niet helemaal passen. Je aanbevelingen worden aangepast naar jouw voorkeuren.';
    }
    if (spotOnCount >= 2) {
      return '👍 Goed zo! We verfijnen je profiel met deze feedback en tonen vergelijkbare outfits.';
    }
    return '📊 Je feedback helpt ons je stijl beter te begrijpen. We passen je aanbevelingen hierop aan.';
  };

  const allRated = outfits.length > 0 && outfits.every(o => feedback[o.id]);
  const feedbackCount = Object.keys(feedback).length;
  const hasEnoughFeedback = feedbackCount >= Math.min(3, outfits.length) || outfits.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px] py-16">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--ff-color-primary-700)] rounded-full animate-spin" />
          <p className="mt-4 text-[var(--color-muted)]">Outfits voorbereiden...</p>
        </div>
      </div>
    );
  }

  // If no outfits could be generated, allow skip
  if (outfits.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-6">
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            Outfit Calibratie
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
          We zijn je profiel aan het voorbereiden
        </h2>
        <p className="text-[var(--color-muted)] mb-8">
          Op dit moment kunnen we nog geen outfits genereren, maar we gaan direct verder met je stijlrapport op basis van je quiz- en swipe-antwoorden.
        </p>
        <button
          onClick={onComplete}
          className="ff-btn ff-btn-primary inline-flex items-center gap-2"
        >
          Ga verder
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-4">
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            Outfit Calibratie
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
          Zo ziet jouw stijl er volgens mij uit
        </h2>
        <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-base sm:text-lg">
          Nova heeft {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} voor je samengesteld op basis van je swipes. Geef feedback zodat we je stijl perfect kunnen afstemmen.
        </p>

        {isAdaptive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-100)] border border-[var(--ff-color-primary-200)]"
          >
            <TrendingUp size={16} className="text-[var(--ff-color-primary-700)]" />
            <span className="text-sm font-semibold text-[var(--ff-color-primary-700)]">
              Adaptive AI • Leert van je keuzes
            </span>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-text)]">
              Voortgang
            </span>
            <span className="text-sm font-medium text-[var(--ff-color-primary-700)]">
              {feedbackCount} / {outfits.length}
            </span>
          </div>
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(feedbackCount / outfits.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-full"
            />
          </div>
        </div>

        {allRated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">
              Perfect! Alle outfits beoordeeld
            </span>
          </motion.div>
        )}
      </div>

      <div className="space-y-6 mb-8">
        {outfits.map((outfit, index) => (
          <OutfitCalibrationCard
            key={outfit.id}
            outfit={outfit}
            onFeedback={(feedbackType, responseTimeMs) =>
              handleFeedback(outfit.id, feedbackType, responseTimeMs)
            }
            onSwapItem={(category) => handleSwapItem(outfit.id, category)}
            swappingCategory={swappingState?.outfitId === outfit.id ? swappingState.category : null}
            disabled={applying || (swappingState !== null && swappingState.outfitId !== outfit.id)}
          />
        ))}
      </div>

      {allRated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-6 mb-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-2">
              Impact op je stijlprofiel
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {getFeedbackImpact()}
            </p>
          </div>

          <motion.button
            onClick={handleContinue}
            disabled={applying}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="ff-btn ff-btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {applying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Style DNA wordt gegenereerd...
              </>
            ) : (
              <>
                Bekijk je persoonlijke stijlrapport
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
          <p className="text-sm text-[var(--color-muted)] mt-4">
            Je feedback wordt gebruikt om je aanbevelingen te verfijnen
          </p>
        </motion.div>
      )}

      {!allRated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          {feedbackCount > 0 && (
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Nog {outfits.length - feedbackCount} {outfits.length - feedbackCount === 1 ? 'outfit' : 'outfits'} te beoordelen
            </p>
          )}

          {/* Skip button - always visible */}
          <button
            onClick={handleContinue}
            disabled={applying}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {feedbackCount === 0 ? 'Overslaan en doorgaan' : 'Doorgaan zonder alle outfits te beoordelen'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
