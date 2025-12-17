import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, TrendingUp, TrendingDown, RefreshCw, CheckCircle } from 'lucide-react';
import { AdaptiveOutfitRemixer, type RemixedOutfit, type SwapSuggestion } from '@/services/outfits/adaptiveOutfitRemixer';
import type { AdaptiveOutfit } from '@/services/calibration/adaptiveOutfitGenerator';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';

interface OutfitRemixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: AdaptiveOutfit;
  onOutfitUpdated?: (remixedOutfit: RemixedOutfit) => void;
}

export default function OutfitRemixerModal({
  isOpen,
  onClose,
  outfit,
  onOutfitUpdated
}: OutfitRemixerModalProps) {
  const { user } = useUser();
  const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SwapSuggestion | null>(null);
  const [currentOutfit, setCurrentOutfit] = useState(outfit);
  const [swapHistory, setSwapHistory] = useState<RemixedOutfit['swap_history']>([]);

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen, currentOutfit]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const sug = await AdaptiveOutfitRemixer.getSuggestedSwaps(
        currentOutfit,
        {
          archetype: 'Casual', // TODO: Get from user profile
          budget: 'medium'
        },
        3
      );
      setSuggestions(sug);
    } catch (error) {
      console.error('[OutfitRemixer] Error loading suggestions:', error);
      toast.error('Kon geen suggesties laden');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (suggestion: SwapSuggestion) => {
    setSwapping(true);
    setSelectedSuggestion(suggestion);

    try {
      const sessionId = sessionStorage.getItem('fitfi_session_id');

      const remixed = await AdaptiveOutfitRemixer.swapItem(
        currentOutfit,
        suggestion.category,
        suggestion.suggested_product,
        user?.id,
        sessionId || undefined
      );

      // Update current outfit
      const updatedOutfit: AdaptiveOutfit = {
        ...currentOutfit,
        products: remixed.products,
        score: remixed.score
      };

      setCurrentOutfit(updatedOutfit);
      setSwapHistory([...swapHistory, ...remixed.swap_history]);

      // Show Nova insight
      toast.success(remixed.nova_insight, {
        duration: 4000,
        icon: remixed.score_delta > 0 ? '✨' : '💭'
      });

      // Notify parent
      if (onOutfitUpdated) {
        onOutfitUpdated(remixed);
      }

      // Reload suggestions after swap
      setTimeout(() => {
        loadSuggestions();
      }, 500);
    } catch (error) {
      console.error('[OutfitRemixer] Error swapping item:', error);
      toast.error('Kon item niet swappen');
    } finally {
      setSwapping(false);
      setSelectedSuggestion(null);
    }
  };

  const handleOptimize = async () => {
    setSwapping(true);

    try {
      const optimized = await AdaptiveOutfitRemixer.optimizeOutfit(currentOutfit, 3);

      // Update current outfit
      const updatedOutfit: AdaptiveOutfit = {
        ...currentOutfit,
        products: optimized.products,
        score: optimized.score
      };

      setCurrentOutfit(updatedOutfit);
      setSwapHistory([...swapHistory, ...optimized.swap_history]);

      toast.success(optimized.nova_insight, {
        duration: 4000,
        icon: '🚀'
      });

      if (onOutfitUpdated) {
        onOutfitUpdated(optimized);
      }

      loadSuggestions();
    } catch (error) {
      console.error('[OutfitRemixer] Error optimizing outfit:', error);
      toast.error('Kon outfit niet optimaliseren');
    } finally {
      setSwapping(false);
    }
  };

  const totalScoreChange = swapHistory.reduce(
    (sum, swap) => sum + (swap.score_after - swap.score_before),
    0
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-lg)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <RefreshCw size={24} className="text-[var(--ff-color-primary-700)]" />
                Outfit Remixer
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Swap items om je outfit te perfectioneren
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-subtle)] rounded-[var(--radius-lg)] transition-colors"
            >
              <X size={24} className="text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Current Outfit Stats */}
            <div className="bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-100)] border border-[var(--ff-color-primary-200)] rounded-[var(--radius-xl)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ff-color-primary-700)] mb-1">
                    Huidige Score
                  </p>
                  <p className="text-3xl font-bold text-[var(--color-text)]">
                    {Math.round(currentOutfit.score.overall * 100)}
                    <span className="text-lg text-[var(--color-text-secondary)]">/100</span>
                  </p>
                </div>

                {swapHistory.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--ff-color-primary-700)] mb-1">
                      Verbetering
                    </p>
                    <div className="flex items-center gap-2">
                      {totalScoreChange > 0 ? (
                        <>
                          <TrendingUp size={20} className="text-green-600" />
                          <p className="text-2xl font-bold text-green-600">
                            +{Math.round(totalScoreChange * 100)}
                          </p>
                        </>
                      ) : totalScoreChange < 0 ? (
                        <>
                          <TrendingDown size={20} className="text-red-600" />
                          <p className="text-2xl font-bold text-red-600">
                            {Math.round(totalScoreChange * 100)}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-[var(--color-text-muted)]">±0</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {swapHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--ff-color-primary-200)]">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {swapHistory.length} {swapHistory.length === 1 ? 'swap' : 'swaps'} gedaan in deze sessie
                  </p>
                </div>
              )}
            </div>

            {/* Current Outfit Preview */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                Huidige Outfit
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {currentOutfit.products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-white/80 text-xs">€{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--ff-color-primary-700)]" />
                  Aanbevolen Swaps
                </h3>
                <button
                  onClick={handleOptimize}
                  disabled={swapping || loading || suggestions.length === 0}
                  className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Auto-optimaliseren
                </button>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--ff-color-primary-700)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    Suggesties laden...
                  </p>
                </div>
              )}

              {!loading && suggestions.length === 0 && (
                <div className="text-center py-8 bg-[var(--color-bg-subtle)] rounded-[var(--radius-xl)]">
                  <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-[var(--color-text)]">
                    Outfit is geoptimaliseerd!
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Geen significante verbeteringen meer mogelijk
                  </p>
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={`${suggestion.category}-${suggestion.suggested_product.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 hover:border-[var(--ff-color-primary-300)] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-[var(--radius-lg)] overflow-hidden bg-white flex-shrink-0">
                          <img
                            src={suggestion.suggested_product.image_url}
                            alt={suggestion.suggested_product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--ff-color-primary-700)] uppercase mb-1">
                                {suggestion.category}
                              </p>
                              <p className="font-semibold text-[var(--color-text)] truncate">
                                {suggestion.suggested_product.name}
                              </p>
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                €{suggestion.suggested_product.price}
                              </p>
                            </div>

                            {/* Score Improvement */}
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <TrendingUp size={16} className="text-green-600" />
                                <span className="text-lg font-bold text-green-600">
                                  +{Math.round(suggestion.expected_score_improvement * 100)}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                score
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                            {suggestion.reason}
                          </p>

                          <button
                            onClick={() => handleSwap(suggestion)}
                            disabled={swapping}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                          >
                            {swapping && selectedSuggestion === suggestion ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Swappen...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={16} />
                                Swap dit item
                                <ArrowRight size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Swaps worden opgeslagen om je toekomstige aanbevelingen te verbeteren
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] hover:bg-[var(--color-bg-subtle)] transition-colors font-semibold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
