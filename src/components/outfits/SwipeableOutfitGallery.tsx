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
          <Heart className="w-16 h-16 mx-auto mb-4 text-[#C2654A]" />
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2">
            Je hebt alle outfits gezien!
          </h3>
          <p className="text-[#8A8A8A]">
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
        <p className="text-sm text-[#8A8A8A]">
          👈 Swipe links om over te slaan • Swipe rechts om op te slaan 👉
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4 px-4">
        <span className="text-sm font-medium text-[#1A1A1A]">
          {currentIndex + 1} / {outfits.length}
        </span>
        <span className="text-sm text-[#8A8A8A]">
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
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-medium text-base hover:border-[#C2654A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Vorige outfit"
        >
          <ChevronLeft className="w-5 h-5" />
          Vorige
        </button>

        <button
          onClick={() => handleSwipeLeft()}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-medium text-base hover:border-[#C2654A] transition-colors duration-200"
          aria-label="Sla over"
        >
          Sla over
        </button>

        <button
          onClick={() => handleSwipeRight()}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[#A8513A] text-white rounded-xl font-semibold text-base hover:bg-[#C2654A] transition-colors duration-200"
          aria-label="Bewaar outfit"
        >
          <Heart className="w-5 h-5" />
          Bewaar
        </button>

        <button
          onClick={moveToNext}
          disabled={currentIndex === outfits.length - 1}
          className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-medium text-base hover:border-[#C2654A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[52px] bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-medium text-base hover:border-[#C2654A] transition-colors duration-200"
          aria-label="Sla over"
        >
          Sla over
        </button>

        <button
          onClick={() => handleSwipeRight()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[52px] bg-[#A8513A] text-white rounded-xl font-semibold shadow-lg active:scale-[0.98]"
          aria-label="Bewaar outfit"
        >
          <Heart className="w-5 h-5" />
          Bewaar
        </button>
      </div>
    </div>
  );
}
