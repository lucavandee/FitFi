import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { Sparkles, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--ff-color-primary-700)] animate-spin mx-auto" />
          <p className="mt-4 text-[var(--color-muted)]">Beelden laden...</p>
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)]">
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
      <div className="flex-shrink-0 px-4 pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-3">
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Visuele Voorkeuren</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">
          Welke stijl spreekt je aan?
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Swipe door {moodPhotos.length} outfits
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--ff-color-primary-700)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-2 text-center">
            {swipeCount} van {moodPhotos.length}
          </p>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <AnimatePresence mode="wait">
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

      {/* Footer Legend */}
      <div className="flex-shrink-0 px-4 pb-6 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-red-400 flex items-center justify-center">
              <span className="text-xs">←</span>
            </div>
            <span className="hidden sm:inline">Niet mijn stijl</span>
            <span className="sm:hidden">Nee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Spreekt me aan</span>
            <span className="sm:hidden">Ja</span>
            <div className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center">
              <span className="text-xs">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
