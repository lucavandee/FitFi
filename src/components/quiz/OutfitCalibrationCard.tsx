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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-soft)]"
    >
      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
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
                €{totalPrice}
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
        </div>

        <div className="flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {outfit.items.top && (
              <div className="aspect-square bg-[var(--color-bg)] rounded-[var(--radius-lg)] overflow-hidden">
                <img
                  src={outfit.items.top.image_url}
                  alt={outfit.items.top.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {outfit.items.bottom && (
              <div className="aspect-square bg-[var(--color-bg)] rounded-[var(--radius-lg)] overflow-hidden">
                <img
                  src={outfit.items.bottom.image_url}
                  alt={outfit.items.bottom.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {outfit.items.shoes && (
              <div className="aspect-square bg-[var(--color-bg)] rounded-[var(--radius-lg)] overflow-hidden col-span-2">
                <img
                  src={outfit.items.shoes.image_url}
                  alt={outfit.items.shoes.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleFeedback('spot_on')}
              disabled={disabled || selectedFeedback !== null}
              className={`w-full py-3 px-4 rounded-[var(--radius-xl)] font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedFeedback === 'spot_on'
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-green-500 hover:text-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Check className="w-5 h-5" />
              Spot on!
            </button>

            <button
              onClick={() => handleFeedback('maybe')}
              disabled={disabled || selectedFeedback !== null}
              className={`w-full py-2 px-4 rounded-[var(--radius-xl)] font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'maybe'
                  ? 'bg-[var(--ff-color-primary-600)] text-white'
                  : 'bg-transparent text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-600)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Minus className="w-4 h-4" />
              Misschien
            </button>

            <button
              onClick={() => handleFeedback('not_for_me')}
              disabled={disabled || selectedFeedback !== null}
              className={`w-full py-2 px-4 rounded-[var(--radius-xl)] font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                selectedFeedback === 'not_for_me'
                  ? 'bg-red-500 text-white'
                  : 'bg-transparent text-[var(--color-muted)] border border-[var(--color-border)] hover:border-red-500 hover:text-red-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="w-4 h-4" />
              Lijkt me niks
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OutfitItem({ name, brand, price }: { name: string; brand: string; price: number }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <div className="flex-1">
        <div className="font-medium text-[var(--color-text)]">{name}</div>
        <div className="text-[var(--color-muted)] text-xs mt-0.5">{brand}</div>
      </div>
      <div className="text-[var(--color-text)] font-medium">€{price}</div>
    </div>
  );
}
