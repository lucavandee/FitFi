import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus, RefreshCw, Heart, Sparkles } from 'lucide-react';
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
      console.error(err);
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300"
    >
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
        <div className="relative aspect-[4/5] md:aspect-auto bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]">
          <div className="absolute inset-0 grid grid-cols-2 gap-3 p-4 sm:p-6">
            {outfit.items.top && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="aspect-square bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-lg ring-1 ring-black/5"
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
                className="aspect-square bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-lg ring-1 ring-black/5"
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
                className="col-span-2 aspect-[2/1] bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-lg ring-1 ring-black/5"
              >
                <SmartImage
                  src={outfit.items.shoes.image_url}
                  alt={outfit.items.shoes.name}
                  className="w-full h-full object-contain p-2"
                />
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {outfit.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    {outfit.occasion === 'work' ? 'Perfect voor werk' : 'Casual daily look'}
                  </p>
                </div>
                <motion.button
                  onClick={handleSaveOutfit}
                  disabled={isSaving || disabled}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-white border-2 border-[var(--color-border)] flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0"
                  title="Bewaar outfit"
                >
                  <Heart className="w-4 h-4 text-[var(--color-muted)] group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
                </motion.button>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm text-[var(--color-muted)]">Totaal</div>
              <div className="text-lg font-semibold text-[var(--color-text)]">
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
              <div className={`p-3 rounded-[var(--radius-lg)] ${
                outfit.colorHarmony.harmony === 'excellent' ? 'bg-green-50 border border-green-200' :
                outfit.colorHarmony.harmony === 'good' ? 'bg-blue-50 border border-blue-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    outfit.colorHarmony.harmony === 'excellent' ? 'bg-green-200 text-green-800' :
                    outfit.colorHarmony.harmony === 'good' ? 'bg-blue-200 text-blue-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
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
              className={`w-full py-4 px-4 rounded-[var(--radius-xl)] font-semibold transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                selectedFeedback === 'spot_on'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl shadow-green-500/30'
                  : 'bg-white text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-green-500 hover:text-green-600 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <motion.div
                animate={
                  selectedFeedback === 'spot_on'
                    ? { rotate: [0, 360], transition: { duration: 0.5 } }
                    : {}
                }
              >
                <Check className="w-5 h-5" />
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
              className={`w-full py-3 px-4 rounded-[var(--radius-xl)] font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'maybe'
                  ? 'bg-[var(--ff-color-primary-600)] text-white shadow-lg'
                  : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-600)] hover:shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Minus className="w-4 h-4" />
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
              className={`w-full py-3 px-4 rounded-[var(--radius-xl)] font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'not_for_me'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:border-red-500 hover:text-red-600 hover:shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="w-4 h-4" />
              Lijkt me niks
            </motion.button>

            {/* Smart Remix Button */}
            <motion.button
              onClick={() => setShowRemixer(true)}
              disabled={disabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-[var(--radius-xl)] font-medium transition-all flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] border border-[var(--ff-color-primary-200)] hover:from-[var(--ff-color-primary-100)] hover:to-[var(--ff-color-primary-200)] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          console.log('Outfit remixed:', remixed);
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
