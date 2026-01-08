import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  X,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LazyImage } from '@/components/ui/LazyImage';
import RequireAuth from '@/components/auth/RequireAuth';
import { isSaved, toggleSave } from '@/services/engagement';
import { generateOutfitExplanation, generateNovaExplanation } from '@/engine/explainOutfit';
import { track } from '@/utils/telemetry';
import { useUser } from '@/context/UserContext';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import { trackOutfitExplain } from '@/hooks/useABTesting';
import { ColorHarmonyBadge } from '@/components/outfits/ColorHarmonyBadge';
import { calculateOutfitColorHarmony } from '@/engine/colorHarmony';
import { trackSave, trackLike, trackView } from '@/services/ml/interactionTrackingService';
import { recordOutfitFeedback } from '@/services/ml/adaptiveWeightService';
import { ShopItemsList } from '@/components/outfits/ShopItemsList';
import OutfitDetailsModal from '@/components/outfits/OutfitDetailsModal';
import { cn } from '@/utils/cn';

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

export type UnifiedOutfitCardVariant = 'default' | 'pro' | 'premium' | 'compact';
export type UnifiedOutfitCardLayout = 'vertical' | 'horizontal';
export type UnifiedOutfitCardTheme = 'light' | 'dark';

interface UnifiedOutfitCardProps {
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
    occasion?: string;
    totalPrice?: number;
    explanation?: string;
  };
  variant?: UnifiedOutfitCardVariant;
  layout?: UnifiedOutfitCardLayout;
  theme?: UnifiedOutfitCardTheme;
  onSave?: () => void;
  onDislike?: () => void;
  onMoreLikeThis?: () => void;
  onExplain?: (explanation: string) => void;
  onShare?: () => void;
  className?: string;
}

