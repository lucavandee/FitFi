import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SwipeCard } from './SwipeCard';
import { ImagePreloader } from './ImagePreloader';
import { Sparkles, Loader as Loader2, Heart, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface MoodPhoto {
  id: string;
  image_url: string;
  tags?: string[];
  mood?: string;
  style_archetype?: string;
  active: boolean;
  display_order: number;
  gender?: string;
}

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: string, direction: 'left' | 'right') => void;
  userGender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
}

export function VisualPreferenceStepClean({ onComplete, onSwipe, userGender }: VisualPreferenceStepProps) {
  const [moodPhotos, setMoodPhotos] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadMoodPhotos();
  }, [userGender]);

  // Keyboard Navigation for Desktop Users
  useEffect(() => {
    if (showCelebration || loading || moodPhotos.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default to avoid page scroll
      if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      const currentPhoto = moodPhotos[currentIndex];
      if (!currentPhoto) return;

      if (e.key === 'ArrowLeft') {
        // Left arrow = dislike
        handleSwipe('left', 0);
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        // Right arrow, Space, or Enter = like (most common action)
        handleSwipe('right', 0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, moodPhotos, showCelebration, loading]);

  const loadMoodPhotos = async () => {
    try {
      // Use centralized service for consistent gender filtering
      const { VisualPreferenceService } = await import('@/services/visualPreferences/visualPreferenceService');

      const photos = await VisualPreferenceService.getMoodPhotos(15, userGender);

      if (photos.length === 0) {
        console.warn('⚠️ No mood photos found for gender:', userGender);
        // Fallback: try loading unisex photos
        const fallbackPhotos = await VisualPreferenceService.getMoodPhotos(15, 'prefer-not-to-say');
        setMoodPhotos(fallbackPhotos);
      } else {
        setMoodPhotos(photos);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load mood photos:', err);
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = moodPhotos[currentIndex];
    if (!currentPhoto || showCelebration) return;

    console.log(`📸 Swipe #${swipeCount + 1}/${moodPhotos.length} → ${direction}`);

    const newSwipeCount = swipeCount + 1;
    const isLastSwipe = newSwipeCount >= moodPhotos.length;

    setSwipeCount(newSwipeCount);

    // Save to database (non-blocking)
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (client) {
        const sessionId = sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID();
        if (!sessionStorage.getItem('fitfi_session_id')) {
          sessionStorage.setItem('fitfi_session_id', sessionId);
        }

        await client.from('style_swipes').insert({
          user_id: user?.id || null,
          session_id: !user ? sessionId : null,
          mood_photo_id: currentPhoto.id,
          swipe_direction: direction,
          response_time_ms: responseTimeMs
        });
      }

      onSwipe?.(currentPhoto.id, direction);
    } catch (err) {
      console.warn('Failed to save swipe:', err);
    }

    // Check if we're done
    if (isLastSwipe) {
      console.log('🎉 ALL SWIPES COMPLETE! Starting celebration...');
      setShowCelebration(true);

      setTimeout(() => {
        console.log('✅ Celebration done, calling onComplete()');
        setShowCelebration(false);
        onComplete();
      }, 2500);

      return;
    }

    // Move to next photo
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)] fixed inset-0">
        {/* Skeleton Header */}
        <div className="flex-shrink-0 px-4 pt-safe pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="w-40 h-8 bg-[var(--color-border)] rounded-full animate-pulse mb-3" />
          <div className="w-64 h-7 bg-[var(--color-border)] rounded-lg animate-pulse mb-2" />
          <div className="w-48 h-5 bg-[var(--color-border)] rounded-lg animate-pulse" />
          <div className="mt-4 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <div className="h-full w-0 bg-[var(--ff-color-primary-600)] animate-pulse" />
          </div>
        </div>

        {/* Skeleton Card */}
        <div className="flex-1 flex items-center justify-center px-4 min-h-0 relative">
          <div className="w-full max-w-[400px] flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-[340px] sm:max-w-[360px] h-[420px] sm:h-[480px] rounded-[var(--radius-2xl)] bg-[var(--color-border)] animate-pulse" />

            {/* Skeleton Buttons */}
            <div className="flex gap-4 sm:gap-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-border)] animate-pulse" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-border)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton Footer */}
        <div className="flex-shrink-0 px-4 pb-safe pb-4 sm:pb-6">
          <div className="max-w-md mx-auto flex justify-center">
            <div className="w-64 h-4 bg-[var(--color-border)] rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Loading Message Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-6 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[var(--ff-color-primary-700)] animate-spin" />
              <p className="text-sm font-medium text-[var(--color-text)]">Stijlbeelden laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (moodPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-muted)] mb-4">Geen stijlbeelden beschikbaar</p>
        <button onClick={onComplete} className="ff-btn ff-btn-primary">
          Doorgaan
        </button>
      </div>
    );
  }

  const currentPhoto = moodPhotos[currentIndex];
  const progress = (swipeCount / moodPhotos.length) * 100;

  // Extract all image URLs for preloading
  const imageUrls = moodPhotos.map(photo => photo.image_url);

  // Extract storage domain for preconnect (performance optimization)
  const storageDomain = imageUrls.length > 0
    ? new URL(imageUrls[0]).origin
    : '';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)] fixed inset-0">
      {/* Performance: DNS Preconnect for faster image loading */}
      {storageDomain && (
        <Helmet>
          <link rel="preconnect" href={storageDomain} />
          <link rel="dns-prefetch" href={storageDomain} />
        </Helmet>
      )}

      {/* Image Preloader - Preload next 2 images for smooth transitions */}
      {!loading && moodPhotos.length > 0 && (
        <ImagePreloader
          imageUrls={imageUrls}
          currentIndex={currentIndex}
          lookahead={2}
        />
      )}

      {/* Celebration Overlay - ALWAYS on top */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-3">Perfect!</h3>
              <p className="text-xl text-white/90">Je stijlprofiel is compleet!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-safe pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-2 sm:mb-3">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">Visuele Voorkeuren</span>
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
          Welke stijl spreekt je aan?
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted)]">
          <strong className="text-[var(--color-text)]">Laatste stap!</strong> {moodPhotos.length} outfits
        </p>

        {/* Progress */}
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text)]">{Math.round(progress)}% compleet</span>
            <span className="text-xs text-[var(--color-muted)]">{swipeCount} van {moodPhotos.length}</span>
          </div>
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Swipe Area - Fixed Height to Prevent Scroll Jump */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0 relative">
        <div className="w-full max-w-[400px] h-[600px] sm:h-[680px] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {currentPhoto && (
              <SwipeCard
                key={currentPhoto.id}
                imageUrl={currentPhoto.image_url}
                onSwipe={handleSwipe}
                index={currentIndex}
                total={moodPhotos.length}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Instructions - Simplified for Mobile */}
      <div className="flex-shrink-0 px-4 pb-safe pb-4 sm:pb-6">
        <div className="max-w-md mx-auto">
          {/* Desktop: Full instructions with enhanced clarity */}
          <div className="hidden sm:block">
            <p className="text-center text-sm font-semibold text-[var(--color-text)] mb-3">
              Klik, sleep of gebruik toetsenbord
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center bg-[var(--color-surface)]">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-[var(--color-text)]">Niet mijn stijl</div>
                  <div className="text-xs opacity-75">← of ←</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-medium text-[var(--color-text)]">Spreekt me aan</div>
                  <div className="text-xs opacity-75">→ of Space</div>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-green-400 flex items-center justify-center bg-[var(--color-surface)]">
                  <Heart className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-[var(--color-muted)] mt-3 opacity-60">
              💡 Tip: Hover over de foto om hints te zien
            </p>
          </div>

          {/* Mobile: Minimal instructions */}
          <div className="sm:hidden text-center">
            <p className="text-xs text-[var(--color-muted)]">
              Tik op de knoppen of sleep naar links/rechts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
