import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, X, HelpCircle, Sparkles, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { LazyImage } from '@/components/ui/LazyImage';
import RequireAuth from '@/components/auth/RequireAuth';
import { isSaved, toggleSave } from '../../services/engagement';
import { generateOutfitExplanation, generateNovaExplanation } from '@/engine/explainOutfit';
import { track } from '@/utils/telemetry';
import { useUser } from '@/context/UserContext';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import { buildAffiliateUrl, detectPartner } from '@/utils/deeplinks';
import { trackOutfitExplain } from '@/hooks/useABTesting';
import { useEffect, useRef } from 'react';
import { ColorHarmonyBadge } from '@/components/outfits/ColorHarmonyBadge';
import { calculateOutfitColorHarmony } from '@/engine/colorHarmony';
import { trackSave, trackLike, trackView } from '@/services/ml/interactionTrackingService';
import { recordOutfitFeedback } from '@/services/ml/adaptiveWeightService';
import { ShopItemsList } from '@/components/outfits/ShopItemsList';

interface Product {
  id: string;
  name: string;
  brand?: string;
  imageUrl: string;
  price?: number;
  currency?: string;
  retailer?: string;
  affiliateUrl?: string;
  productUrl?: string;
  category?: string;
  color?: string;
  colors?: string[];
}

interface OutfitCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage?: number;
    currentSeasonLabel?: string;
    dominantColorName?: string;
    archetype?: string;
    tags?: string[];
    products?: Product[];
  };
  onSave?: () => void;
  onDislike?: () => void;
  onMoreLikeThis?: () => void;
  onExplain?: (explanation: string) => void;
}