export default function UnifiedOutfitCard({
  outfit,
  variant = 'default',
  layout = 'vertical',
  theme = 'light',
  onSave,
  onDislike,
  onMoreLikeThis,
  onExplain,
  onShare,
  className = ''
}: UnifiedOutfitCardProps) {
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
  const [isHovered, setIsHovered] = useState(false);
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

    await recordOutfitFeedback({
      user_id: user.id,
      outfit_id: outfit.id,
      liked: true,
      archetype: outfit.archetype || 'casual_chic',
      feedback_type: 'save'
    });

    try {
      saveOutfit.mutate({
        outfit: outfit as any,
        userId: user.id,
        idempotencyKey: `${user.id}:${outfit.id}`
      });
    } catch (error) {
      const newSavedState = toggleSave(outfit.id);
      setSaved(newSavedState);
      toast.success(newSavedState ? 'Outfit bewaard!' : 'Outfit verwijderd uit favorieten');
    }

    track('add_to_favorites', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype,
      action: 'add'
    });

    setSaved(true);
    if (onSave) onSave();
  };

  const handleMoreLikeThis = async () => {
    if (isProcessing.like) return;
    setIsProcessing(prev => ({ ...prev, like: true }));

    trackLike(outfit.id, { source: 'outfit_card', archetype: outfit.archetype });

    if (user?.id) {
      await recordOutfitFeedback({
        user_id: user.id,
        outfit_id: outfit.id,
        liked: true,
        archetype: outfit.archetype || 'casual_chic',
        feedback_type: 'like'
      });
    }

    track('request_similar', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });

    toast.success('We leren van je voorkeur!');
    onMoreLikeThis?.();

    setTimeout(() => setIsProcessing(prev => ({ ...prev, like: false })), 200);
  };

  const handleDislike = async () => {
    if (isProcessing.dislike) return;
    setIsProcessing(prev => ({ ...prev, dislike: true }));

    track('feedback_dislike', {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });

    if (user?.id) {
      await recordOutfitFeedback({
        user_id: user.id,
        outfit_id: outfit.id,
        liked: false,
        archetype: outfit.archetype || 'casual_chic',
        feedback_type: 'dislike'
      });
    }

    toast('We passen je aanbevelingen aan');
    onDislike?.();

    setTimeout(() => setIsProcessing(prev => ({ ...prev, dislike: false })), 200);
  };

  const handleExplain = async () => {
    if (isProcessing.explain) return;
    setIsProcessing(prev => ({ ...prev, explain: true }));

    try {
      track('request_explanation', {
        outfit_id: outfit.id,
        outfit_title: outfit.title,
        outfit_archetype: outfit.archetype
      });

      const explanationText = generateOutfitExplanation(
        {
          id: outfit.id,
          title: outfit.title,
          description: outfit.description,
          archetype: outfit.archetype || 'casual_chic',
          occasion: outfit.occasion || 'Casual',
          products: [],
          imageUrl: outfit.imageUrl,
          tags: outfit.tags || [],
          matchPercentage: outfit.matchPercentage || 75,
          explanation: ''
        },
        outfit.archetype || 'casual_chic',
        outfit.occasion || 'Casual'
      );

      setExplanation(explanationText);
      setShowExplanation(true);

      if (onExplain) onExplain(explanationText);

      track('explanation_generated', {
        outfit_id: outfit.id,
        explanation_length: explanationText.length
      });

      toast.success('Nova heeft deze outfit uitgelegd!');
    } catch (error) {
      console.error('Error explaining outfit:', error);
      track('explanation_failed', {
        outfit_id: outfit.id,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Kon uitleg niet genereren');
    } finally {
      setTimeout(() => setIsProcessing(prev => ({ ...prev, explain: false })), 200);
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

    const availableProducts = outfit.products.filter(p => p.affiliateUrl || p.productUrl);

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

  // Theme-based styles
  const themeStyles = {
    light: {
      container: 'bg-[var(--color-surface)] border-[var(--color-border)]',
      text: 'text-[var(--color-text)]',
      textMuted: 'text-[var(--color-text)]/60',
      badge: 'bg-white border-gray-200',
      explanation: 'bg-[var(--ff-color-primary-50)] border-[var(--ff-color-primary-200)]'
    },
    dark: {
      container: 'bg-[#1E2433] border-white/10',
      text: 'text-white',
      textMuted: 'text-[#AAB0C0]',
      badge: 'bg-white/5 border-white/10',
      explanation: 'bg-white/5 border-white/10'
    }
  };

  const currentTheme = themeStyles[theme];

  // Variant-specific styles
  const isPremium = variant === 'premium';
  const isCompact = variant === 'compact';

  return (
    <motion.div
      className={cn(
        'group relative rounded-3xl border-2 p-5 shadow-lg hover:shadow-2xl transition-all',
        'focus-within:ring-4 focus-within:ring-[var(--shadow-ring)] focus-within:border-[var(--color-primary)]',
        'overflow-hidden',
        currentTheme.container,
        isCompact && 'p-3 rounded-2xl',
        className
      )}
      data-kind="unified-outfit-card"
      data-variant={variant}
      data-layout={layout}
      data-theme={theme}
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

      {/* Match score badge */}
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

      {/* Main Content - Layout based on prop */}
      <div className={cn(
        layout === 'horizontal' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'
      )}>
        {/* Image Section */}
        <div className="relative rounded-2xl overflow-hidden">
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

          {/* Products Grid (for horizontal layout or premium variant) */}
          {(layout === 'horizontal' || isPremium) && outfit.products && outfit.products.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {outfit.products.slice(0, 4).map((product) => (
                <div key={product.id} className="relative group/item">
                  <div className={cn(
                    "aspect-square rounded-xl overflow-hidden",
                    currentTheme.badge
                  )}>
                    <LazyImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      fallback="/placeholder.png"
                    />
                  </div>
                  <div className="mt-1">
                    <div className={cn("text-xs font-medium truncate", currentTheme.text)}>
                      {product.name}
                    </div>
                    <div className={cn("text-xs truncate", currentTheme.textMuted)}>
                      {product.brand} {product.price && `• €${product.price}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-3">
          <div>
            <h3
              id={titleId}
              className={cn("text-lg font-medium leading-tight", currentTheme.text)}
            >
              {outfit.title}
            </h3>
            <p
              id={descId}
              className={cn("mt-1 text-sm leading-relaxed", currentTheme.textMuted)}
            >
              {outfit.description}
            </p>
          </div>

          {/* Match Score with Explanation Link */}
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn("rounded-full border px-2 py-0.5", currentTheme.badge)}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-sm">
            {outfit.currentSeasonLabel && (
              <span className={cn("rounded-full border px-2 py-0.5", currentTheme.badge)}>
                {outfit.currentSeasonLabel}
              </span>
            )}
            {outfit.dominantColorName && (
              <span className={cn("rounded-full border px-2 py-0.5", currentTheme.badge)}>
                {outfit.dominantColorName}
              </span>
            )}
            {outfit.occasion && (
              <span className={cn("rounded-full border px-2 py-0.5", currentTheme.badge)}>
                {outfit.occasion}
              </span>
            )}
          </div>

          {/* Explanation */}
          {showExplanation && explanation && (
            <div className={cn("p-3 rounded-xl border", currentTheme.explanation)}>
              <div className="flex items-start space-x-2 mb-2">
                <MessageCircle className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-[var(--color-primary)]">Nova's uitleg:</span>
              </div>
              <p className={cn("text-sm leading-relaxed", currentTheme.text)}>{explanation}</p>
              <button
                onClick={() => setShowExplanation(false)}
                className={cn("mt-2 text-xs hover:opacity-80 transition-opacity", currentTheme.textMuted)}
              >
                Verberg uitleg
              </button>
            </div>
          )}

          {/* Actions */}
          <motion.div
            className="grid grid-cols-2 gap-2 relative z-10"
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
                className={cn(
                  'relative px-4 py-2.5 border-2 rounded-xl text-sm font-bold transition-all',
                  'focus:outline-none focus:ring-4 focus:ring-offset-2 overflow-hidden',
                  saveOutfit.isSuccess || saved
                    ? 'border-blue-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white focus:ring-blue-500/20 shadow-lg'
                    : 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500/20',
                  saveOutfit.isPending && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!saveOutfit.isPending ? { scale: 1.03, y: -2 } : {}}
                whileTap={!saveOutfit.isPending ? { scale: 0.97 } : {}}
              >
                <motion.div
                  className="flex items-center justify-center gap-1.5"
                  animate={saveOutfit.isSuccess || saved ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn('w-4 h-4', (saveOutfit.isSuccess || saved) && 'fill-current', saveOutfit.isPending && 'animate-pulse')} />
                  <span>{saveOutfit.isSuccess ? 'Bewaard ✓' : saveOutfit.isPending ? 'Bewaren…' : 'Bewaar'}</span>
                </motion.div>
              </motion.button>
            </RequireAuth>

            <RequireAuth cta="Inloggen voor meer looks">
              <motion.button
                aria-label="Meer zoals dit"
                aria-busy={isProcessing.like}
                onClick={handleMoreLikeThis}
                disabled={isProcessing.like}
                className={cn(
                  'px-4 py-2.5 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl text-sm font-bold',
                  'transition-all focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:ring-offset-2',
                  isProcessing.like && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!isProcessing.like ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isProcessing.like ? { scale: 0.97 } : {}}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <ThumbsUp className={cn('w-4 h-4', isProcessing.like && 'animate-pulse')} />
                  <span className="hidden sm:inline">Meer zoals dit</span>
                  <span className="sm:hidden">Meer</span>
                </div>
              </motion.button>
            </RequireAuth>

            <RequireAuth cta="Inloggen voor feedback">
              <motion.button
                aria-label="Niet mijn stijl"
                aria-busy={isProcessing.dislike}
                onClick={handleDislike}
                disabled={isProcessing.dislike}
                className={cn(
                  'px-4 py-2.5 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold',
                  'transition-all focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2',
                  isProcessing.dislike && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!isProcessing.dislike ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isProcessing.dislike ? { scale: 0.97 } : {}}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <ThumbsDown className={cn('w-4 h-4', isProcessing.dislike && 'animate-pulse')} />
                  <span className="hidden sm:inline">Niet mijn stijl</span>
                  <span className="sm:hidden">Niet</span>
                </div>
              </motion.button>
            </RequireAuth>

            <RequireAuth cta="Inloggen voor uitleg">
              <motion.button
                aria-label="Laat Nova dit outfit uitleggen"
                aria-busy={isProcessing.explain}
                onClick={handleExplain}
                disabled={isProcessing.explain}
                className={cn(
                  'px-4 py-2.5 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-xl text-sm font-bold',
                  'transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:ring-offset-2',
                  isProcessing.explain && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!isProcessing.explain ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isProcessing.explain ? { scale: 0.97 } : {}}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <MessageCircle className={cn('w-4 h-4', isProcessing.explain && 'animate-pulse')} />
                  <span>{showExplanation ? 'Verberg' : 'Leg uit'}</span>
                </div>
              </motion.button>
            </RequireAuth>

            {/* Details Button - Primary CTA */}
            <motion.button
              aria-label="Bekijk alle details"
              title="Bekijk volledige outfit details met alle items"
              onClick={() => setShowDetailsModal(true)}
              className="col-span-2 px-4 py-2.5 border-2 border-[var(--color-primary)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:ring-offset-2 hover:shadow-lg"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                <span>Bekijk alle details</span>
                {outfit.products && outfit.products.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {outfit.products.length} items
                  </span>
                )}
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {showExplanationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExplanationModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
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
                <div className="bg-[var(--ff-color-primary-50)] rounded-2xl p-4">
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
                        occasion: outfit.occasion || 'Casual',
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shop Modal (legacy) */}
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

      {/* Outfit Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <OutfitDetailsModal
            outfit={outfit}
            onClose={() => setShowDetailsModal(false)}
            onShopProduct={(product) => {
              track('shop_product_from_details', {
                outfit_id: outfit.id,
                product_id: product.id,
                product_name: product.name
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Hidden ref for tracking */}
      <div ref={explainRef} className="sr-only" aria-hidden="true" />
    </motion.div>
  );
}
