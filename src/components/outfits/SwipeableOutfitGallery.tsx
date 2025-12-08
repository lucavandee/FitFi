import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { SwipeableOutfitCard } from './SwipeableOutfitCard';
import toast from 'react-hot-toast';

interface Outfit {
  id: string;
  [key: string]: any;
}

interface SwipeableOutfitGalleryProps {
  outfits: Outfit[];
  onLike?: (outfit: Outfit) => void;
  onDislike?: (outfit: Outfit) => void;
  renderCard: (outfit: Outfit) => React.ReactNode;
  className?: string;
}

export function SwipeableOutfitGallery({
  outfits,
  onLike,
  onDislike,
  renderCard,
  className = ''
}: SwipeableOutfitGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());

  const currentOutfit = outfits[currentIndex];

  const handleSwipeRight = () => {
    if (currentOutfit) {
      setLikedOutfits(prev => new Set(prev).add(currentOutfit.id));
      onLike?.(currentOutfit);
      toast.success('Outfit opgeslagen!', { icon: '❤️', duration: 2000 });
    }
    moveToNext();
  };

  const handleSwipeLeft = () => {
    if (currentOutfit) {
      onDislike?.(currentOutfit);
    }
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const moveToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentOutfit) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 mx-auto mb-4 text-[var(--ff-color-primary-600)]" />
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">
            Je hebt alle outfits gezien!
          </h3>
          <p className="text-[var(--color-muted)]">
            Je hebt {likedOutfits.size} outfit{likedOutfits.size !== 1 ? 's' : ''} opgeslagen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Instructies voor mobile */}
      <div className="md:hidden text-center mb-4 px-4">
        <p className="text-sm text-[var(--color-muted)]">
          👈 Swipe links om over te slaan • Swipe rechts om op te slaan 👉
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4 px-4">
        <span className="text-sm font-medium text-[var(--color-text)]">
          {currentIndex + 1} / {outfits.length}
        </span>
        <span className="text-sm text-[var(--color-muted)]">
          {likedOutfits.size} opgeslagen
        </span>
      </div>

      {/* Swipeable Card */}
      <div className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <SwipeableOutfitCard
            key={currentOutfit.id}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            className="w-full max-w-2xl mx-auto"
          >
            {renderCard(currentOutfit)}
          </SwipeableOutfitCard>
        </AnimatePresence>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex items-center justify-center gap-4 mt-6">
        <button
          onClick={moveToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          aria-label="Vorige outfit"
        >
          <ChevronLeft className="w-5 h-5" />
          Vorige
        </button>

        <button
          onClick={() => handleSwipeLeft()}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-bg)] transition-all active:scale-[0.98]"
          aria-label="Sla over"
        >
          Sla over
        </button>

        <button
          onClick={() => handleSwipeRight()}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg active:scale-[0.98]"
          aria-label="Bewaar outfit"
        >
          <Heart className="w-5 h-5" />
          Bewaar
        </button>

        <button
          onClick={moveToNext}
          disabled={currentIndex === outfits.length - 1}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          aria-label="Volgende outfit"
        >
          Volgende
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Action Buttons */}
      <div className="md:hidden flex items-center justify-center gap-3 mt-6 px-4">
        <button
          onClick={() => handleSwipeLeft()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold active:scale-[0.98]"
          aria-label="Sla over"
        >
          Sla over
        </button>

        <button
          onClick={() => handleSwipeRight()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold shadow-lg active:scale-[0.98]"
          aria-label="Bewaar outfit"
        >
          <Heart className="w-5 h-5" />
          Bewaar
        </button>
      </div>
    </div>
  );
}
