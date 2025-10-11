import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { NovaBubble } from './NovaBubble';
import { Sparkles, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';
import type { MoodPhoto, StyleSwipe } from '@/services/visualPreferences/visualPreferenceService';

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: string, direction: 'left' | 'right') => void;
}

export function VisualPreferenceStep({ onComplete, onSwipe }: VisualPreferenceStepProps) {
  const [moodPhotos, setMoodPhotos] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [novaInsight, setNovaInsight] = useState<string | null>(null);
  const { user } = useUser();
  const analyzerRef = useRef(new SwipeAnalyzer());

  useEffect(() => {
    loadMoodPhotos();
  }, []);

  const loadMoodPhotos = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('mood_photos')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .limit(10);

      if (error) throw error;

      setMoodPhotos(data || []);
    } catch (err) {
      console.error('Failed to load mood photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = moodPhotos[currentIndex];
    if (!currentPhoto) return;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    // Create swipe record
    const swipeRecord: StyleSwipe = {
      user_id: user?.id,
      session_id: !user ? (sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID()) : undefined,
      mood_photo_id: currentPhoto.id,
      swipe_direction: direction,
      response_time_ms: responseTimeMs
    };

    // Add to analyzer
    analyzerRef.current.addSwipe(currentPhoto, swipeRecord);

    try {
      const { supabase } = await import('@/lib/supabase');
      const sessionId = sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID();

      if (!sessionStorage.getItem('fitfi_session_id')) {
        sessionStorage.setItem('fitfi_session_id', sessionId);
      }

      await supabase.from('style_swipes').insert({
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
        mood_photo_id: currentPhoto.id,
        swipe_direction: direction,
        response_time_ms: responseTimeMs
      });

      onSwipe?.(currentPhoto.id, direction);
    } catch (err) {
      console.error('Failed to save swipe:', err);
    }

    // Generate Nova insight
    const insight = analyzerRef.current.generateInsight(newSwipeCount);
    if (insight && insight.shouldShow) {
      setTimeout(() => {
        setNovaInsight(insight.message);
      }, 600);
    }

    if (currentIndex < moodPhotos.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 100);
    } else {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-[600px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Loader2 className="w-12 h-12 text-[var(--ff-color-primary-700)]" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-[var(--color-muted)]"
          >
            Beelden laden...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (moodPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-muted)]">Geen stijlbeelden beschikbaar</p>
        <button
          onClick={onComplete}
          className="mt-4 ff-btn ff-btn-primary"
        >
          Doorgaan
        </button>
      </div>
    );
  }

  const currentPhoto = moodPhotos[currentIndex];
  const progress = ((swipeCount) / moodPhotos.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto px-4 py-8"
    >
      <AnimatePresence>
        {novaInsight && (
          <NovaBubble
            message={novaInsight}
            onDismiss={() => setNovaInsight(null)}
            autoHideDuration={5000}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-4"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          </motion.div>
          <span className="text-sm font-medium text-[var(--color-text)]">
            Visuele Voorkeuren
          </span>
        </motion.div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Welke stijl spreekt je aan?
        </h2>
        <p className="text-[var(--color-muted)] max-w-md mx-auto">
          Swipe door 10 outfits. Dit helpt Nova om precies te begrijpen wat jouw perfecte stijl is.
        </p>

        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--ff-color-primary-700)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <motion.p
            key={swipeCount}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[var(--color-muted)] mt-2"
          >
            {swipeCount} van {moodPhotos.length}
          </motion.p>
        </div>
      </motion.div>

      <div className="relative h-[620px]">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-8 space-y-3"
      >
        <div className="flex items-center justify-center gap-6 text-sm text-[var(--color-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center">
              <span className="text-xs">←</span>
            </div>
            <span>Niet mijn stijl</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Spreekt me aan</span>
            <div className="w-8 h-8 rounded-full border-2 border-green-400 flex items-center justify-center">
              <span className="text-xs">→</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Of gebruik de knoppen onderaan
        </p>
      </motion.div>
    </motion.div>
  );
}
