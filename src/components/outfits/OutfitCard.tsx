import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, X, CircleHelp as HelpCircle, Sparkles, ShoppingBag } from 'lucide-react';
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
      className="group relative rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-5 shadow-sm hover:shadow-[0_8px_32px_rgba(30,35,51,0.12)] transition-all focus-within:ring-2 focus-within:ring-[#C2654A] overflow-hidden"
      data-kind="outfit-card"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 20 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Subtle hover overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#FAF5F2' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Match score badge floating */}
      {outfit.matchPercentage && outfit.matchPercentage > 80 && (
        <motion.div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-md text-sm font-bold text-white"
          style={{ background: '#A8513A' }}
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

      <div className="relative rounded-xl overflow-hidden mb-4">
        <motion.div
          className="relative overflow-hidden rounded-xl aspect-[4/5] shadow-inner"
          style={{ background: '#FAF5F2' }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <LazyImage
            src={outfit.imageUrl}
            alt={outfit.title || 'Outfit'}
            className="w-full h-full"
            fallback="/images/fallbacks/default.jpg"
            onLoad={() => setLoaded(true)}
          />

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
            className="text-base font-semibold text-[#1A1A1A] leading-tight"
          >
            {outfit.title}
          </h3>
          <p
            id={descId}
            className="mt-1 text-sm text-[#8A8A8A] leading-relaxed"
          >
            {outfit.description}
          </p>
        </div>

        {/* Match Score + tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs font-medium text-[#1A1A1A] bg-[#FFFFFF]"
            role="status"
            aria-label={`Match: ${Math.round(outfit.matchPercentage || 75)} procent`}
          >
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          {outfit.currentSeasonLabel && (
            <span
              className="rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs text-[#8A8A8A] bg-[#FFFFFF]"
            >
              {outfit.currentSeasonLabel}
            </span>
          )}
          {outfit.dominantColorName && (
            <span
              className="rounded-full border border-[#E5E5E5] px-2.5 py-0.5 text-xs text-[#8A8A8A] bg-[#FFFFFF]"
            >
              {outfit.dominantColorName}
            </span>
          )}
          <RequireAuth cta="Inloggen voor uitleg">
            <button
              onClick={() => setShowExplanationModal(true)}
              className="flex items-center gap-1 text-xs text-[#A8513A] hover:text-[#C2654A] transition-colors ml-auto"
              aria-label="Waarom deze match?"
            >
              <HelpCircle size={13} />
              <span>Waarom?</span>
            </button>
          </RequireAuth>
        </div>

        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="mt-2 p-3 rounded-xl border border-[#F4E8E3]" style={{ background: '#FAF5F2' }}>
            <div className="flex items-start gap-2 mb-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#A8513A] flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-[#A8513A]">Nova's uitleg:</span>
            </div>
            <p className="text-xs text-[#1A1A1A] leading-relaxed">{explanation}</p>
            <button
              onClick={() => setShowExplanation(false)}
              className="mt-2 text-xs text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
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
            <div className="relative rounded-2xl shadow-2xl max-w-md w-full p-6" style={{ background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#1A1A1A]">Waarom deze match?</h3>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                  style={{ background: '#FAF5F2' }}
                >
                  <X size={15} className="text-[#A8513A]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: '#FAF5F2', border: '1px solid #F4E8E3' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#A8513A]" />
                    <span className="text-sm font-semibold text-[#A8513A]">Nova's analyse:</span>
                  </div>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">
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
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors hover:opacity-90"
                    style={{ background: '#A8513A' }}
                  >
                    Begrepen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.div
          className="mt-3 grid grid-cols-2 gap-2 relative z-10"
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
              className={`relative px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden ${
                saveOutfit.isSuccess || saved
                  ? 'text-white'
                  : 'text-[#A8513A] hover:bg-[#FAF5F2]'
              } ${saveOutfit.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                borderColor: '#C2654A',
                background: saveOutfit.isSuccess || saved ? '#A8513A' : undefined,
              }}
              whileHover={!saveOutfit.isPending ? { scale: 1.02, y: -1 } : {}}
              whileTap={!saveOutfit.isPending ? { scale: 0.97 } : {}}
            >
              <motion.div
                className="flex items-center justify-center gap-1.5"
                animate={saveOutfit.isSuccess || saved ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-4 h-4 ${saveOutfit.isSuccess || saved ? 'fill-current' : ''} ${saveOutfit.isPending ? 'animate-pulse' : ''}`} />
                <span>{saveOutfit.isSuccess ? 'Bewaard' : saveOutfit.isPending ? 'Bewaren…' : 'Bewaar'}</span>
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
              className={`px-4 py-2.5 border-2 border-[#E5E5E5] text-[#1A1A1A] hover:border-[#D4856E] hover:bg-[#FAF5F2] rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing.like ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.like ? { scale: 1.02, y: -1 } : {}}
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
              className={`px-4 py-2.5 border-2 border-[#E5E5E5] text-[#8A8A8A] hover:border-[#C24A4A] hover:text-[#C24A4A] rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing.dislike ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.dislike ? { scale: 1.02, y: -1 } : {}}
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
              className={`px-4 py-2.5 border-2 border-[#E5E5E5] text-[#8A8A8A] hover:border-[#D4856E] hover:text-[#A8513A] rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing.explain ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isProcessing.explain ? { scale: 1.02, y: -1 } : {}}
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
              className="col-span-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-white"
              style={{ borderColor: '#A8513A', background: '#A8513A' }}
              whileHover={{ scale: 1.02, y: -1 }}
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

      <div ref={explainRef} aria-hidden="true" className="sr-only" />

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