export default function OutfitCard({ 
  outfit, 
  onSave,
  onDislike,
  onMoreLikeThis,
  onExplain
}: OutfitCardProps) {
  const { user } = useUser();
  const saveOutfit = useSaveOutfit(user?.id);
  const titleId = `title-${outfit.id}`;
  const descId = `desc-${outfit.id}`;
  const [saved, setSaved] = useState<boolean>(isSaved(outfit.id));
  const [loaded, setLoaded] = React.useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState<{
    save: boolean;
    like: boolean;
    dislike: boolean;
    explain: boolean;
  }>({
    save: false,
    like: false,
    dislike: false,
    explain: false
  });

  const explainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackOutfitExplain(outfit.id);
          trackView(outfit.id, { source: 'outfit_card', archetype: outfit.archetype });
        }
      },
      { threshold: 0.5 }
    );

    if (explainRef.current) {
      observer.observe(explainRef.current);
    }

    return () => observer.disconnect();
  }, [outfit.id, outfit.archetype]);

  const harmonyScore = useMemo(() => {
    if (!outfit.products || outfit.products.length === 0) return 0;
    const colors = outfit.products.map(p => p.colors || []);
    return calculateOutfitColorHarmony(colors);
  }, [outfit.products]);

  const handleSave = async () => {
    if (isProcessing.save || saveOutfit.isPending) return;

    if (!user?.id) {
      track('save_click_unauth', { outfit_id: outfit.id });
      window.location.href = '/inloggen?returnTo=/feed';
      return;
    }

    trackSave(outfit.id, { source: 'outfit_card', archetype: outfit.archetype });

    // Record adaptive learning feedback
    await recordOutfitFeedback({
      user_id: user.id,
      outfit_id: outfit.id,
      liked: true,
      archetype: outfit.archetype || 'casual_chic',
      feedback_type: 'save'
    });

    // Use optimistic save hook with fallback to local storage
    try {
      saveOutfit.mutate({
        outfit: outfit as any,
        userId: user.id,
        idempotencyKey: `${user.id}:${outfit.id}`
      });
    } catch (error) {
      // Fallback to local storage
      const newSavedState = toggleSave(outfit.id);
      setSaved(newSavedState);
      toast.success(newSavedState ? 'Outfit bewaard!' : 'Outfit verwijderd uit favorieten');
    }

    // Track save action
    track('add_to_favorites', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype,
      action: 'add'
    });

    // Update local state optimistically
    setSaved(true);

    if (onSave) {
      onSave();
    }
  };

  const handleMoreLikeThis = async () => {
    if (isProcessing.like) return;

    setIsProcessing(prev => ({ ...prev, like: true }));

    trackLike(outfit.id, { source: 'outfit_card', archetype: outfit.archetype });

    // Record adaptive learning feedback
    if (user?.id) {
      await recordOutfitFeedback({
        user_id: user.id,
        outfit_id: outfit.id,
        liked: true,
        archetype: outfit.archetype || 'casual_chic',
        feedback_type: 'like'
      });
    }

    // Track similar request
    track('request_similar', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });

    toast.success('We leren van je voorkeur! 🎯');
    onMoreLikeThis?.();

    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, like: false }));
    }, 200);
  };

  const handleDislike = async () => {
    if (isProcessing.dislike) return;

    setIsProcessing(prev => ({ ...prev, dislike: true }));

    // Track dislike feedback
    track('feedback_dislike', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });

    // Record adaptive learning feedback
    if (user?.id) {
      await recordOutfitFeedback({
        user_id: user.id,
        outfit_id: outfit.id,
        liked: false,
        archetype: outfit.archetype || 'casual_chic',
        feedback_type: 'dislike'
      });
    }

    toast('We passen je aanbevelingen aan 🎨');
    onDislike?.();

    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, dislike: false }));
    }, 200);
  };

  const handleExplain = async () => {
    if (isProcessing.explain) return;
    
    setIsProcessing(prev => ({ ...prev, explain: true }));
    
    try {
      // Track explain request
      track('request_explanation', { 
        outfit_id: outfit.id,
        outfit_title: outfit.title,
        outfit_archetype: outfit.archetype
      });
      
      // Generate explanation using explainOutfit module
      const explanationText = generateOutfitExplanation(
        {
          id: outfit.id,
          title: outfit.title,
          description: outfit.description,
          archetype: outfit.archetype || 'casual_chic',
          occasion: 'Casual',
          products: [],
          imageUrl: outfit.imageUrl,
          tags: outfit.tags || [],
          matchPercentage: outfit.matchPercentage || 75,
          explanation: ''
        },
        outfit.archetype || 'casual_chic',
        'Casual'
      );
      
      setExplanation(explanationText);
      setShowExplanation(true);
      
      if (onExplain) {
        onExplain(explanationText);
      }
      
      // Track successful explanation
      track('explanation_generated', {
        outfit_id: outfit.id,
        explanation_length: explanationText.length
      });

      toast.success('Nova heeft deze outfit uitgelegd!');
    } catch (error) {
      console.error('Error explaining outfit:', error);
      
      // Track explanation failure
      track('explanation_failed', { 
        outfit_id: outfit.id,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error('Kon uitleg niet genereren');
    } finally {
      setTimeout(() => {
        setIsProcessing(prev => ({ ...prev, explain: false }));
      }, 200);
    }
  };

  const handleShopClick = () => {
    if (!outfit.products || outfit.products.length === 0) {
      toast('Geen items beschikbaar', {
        description: 'Dit outfit bevat nog geen shopbare items.',
        icon: '🛍️',
      });
      return;
    }

    const availableProducts = outfit.products.filter(
      (p) => p.affiliateUrl || p.productUrl
    );

    if (availableProducts.length === 0) {
      toast('Shopfunctie komt binnenkort beschikbaar', {
        description: 'Deze items zijn momenteel niet online beschikbaar.',
        icon: '⏳',
      });
      return;
    }

    track('shop_button_click', {
      outfit_id: outfit.id,
      product_count: outfit.products.length,
      available_count: availableProducts.length,
    });

    setShowShopModal(true);
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative rounded-3xl border-2 border-gray-200 bg-white p-5 shadow-lg hover:shadow-2xl transition-all focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden"
      data-kind="outfit-card"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      whileHover={{
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 20 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Match score badge floating */}
      {outfit.matchPercentage && outfit.matchPercentage > 80 && (
        <motion.div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg text-sm font-bold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{Math.round(outfit.matchPercentage)}%</span>
        </motion.div>
      )}

      {/* Color Harmony Badge */}
      {harmonyScore > 0.7 && (
        <div className="absolute top-3 left-3 z-10">
          <ColorHarmonyBadge harmonyScore={harmonyScore} compact />
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden mb-4">
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/5] shadow-inner"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <LazyImage
            src={outfit.imageUrl}
            alt={outfit.title || 'Outfit'}
            className="w-full h-full"
            fallback="/placeholder.png"
            onLoad={() => setLoaded(true)}
          />

          {/* Image overlay gradient on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3
            id={titleId}
            className="text-lg font-medium text-[var(--color-text)] leading-tight"
          >
            {outfit.title}
          </h3>
          <p 
            id={descId}
            className="mt-1 text-sm text-gray-600 leading-relaxed"
          >
            {outfit.description}
          </p>
        </div>
        
        {/* Match Score with Explanation Link */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span 
            className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
            role="status"
            aria-label={`Match percentage: ${Math.round(outfit.matchPercentage || 75)} procent`}
          >
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          
          <RequireAuth cta="Inloggen voor uitleg">
            <button
              onClick={() => setShowExplanationModal(true)}
              className="flex items-center space-x-1 text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
              aria-label="Waarom deze match?"
            >
              <HelpCircle size={14} />
              <span className="text-xs">Waarom deze match?</span>
            </button>
          </RequireAuth>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
          {outfit.currentSeasonLabel && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
              role="status"
              aria-label={`Seizoen: ${outfit.currentSeasonLabel}`}
            >
              {outfit.currentSeasonLabel}
            </span>
          )}
          {outfit.dominantColorName && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
              role="status"
              aria-label={`Dominante kleur: ${outfit.dominantColorName}`}
            >
              {outfit.dominantColorName}
            </span>
          )}
        </div>
        
        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="mt-3 p-3 bg-[var(--color-primary)]/10 rounded-xl border border-[var(--color-primary)]/20">
            <div className="flex items-start space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-[var(--color-primary)]">Nova's uitleg:</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
            <button
              onClick={() => setShowExplanation(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Verberg uitleg
            </button>
          </div>
        )}
        
        {/* Explanation Modal */}
        {showExplanationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExplanationModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Waarom deze match?</h3>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[var(--color-primary)]/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium text-[var(--color-primary)]">Nova's analyse:</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generateNovaExplanation(
                      {
                        id: outfit.id,
                        title: outfit.title,
                        description: outfit.description,
                        archetype: outfit.archetype || 'casual_chic',
                        occasion: 'Casual',
                        products: [],
                        imageUrl: outfit.imageUrl,
                        tags: outfit.tags || [],
                        matchPercentage: outfit.matchPercentage || 75,
                        explanation: ''
                      },
                      user ? {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        stylePreferences: {
                          casual: 3,
                          formal: 3,
                          sporty: 3,
                          vintage: 3,
                          minimalist: 3
                        }
                      } : undefined
                    )}
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowExplanationModal(false)}
                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-2xl hover:bg-[var(--color-primary)]/90 transition-colors"
                  >
                    Begrepen!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <motion.div
          className="mt-4 grid grid-cols-2 gap-2 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RequireAuth cta="Inloggen om te bewaren">
            <motion.button
              aria-label="Bewaar look"
              aria-busy={saveOutfit.isPending}
              title="Bewaar deze look"
              onClick={handleSave}
              disabled={saveOutfit.isPending}
              className={`relative px-4 py-2.5 border-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 overflow-hidden ${
                saveOutfit.isSuccess || saved
                  ? 'border-blue-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white focus:ring-blue-500/20 shadow-lg'
                  : 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500/20'
              } ${saveOutfit.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={!saveOutfit.isPending ? { scale: 1.03, y: -2 } : {}}
              whileTap={!saveOutfit.isPending ? { scale: 0.97 } : {}}
            >
              <motion.div
                className="flex items-center justify-center gap-1.5"
                animate={saveOutfit.isSuccess || saved ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-4 h-4 ${saveOutfit.isSuccess || saved ? 'fill-current' : ''} ${saveOutfit.isPending ? 'animate-pulse' : ''}`} />
                <span>{saveOutfit.isSuccess ? 'Bewaard ✓' : saveOutfit.isPending ? 'Bewaren…' : 'Bewaar'}</span>
              </motion.div>
            </motion.button>
          </RequireAuth>

          <RequireAuth cta="Inloggen voor meer looks">
            <motion.button
              aria-label="Meer zoals dit"
              aria-busy={isProcessing.like}
              title="Voeg vergelijkbare outfits toe aan je feed"
              onClick={handleMoreLikeThis}
              disabled={isProcessing.like}
              className={`px-4 py-2.5 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:ring-offset-2 ${
                isProcessing.like ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.like ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isProcessing.like ? { scale: 0.97 } : {}}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ThumbsUp className={`w-4 h-4 ${isProcessing.like ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Meer zoals dit</span>
                <span className="sm:hidden">Meer</span>
              </div>
            </motion.button>
          </RequireAuth>

          <RequireAuth cta="Inloggen voor feedback">
            <motion.button
              aria-label="Niet mijn stijl"
              aria-busy={isProcessing.dislike}
              title="Verberg dit type outfit uit je feed"
              onClick={handleDislike}
              disabled={isProcessing.dislike}
              className={`px-4 py-2.5 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2 ${
                isProcessing.dislike ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.dislike ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isProcessing.dislike ? { scale: 0.97 } : {}}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ThumbsDown className={`w-4 h-4 ${isProcessing.dislike ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Niet mijn stijl</span>
                <span className="sm:hidden">Niet</span>
              </div>
            </motion.button>
          </RequireAuth>

          <RequireAuth cta="Inloggen voor uitleg">
            <motion.button
              aria-label="Laat Nova dit outfit uitleggen"
              aria-busy={isProcessing.explain}
              title="Krijg Nova's uitleg waarom dit outfit bij je past"
              onClick={handleExplain}
              disabled={isProcessing.explain}
              className={`px-4 py-2.5 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:ring-offset-2 ${
                isProcessing.explain ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.explain ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isProcessing.explain ? { scale: 0.97 } : {}}
            >
              <div className="flex items-center justify-center gap-1.5">
                <MessageCircle className={`w-4 h-4 ${isProcessing.explain ? 'animate-pulse' : ''}`} />
                <span>{showExplanation ? 'Verberg' : 'Leg uit'}</span>
              </div>
            </motion.button>
          </RequireAuth>

          {/* Shop Button */}
          {outfit.products && outfit.products.length > 0 && (
            <motion.button
              aria-label="Shop deze look"
              title="Bekijk en shop alle items uit dit outfit"
              onClick={handleShopClick}
              className="col-span-2 px-4 py-2.5 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Shop deze look ({outfit.products.filter(p => p.affiliateUrl || p.productUrl).length}/{outfit.products.length})</span>
              </div>
            </motion.button>
          )}
        </motion.div>
      </div>
      
      <div ref={explainRef} className="explain text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <strong>Waarom dit werkt:</strong> de zachte taupe top kleurt warm bij je huidtint; de rechte pantalon verlengt je silhouet en houdt het minimal-chic.
      </div>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShopModal && outfit.products && (
          <ShopItemsList
            products={outfit.products}
            outfitId={outfit.id}
            isModal={true}
            onClose={() => setShowShopModal(false)}
            title={`Shop: ${outfit.title}`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}