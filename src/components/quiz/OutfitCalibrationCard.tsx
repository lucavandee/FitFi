import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus, RefreshCw, Heart, Sparkles, Briefcase, Coffee, Moon } from 'lucide-react';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';
import SmartImage from '@/components/ui/SmartImage';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import OutfitRemixerModal from '@/components/outfits/OutfitRemixerModal';
import type { AdaptiveOutfit } from '@/services/calibration/adaptiveOutfitGenerator';
import toast from 'react-hot-toast';

interface OutfitCalibrationCardProps {
  outfit: CalibrationOutfit;
  onFeedback: (feedback: 'spot_on' | 'not_for_me' | 'maybe', responseTimeMs: number) => void;
  onSwapItem?: (category: 'top' | 'bottom' | 'shoes') => Promise<void>;
  disabled?: boolean;
  swappingCategory?: 'top' | 'bottom' | 'shoes' | null;
}

export function OutfitCalibrationCard({ outfit, onFeedback, onSwapItem, disabled, swappingCategory }: OutfitCalibrationCardProps) {
  const [startTime] = useState(Date.now());
  const [selectedFeedback, setSelectedFeedback] = useState<'spot_on' | 'not_for_me' | 'maybe' | null>(null);
  const [showRemixer, setShowRemixer] = useState(false);
  const { saveOutfit, isSaving } = useSaveOutfit();

  const handleFeedback = (feedback: 'spot_on' | 'not_for_me' | 'maybe') => {
    if (disabled || selectedFeedback) return;

    const responseTime = Date.now() - startTime;
    setSelectedFeedback(feedback);
    onFeedback(feedback, responseTime);
  };

  const handleSaveOutfit = async () => {
    try {
      await saveOutfit({
        items: outfit.items,
        archetype: Object.keys(outfit.archetypes)[0] || 'minimal',
        occasion: outfit.occasion,
        colors: outfit.dominantColors
      });
      toast.success('Outfit opgeslagen! 💚', {
        duration: 3000,
        position: 'bottom-center'
      });
    } catch (err) {
      toast.error('Kon outfit niet opslaan');
    }
  };

  const totalPrice = Object.values(outfit.items)
    .filter(Boolean)
    .reduce((sum, item) => sum + (item?.price || 0), 0);

  const formattedTotal = Math.round(totalPrice);

  // Convert to AdaptiveOutfit format for remixer
  const adaptiveOutfit: AdaptiveOutfit = {
    id: outfit.id,
    products: Object.values(outfit.items).filter(Boolean).map(item => ({
      id: item!.id,
      name: item!.name,
      brand: item!.brand || '',
      price: item!.price,
      image_url: item!.image_url,
      category: item!.category,
      colors: item!.colors || [],
      affiliate_link: item!.affiliate_link || ''
    })),
    score: {
      style_match: 0.85,
      color_harmony: outfit.colorHarmony?.score ? outfit.colorHarmony.score / 100 : 0.80,
      price_optimization: 0.80,
      occasion_fit: 0.85,
      novelty: 0.75,
      overall: outfit.matchScore || 0.82
    },
    explanation: outfit.explanation || '',
    price_breakdown: {
      total: totalPrice,
      tier: totalPrice <= 200 ? 'budget' : totalPrice <= 400 ? 'mid' : 'premium',
      value_score: 0.85
    },
    visual_features: {
      dominant_colors: outfit.dominantColors || [],
      style_tags: Object.keys(outfit.archetypes || {}),
      formality_score: outfit.occasion === 'work' ? 6 : 3,
      pattern_complexity: 'moderate'
    },
    nova_insight: outfit.novaInsight
  };

  // Get occasion icon and colors
  const getOccasionDetails = () => {
    const occasion = outfit.occasion?.toLowerCase() || 'casual';
    const occasionMap: Record<string, { icon: React.ComponentType<any>; bgClass: string; borderClass: string; title: string; subtitle: string }> = {
      work: {
        icon: Briefcase,
        bgClass: 'bg-[var(--ff-color-primary-25)]',
        borderClass: 'border-[var(--ff-color-primary-200)]',
        title: 'Kantoor',
        subtitle: 'Zakelijke meeting of werkdag'
      },
      casual: {
        icon: Coffee,
        bgClass: 'bg-[var(--ff-color-primary-25)]',
        borderClass: 'border-[var(--ff-color-primary-200)]',
        title: 'Casual dag uit',
        subtitle: 'Lunch, koffie, boodschappen'
      },
      evening: {
        icon: Moon,
        bgClass: 'bg-[var(--ff-color-primary-50)]',
        borderClass: 'border-[var(--ff-color-primary-200)]',
        title: 'Avondje uit',
        subtitle: 'Restaurant, borrel of diner'
      }
    };
    return occasionMap[occasion] || occasionMap.casual;
  };

  const { icon: OccasionIcon, bgClass, borderClass, title, subtitle } = getOccasionDetails();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={`bg-[var(--color-surface)] border ${borderClass} rounded-2xl overflow-hidden transition-all duration-300`}
      style={{ boxShadow: '0 2px 12px rgba(74,56,40,0.08), 0 1px 3px rgba(74,56,40,0.06)' }}
    >
      {/* Header with Icon */}
      <div className={`${bgClass} px-4 py-4 border-b ${borderClass}`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
            <OccasionIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--color-text)]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-[var(--color-text)] mb-0.5 truncate">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text)]/70 truncate">
              {subtitle}
            </p>
          </div>
          <motion.button
            onClick={handleSaveOutfit}
            disabled={isSaving || disabled}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-white border-2 border-[var(--color-border)] flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0 shadow-sm"
            title="Bewaar outfit"
          >
            <Heart className="w-5 h-5 text-[var(--color-muted)] group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Product Images Grid */}
        <div className="relative bg-[var(--color-bg)] p-4">
          <div className="grid grid-cols-2 gap-3">
            {outfit.items.top && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="aspect-square bg-white rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
              >
                <SmartImage
                  src={outfit.items.top.image_url}
                  alt={outfit.items.top.name}
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
            {outfit.items.bottom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="aspect-square bg-white rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
              >
                <SmartImage
                  src={outfit.items.bottom.image_url}
                  alt={outfit.items.bottom.name}
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
            {outfit.items.shoes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 aspect-[2/1] bg-white rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
              >
                <SmartImage
                  src={outfit.items.shoes.image_url}
                  alt={outfit.items.shoes.name}
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
            {outfit.items.accessory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="col-span-2 aspect-[2/1] bg-white rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
              >
                <SmartImage
                  src={outfit.items.accessory.image_url}
                  alt={outfit.items.accessory.name}
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--color-muted)] mb-1">Totaalprijs</div>
              <div className="text-2xl font-bold text-[var(--color-text)]">
                €{formattedTotal}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {outfit.items.top && (
              <OutfitItem
                name={outfit.items.top.name}
                brand={outfit.items.top.brand}
                price={outfit.items.top.price}
                category="top"
                onSwap={onSwapItem}
                isSwapping={swappingCategory === 'top'}
                disabled={disabled || selectedFeedback !== null}
              />
            )}
            {outfit.items.bottom && (
              <OutfitItem
                name={outfit.items.bottom.name}
                brand={outfit.items.bottom.brand}
                price={outfit.items.bottom.price}
                category="bottom"
                onSwap={onSwapItem}
                isSwapping={swappingCategory === 'bottom'}
                disabled={disabled || selectedFeedback !== null}
              />
            )}
            {outfit.items.shoes && (
              <OutfitItem
                name={outfit.items.shoes.name}
                brand={outfit.items.shoes.brand}
                price={outfit.items.shoes.price}
                category="shoes"
                onSwap={onSwapItem}
                isSwapping={swappingCategory === 'shoes'}
                disabled={disabled || selectedFeedback !== null}
              />
            )}
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--ff-color-primary-700)] mb-2">
                Waarom dit bij je past:
              </p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">
                {outfit.explanation}
              </p>
            </div>

            {outfit.colorHarmony && outfit.colorHarmony.harmony !== 'acceptable' && (
              <div className="p-3 rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-100)]">
                <div className="flex items-start gap-2">
                  <div className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]">
                    {outfit.colorHarmony.score}/100
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text)] leading-relaxed">
                      {outfit.colorHarmony.explanation}
                    </p>
                    {outfit.colorHarmony.tips && outfit.colorHarmony.tips.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {outfit.colorHarmony.tips.map((tip, idx) => (
                          <li key={idx} className="text-xs text-[var(--color-muted)] flex items-start gap-1">
                            <span className="text-[var(--ff-color-primary-700)]">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => handleFeedback('spot_on')}
              disabled={disabled || selectedFeedback !== null}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              animate={
                selectedFeedback === 'spot_on'
                  ? { scale: [1, 1.08, 1], transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }
                  : {}
              }
              className={`w-full py-4 px-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2.5 relative overflow-hidden ${
                selectedFeedback === 'spot_on'
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:text-[var(--ff-color-primary-700)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={selectedFeedback === 'spot_on' ? { boxShadow: '0 4px 14px rgba(74,56,40,0.25)' } : {}}
            >
              <motion.div
                animate={
                  selectedFeedback === 'spot_on'
                    ? { rotate: [0, 360], transition: { duration: 0.5 } }
                    : {}
                }
              >
                <Check className="w-5 h-5" strokeWidth={3} />
              </motion.div>
              Spot on!
            </motion.button>

            <motion.button
              onClick={() => handleFeedback('maybe')}
              disabled={disabled || selectedFeedback !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={
                selectedFeedback === 'maybe'
                  ? { scale: [1, 1.05, 1], transition: { duration: 0.4 } }
                  : {}
              }
              className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'maybe'
                  ? 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] border border-[var(--ff-color-primary-200)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:text-[var(--ff-color-primary-600)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Minus className="w-4 h-4" strokeWidth={2.5} />
              Misschien
            </motion.button>

            <motion.button
              onClick={() => handleFeedback('not_for_me')}
              disabled={disabled || selectedFeedback !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={
                selectedFeedback === 'not_for_me'
                  ? { scale: [1, 1.05, 1], transition: { duration: 0.4 } }
                  : {}
              }
              className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'not_for_me'
                  ? 'bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-border)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              Lijkt me niks
            </motion.button>

            {/* Smart Remix Button */}
            <motion.button
              onClick={() => setShowRemixer(true)}
              disabled={disabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] border border-[var(--ff-color-primary-200)] hover:from-[var(--ff-color-primary-100)] hover:to-[var(--ff-color-primary-200)] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Smart Remix
            </motion.button>
          </div>
        </div>
      </div>

      {/* Remixer Modal */}
      <OutfitRemixerModal
        isOpen={showRemixer}
        onClose={() => setShowRemixer(false)}
        outfit={adaptiveOutfit}
        onOutfitUpdated={(remixed) => {
          // Optionally update the outfit display here
        }}
      />
    </motion.div>
  );
}

interface OutfitItemProps {
  name: string;
  brand: string;
  price: number;
  category?: 'top' | 'bottom' | 'shoes';
  onSwap?: (category: 'top' | 'bottom' | 'shoes') => Promise<void>;
  isSwapping?: boolean;
  disabled?: boolean;
}

function OutfitItem({ name, brand, price, category, onSwap, isSwapping, disabled }: OutfitItemProps) {
  const formattedPrice = Math.round(price * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-between gap-3 text-sm group"
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--color-text)] truncate">{name}</div>
        <div className="text-[var(--color-muted)] text-xs mt-0.5">{brand}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-[var(--color-text)] font-medium">€{formattedPrice.toFixed(2)}</div>
        {onSwap && category && (
          <motion.button
            onClick={() => !disabled && !isSwapping && onSwap(category)}
            disabled={disabled || isSwapping}
            whileHover={!disabled && !isSwapping ? { scale: 1.1 } : {}}
            whileTap={!disabled && !isSwapping ? { scale: 0.9 } : {}}
            className="w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-700)] transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            title="Vervang dit item"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSwapping ? 'animate-spin' : ''}`} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
