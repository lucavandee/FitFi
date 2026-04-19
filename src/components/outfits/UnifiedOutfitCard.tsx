import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { LazyImage } from '@/components/ui/LazyImage';
import RequireAuth from '@/components/auth/RequireAuth';
import { isSaved, toggleSave } from '@/services/engagement';
import { track } from '@/utils/telemetry';
import { useUser } from '@/context/UserContext';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import { ColorHarmonyBadge } from '@/components/outfits/ColorHarmonyBadge';
import { calculateOutfitColorHarmony } from '@/engine/colorHarmony';
import { trackSave, trackView } from '@/services/ml/interactionTrackingService';
import { recordOutfitFeedback } from '@/services/ml/adaptiveWeightService';
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const explainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
    if (saveOutfit.isPending) return;

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


  // Theme-based styles
  const themeStyles = {
    light: {
      container: 'bg-[var(--color-surface)] border-[var(--color-border)]',
      text: 'text-[var(--color-text)]',
      textMuted: 'text-[var(--color-text)]/60',
      badge: 'bg-white border-gray-200'
    },
    dark: {
      container: 'bg-[#1E2433] border-white/10',
      text: 'text-white',
      textMuted: 'text-[#AAB0C0]',
      badge: 'bg-white/5 border-white/10'
    }
  };

  const currentTheme = themeStyles[theme];

  // Variant-specific styles
  const isPremium = variant === 'premium';
  const isCompact = variant === 'compact';

  return (
    <motion.div
      className={cn(
        'group relative rounded-2xl border-2 p-5 shadow-lg hover:shadow-2xl transition-all',
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
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(122,97,74,0.03) 0%, rgba(155,122,94,0.04) 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Match score badge */}
      {outfit.matchPercentage && outfit.matchPercentage > 80 && (
        <motion.div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-[var(--ff-color-primary-700)] text-white rounded-full text-xs font-bold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          style={{ boxShadow: '0 2px 8px rgba(74,56,40,0.3)' }}
        >
          <Sparkles className="w-3 h-3" />
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

          {/* Match Score */}
          <div className="flex items-center text-sm">
            <span
              className={cn("rounded-full border px-2 py-0.5", currentTheme.badge)}
              role="status"
              aria-label={`Match percentage: ${Math.round(outfit.matchPercentage || 75)} procent`}
            >
              Match {Math.round(outfit.matchPercentage || 75)}%
            </span>
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

          {/* Actions -- primary: details/shop, secondary: save */}
          <motion.div
            className="flex gap-2 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              aria-label="Bekijk outfit details en shop"
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 px-4 py-3 min-h-[48px] bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)] focus:ring-offset-2 hover:bg-[var(--ff-color-primary-600)]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Bekijk &amp; shop</span>
                {outfit.products && outfit.products.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                    {outfit.products.length}
                  </span>
                )}
              </div>
            </motion.button>

            <RequireAuth cta="Inloggen om te bewaren">
              <motion.button
                aria-label={saved || saveOutfit.isSuccess ? "Opgeslagen" : "Bewaar outfit"}
                aria-busy={saveOutfit.isPending}
                onClick={handleSave}
                disabled={saveOutfit.isPending}
                className={cn(
                  'w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center border rounded-xl transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ff-color-primary-400)]',
                  saveOutfit.isSuccess || saved
                    ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-700)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--ff-color-primary-300)] hover:text-[var(--ff-color-primary-700)]',
                  saveOutfit.isPending && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!saveOutfit.isPending ? { scale: 1.05 } : {}}
                whileTap={!saveOutfit.isPending ? { scale: 0.93 } : {}}
              >
                <Heart className={cn('w-5 h-5', (saveOutfit.isSuccess || saved) && 'fill-current', saveOutfit.isPending && 'animate-pulse')} />
              </motion.button>
            </RequireAuth>
          </motion.div>
        </div>
      </div>

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
