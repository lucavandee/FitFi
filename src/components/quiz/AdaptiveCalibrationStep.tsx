import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { adaptiveOutfitGenerator, type AdaptiveOutfit } from '@/services/calibration/adaptiveOutfitGenerator';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';
import type { Product } from '@/types/product';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

interface AdaptiveCalibrationStepProps {
  onComplete: () => void;
  quizAnswers: Record<string, any>;
}

export default function AdaptiveCalibrationStep({ onComplete, quizAnswers }: AdaptiveCalibrationStepProps) {
  const { user } = useUser();
  const [sessionId, setSessionId] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outfits, setOutfits] = useState<AdaptiveOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [explorationRate, setExplorationRate] = useState(0.3);

  useEffect(() => {
    initializeCalibration();
  }, []);

  const initializeCalibration = async () => {
    if (!user) return;

    try {
      // Start calibration session
      const { data: session, error: sessionError } = await supabase.rpc('start_calibration_session', {
        p_user_id: user.id
      });

      if (sessionError) throw sessionError;

      const newSessionId = session || `cal_${Date.now()}`;
      setSessionId(newSessionId);

      // Generate initial outfits
      await generateAdaptiveOutfits(newSessionId, 0);

      track('calibration:started', { session_id: newSessionId });
    } catch (error) {
      console.error('[AdaptiveCalibration] Init error:', error);
      toast.error('Kon calibratie niet starten');
    }
  };

  const generateAdaptiveOutfits = async (sessId: string, currentSwipeCount: number) => {
    setLoading(true);

    try {
      // Get swipe history for this session
      const { data: swipeHistory, error: swipeError } = await supabase
        .from('swipe_preferences')
        .select('*')
        .eq('session_id', sessId)
        .order('created_at', { ascending: false });

      if (swipeError) throw swipeError;

      // Calculate learned preferences
      const learned = calculateLearnedPreferences(swipeHistory || []);

      // Decrease exploration as confidence increases
      const newExplorationRate = Math.max(0.1, 0.3 - (currentSwipeCount * 0.02));
      setExplorationRate(newExplorationRate);

      // Generate adaptive outfits
      const context = {
        session_id: sessId,
        swipe_count: currentSwipeCount,
        exploration_rate: newExplorationRate,
        user_profile: {
          archetype: quizAnswers.archetype || 'Casual',
          colors: quizAnswers.colors || [],
          budget: quizAnswers.budget || 'medium',
          occasions: quizAnswers.occasions || ['casual', 'everyday']
        },
        swipe_history: learned
      };

      const generatedOutfits = await adaptiveOutfitGenerator.generateAdaptiveOutfits(context, 3);
      setOutfits(generatedOutfits);
      setCurrentIndex(0);

      track('calibration:outfits_generated', {
        session_id: sessId,
        count: generatedOutfits.length,
        exploration_rate: newExplorationRate
      });
    } catch (error) {
      console.error('[AdaptiveCalibration] Generation error:', error);
      toast.error('Fout bij genereren outfits');
    } finally {
      setLoading(false);
    }
  };

  const calculateLearnedPreferences = (swipeHistory: any[]) => {
    const liked = swipeHistory.filter(s => ['right', 'up'].includes(s.swipe_direction));
    const disliked = swipeHistory.filter(s => ['left', 'down'].includes(s.swipe_direction));

    const likedColors = [...new Set(liked.flatMap(s => s.outfit_features?.colors || []))];
    const dislikedColors = [...new Set(disliked.flatMap(s => s.outfit_features?.colors || []))];
    const likedStyles = [...new Set(liked.flatMap(s => s.outfit_features?.styles || []))];
    const dislikedStyles = [...new Set(disliked.flatMap(s => s.outfit_features?.styles || []))];

    const prices = liked.map(s => s.outfit_features?.total_price || 0).filter(p => p > 0);
    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          preferred_avg: prices.reduce((a, b) => a + b, 0) / prices.length
        }
      : { min: 0, max: 1000, preferred_avg: 300 };

    const formalityScores = liked.map(s => s.outfit_features?.formality_score || 5);
    const formalityPreference = formalityScores.length > 0
      ? formalityScores.reduce((a, b) => a + b, 0) / formalityScores.length
      : 5;

    return {
      liked_colors: likedColors,
      disliked_colors: dislikedColors,
      liked_styles: likedStyles,
      disliked_styles: dislikedStyles,
      price_range: priceRange,
      formality_preference: formalityPreference,
      pattern_preference: 'mixed' as const
    };
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!sessionId || currentIndex >= outfits.length) return;

    const currentOutfit = outfits[currentIndex];

    try {
      // Record swipe in database
      const { error } = await supabase.rpc('record_swipe', {
        p_session_id: sessionId,
        p_user_id: user?.id,
        p_outfit_id: currentOutfit.id,
        p_swipe_direction: direction,
        p_outfit_features: {
          colors: currentOutfit.visual_features.dominant_colors,
          styles: currentOutfit.visual_features.style_tags,
          total_price: currentOutfit.price_breakdown.total,
          formality_score: currentOutfit.visual_features.formality_score,
          price_tier: currentOutfit.price_breakdown.tier
        }
      });

      if (error) throw error;

      const newSwipeCount = swipeCount + 1;
      setSwipeCount(newSwipeCount);

      track('calibration:swipe', {
        session_id: sessionId,
        direction,
        outfit_id: currentOutfit.id,
        swipe_count: newSwipeCount
      });

      // Show feedback
      if (direction === 'right') {
        toast.success(currentOutfit.nova_insight || 'Swipe opgeslagen!', {
          icon: '✨',
          duration: 2000
        });
      }

      // Move to next outfit or regenerate
      if (currentIndex < outfits.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // After 3 swipes, regenerate with learned preferences
        if (newSwipeCount >= 3 && newSwipeCount % 3 === 0) {
          await generateAdaptiveOutfits(sessionId, newSwipeCount);
        } else {
          // Calibration complete after 9+ swipes
          if (newSwipeCount >= 9) {
            track('calibration:completed', {
              session_id: sessionId,
              total_swipes: newSwipeCount
            });
            toast.success('Calibratie voltooid!', { icon: '🎉' });
            onComplete();
          } else {
            setCurrentIndex(currentIndex + 1);
          }
        }
      }
    } catch (error) {
      console.error('[AdaptiveCalibration] Swipe error:', error);
      toast.error('Kon swipe niet opslaan');
    }
  };

  if (loading && outfits.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text)] font-medium">Genereer je perfecte outfits...</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Onze AI leert jouw stijl kennen
          </p>
        </div>
      </div>
    );
  }

  const currentOutfit = outfits[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8">
      <div className="ff-container max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                Stijl Calibratie
              </h2>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Swipe om je voorkeuren te verfijnen
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <Sparkles size={18} className="text-[var(--ff-color-primary-700)]" />
              <span className="font-bold text-[var(--color-text)]">{swipeCount}</span>
              <span className="text-sm text-[var(--color-text-secondary)]">/ 9 swipes</span>
            </div>
          </div>

          <div className="w-full bg-[var(--color-bg-subtle)] rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)]"
              initial={{ width: 0 }}
              animate={{ width: `${(swipeCount / 9) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {explorationRate < 0.2 && swipeCount > 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-3 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-[var(--radius-lg)]"
            >
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-[var(--ff-color-primary-700)] mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Leerproces actief</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    We verfijnen outfits op basis van je swipes. Outfits worden persoonlijker!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {currentOutfit && (
            <motion.div
              key={currentOutfit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-soft)]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {currentOutfit.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1 text-xs font-semibold bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--color-text)]">
                      €{currentOutfit.price_breakdown.total}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {currentOutfit.price_breakdown.tier}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {currentOutfit.products.map((product, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-subtle)]">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-xs font-medium truncate">{product.name}</p>
                        <p className="text-white/80 text-xs">€{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-[var(--color-text)] mb-4">{currentOutfit.explanation}</p>

                  {currentOutfit.nova_insight && (
                    <div className="flex items-start gap-3 p-4 bg-[var(--ff-color-primary-50)] rounded-[var(--radius-lg)]">
                      <Sparkles size={18} className="text-[var(--ff-color-primary-700)] mt-0.5" />
                      <p className="text-sm text-[var(--color-text)]">
                        {currentOutfit.nova_insight}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-3 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {Math.round(currentOutfit.score.style_match * 100)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Stijl</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {Math.round(currentOutfit.score.color_harmony * 100)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Kleur</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {Math.round(currentOutfit.score.price_optimization * 100)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Prijs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">
                      {Math.round(currentOutfit.score.occasion_fit * 100)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Occasion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--ff-color-primary-700)]">
                      {Math.round(currentOutfit.score.overall * 100)}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Overall</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] hover:border-red-400 hover:bg-red-50 transition-colors"
                  >
                    <X size={24} className="text-red-500" />
                    <span className="font-semibold text-[var(--color-text)]">Niet mijn stijl</span>
                  </button>
                  <button
                    onClick={() => handleSwipe('right')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] rounded-[var(--radius-lg)] hover:scale-105 transition-transform text-white shadow-lg"
                  >
                    <Heart size={24} />
                    <span className="font-semibold">Love it!</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
