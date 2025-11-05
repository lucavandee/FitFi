import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';

interface OutfitCalibrationCardProps {
  outfit: CalibrationOutfit;
  onFeedback: (feedback: 'spot_on' | 'not_for_me' | 'maybe', responseTimeMs: number) => void;
  disabled?: boolean;
}

export function OutfitCalibrationCard({ outfit, onFeedback, disabled }: OutfitCalibrationCardProps) {
  const [startTime] = useState(Date.now());
  const [selectedFeedback, setSelectedFeedback] = useState<'spot_on' | 'not_for_me' | 'maybe' | null>(null);

  const handleFeedback = (feedback: 'spot_on' | 'not_for_me' | 'maybe') => {
    if (disabled || selectedFeedback) return;

    const responseTime = Date.now() - startTime;
    setSelectedFeedback(feedback);
    onFeedback(feedback, responseTime);
  };

  const totalPrice = Object.values(outfit.items)
    .filter(Boolean)
    .reduce((sum, item) => sum + (item?.price || 0), 0);

  const formattedTotal = Math.round(totalPrice);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300"
    >
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
        <div className="relative aspect-[4/5] md:aspect-auto">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-6">
            {outfit.items.top && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="aspect-square bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-md"
              >
                <img
                  src={outfit.items.top.image_url}
                  alt={outfit.items.top.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            {outfit.items.bottom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="aspect-square bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-md"
              >
                <img
                  src={outfit.items.bottom.image_url}
                  alt={outfit.items.bottom.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            {outfit.items.shoes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 aspect-[2/1] bg-white rounded-[var(--radius-xl)] overflow-hidden shadow-md"
              >
                <img
                  src={outfit.items.shoes.image_url}
                  alt={outfit.items.shoes.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {outfit.title}
              </h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                {outfit.occasion === 'work' ? 'Perfect voor werk' : 'Casual daily look'}
              </p>
            </div>
            <div className="text-right">
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
              />
            )}
            {outfit.items.bottom && (
              <OutfitItem
                name={outfit.items.bottom.name}
                brand={outfit.items.bottom.brand}
                price={outfit.items.bottom.price}
              />
            )}
            {outfit.items.shoes && (
              <OutfitItem
                name={outfit.items.shoes.name}
                brand={outfit.items.shoes.brand}
                price={outfit.items.shoes.price}
              />
            )}
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--ff-color-primary-700)] mb-2">
              Waarom dit bij je past:
            </p>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">
              {outfit.explanation}
            </p>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OutfitItem({ name, brand, price }: { name: string; brand: string; price: number }) {
  const formattedPrice = Math.round(price * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-between text-sm"
    >
      <div className="flex-1">
        <div className="font-medium text-[var(--color-text)]">{name}</div>
        <div className="text-[var(--color-muted)] text-xs mt-0.5">{brand}</div>
      </div>
      <div className="text-[var(--color-text)] font-medium">€{formattedPrice.toFixed(2)}</div>
    </motion.div>
  );
}
