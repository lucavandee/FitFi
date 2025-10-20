import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { NovaBubble } from './NovaBubble';
import { Sparkles, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';
import { VisualPreferenceErrorBoundary } from './VisualPreferenceErrorBoundary';
import type { MoodPhoto, StyleSwipe } from '@/services/visualPreferences/visualPreferenceService';

const MOOD_PHOTOS_CACHE_KEY = 'fitfi_mood_photos_cache';
const MOOD_PHOTOS_CACHE_DURATION = 1000 * 60 * 60 * 24;
const MAX_LOAD_RETRIES = 3;
const MAX_SAVE_RETRIES = 2;
const RETRY_DELAY = 1000;

interface CachedMoodPhotos {
  data: MoodPhoto[];
  timestamp: number;
}

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: string, direction: 'left' | 'right') => void;
}

function VisualPreferenceStepInner({ onComplete, onSwipe }: VisualPreferenceStepProps) {
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

  const logTelemetry = (event: string, data: Record<string, any>) => {
    try {
      const telemetry = {
        event,
        timestamp: new Date().toISOString(),
        component: 'VisualPreferenceStep',
        userId: user?.id,
        ...data
      };

      const existing = localStorage.getItem('fitfi_visual_telemetry');
      const logs = existing ? JSON.parse(existing) : [];
      logs.push(telemetry);

      if (logs.length > 100) logs.shift();

      localStorage.setItem('fitfi_visual_telemetry', JSON.stringify(logs));
      console.log('[Telemetry]', event, data);
    } catch (err) {
      console.warn('Failed to log telemetry:', err);
    }
  };

  const loadCachedMoodPhotos = (): MoodPhoto[] | null => {
    try {
      const cached = localStorage.getItem(MOOD_PHOTOS_CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedMoodPhotos = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      if (age > MOOD_PHOTOS_CACHE_DURATION) {
        console.log('🗑️ Mood photos cache expired');
        localStorage.removeItem(MOOD_PHOTOS_CACHE_KEY);
        return null;
      }

      logTelemetry('cache_hit', { age });
      return parsed.data;
    } catch (err) {
      console.warn('Failed to load cached mood photos:', err);
      return null;
    }
  };

  const cacheMoodPhotos = (photos: MoodPhoto[]) => {
    try {
      const cache: CachedMoodPhotos = {
        data: photos,
        timestamp: Date.now()
      };
      localStorage.setItem(MOOD_PHOTOS_CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Mood photos cached successfully');
      logTelemetry('photos_cached', { count: photos.length });
    } catch (err) {
      console.warn('Failed to cache mood photos:', err);
    }
  };

  const getPlaceholderPhotos = (): MoodPhoto[] => [
    { id: 'placeholder-1', image_url: '/images/fallbacks/default.jpg', tags: ['casual'], mood: 'relaxed', style_archetype: 'casual', active: true, display_order: 1 },
    { id: 'placeholder-2', image_url: '/images/fallbacks/default.jpg', tags: ['formal'], mood: 'confident', style_archetype: 'classic', active: true, display_order: 2 },
    { id: 'placeholder-3', image_url: '/images/fallbacks/default.jpg', tags: ['sporty'], mood: 'energetic', style_archetype: 'sporty', active: true, display_order: 3 },
    { id: 'placeholder-4', image_url: '/images/fallbacks/default.jpg', tags: ['minimal'], mood: 'calm', style_archetype: 'minimalist', active: true, display_order: 4 },
    { id: 'placeholder-5', image_url: '/images/fallbacks/default.jpg', tags: ['vintage'], mood: 'nostalgic', style_archetype: 'vintage', active: true, display_order: 5 },
    { id: 'placeholder-6', image_url: '/images/fallbacks/default.jpg', tags: ['edgy'], mood: 'bold', style_archetype: 'edgy', active: true, display_order: 6 },
    { id: 'placeholder-7', image_url: '/images/fallbacks/default.jpg', tags: ['bohemian'], mood: 'free', style_archetype: 'bohemian', active: true, display_order: 7 },
    { id: 'placeholder-8', image_url: '/images/fallbacks/default.jpg', tags: ['preppy'], mood: 'polished', style_archetype: 'preppy', active: true, display_order: 8 },
    { id: 'placeholder-9', image_url: '/images/fallbacks/default.jpg', tags: ['romantic'], mood: 'soft', style_archetype: 'romantic', active: true, display_order: 9 },
    { id: 'placeholder-10', image_url: '/images/fallbacks/default.jpg', tags: ['urban'], mood: 'street', style_archetype: 'urban', active: true, display_order: 10 },
  ];

  const loadMoodPhotos = async (retryCount = 0) => {
    try {
      const cached = loadCachedMoodPhotos();
      if (cached) {
        console.log('✅ Using cached mood photos');
        setMoodPhotos(cached);
        setLoading(false);
        return;
      }

      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        console.warn('⚠️ Supabase client not available, using placeholders');
        throw new Error('Supabase not available');
      }

      const { data, error } = await client
        .from('mood_photos')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        console.warn('⚠️ No mood photos in database, using placeholders');
        const placeholderPhotos = getPlaceholderPhotos();
        setMoodPhotos(placeholderPhotos);
        cacheMoodPhotos(placeholderPhotos);
        logTelemetry('using_placeholders', { reason: 'no_data' });
      } else {
        setMoodPhotos(data);
        cacheMoodPhotos(data);
        logTelemetry('photos_loaded', { count: data.length, source: 'database' });
      }
    } catch (err) {
      console.error(`Failed to load mood photos (attempt ${retryCount + 1}/${MAX_LOAD_RETRIES}):`, err);

      if (retryCount < MAX_LOAD_RETRIES - 1) {
        console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`);
        logTelemetry('retry_mood_photos', { attempt: retryCount + 1, error: String(err) });
        setTimeout(() => {
          loadMoodPhotos(retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1));
        return;
      }

      console.warn('⚠️ Max retries reached, using placeholders');
      logTelemetry('mood_photos_failed', { attempts: MAX_LOAD_RETRIES, error: String(err) });
      const placeholderPhotos = getPlaceholderPhotos();
      setMoodPhotos(placeholderPhotos);
      cacheMoodPhotos(placeholderPhotos);
    } finally {
      setLoading(false);
    }
  };

  const saveSwipeWithRetry = async (
    photoId: string,
    direction: 'left' | 'right',
    responseTimeMs: number,
    retryCount = 0
  ) => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        console.warn('⚠️ Swipe not saved - Supabase unavailable (will work locally)');
        onSwipe?.(photoId, direction);
        return;
      }

      const sessionId = sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID();

      if (!sessionStorage.getItem('fitfi_session_id')) {
        sessionStorage.setItem('fitfi_session_id', sessionId);
      }

      const { error } = await client.from('style_swipes').insert({
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
        mood_photo_id: photoId,
        swipe_direction: direction,
        response_time_ms: responseTimeMs
      });

      if (error) throw error;

      onSwipe?.(photoId, direction);
      logTelemetry('swipe_saved', { photoId, direction });
    } catch (err) {
      console.warn(`⚠️ Failed to save swipe (attempt ${retryCount + 1}/${MAX_SAVE_RETRIES}):`, err);

      if (retryCount < MAX_SAVE_RETRIES - 1) {
        console.log('⏳ Retrying swipe save...');
        logTelemetry('retry_swipe_save', { attempt: retryCount + 1, error: String(err) });
        setTimeout(() => {
          saveSwipeWithRetry(photoId, direction, responseTimeMs, retryCount + 1);
        }, 500);
      } else {
        logTelemetry('swipe_save_failed', { attempts: MAX_SAVE_RETRIES, error: String(err) });
        console.warn('⚠️ Swipe not saved after retries (continuing locally)');
      }
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = moodPhotos[currentIndex];
    if (!currentPhoto) return;

    logTelemetry('swipe', {
      direction,
      responseTimeMs,
      photoId: currentPhoto.id,
      swipeCount: swipeCount + 1
    });

    if (swipeCount >= 10) {
      onComplete();
      return;
    }

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    const swipeRecord: StyleSwipe = {
      user_id: user?.id,
      session_id: !user ? (sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID()) : undefined,
      mood_photo_id: currentPhoto.id,
      swipe_direction: direction,
      response_time_ms: responseTimeMs
    };

    analyzerRef.current.addSwipe(currentPhoto, swipeRecord);

    await saveSwipeWithRetry(currentPhoto.id, direction, responseTimeMs);

    const insight = analyzerRef.current.generateInsight(newSwipeCount);
    if (insight && insight.shouldShow) {
      setTimeout(() => {
        setNovaInsight(insight.message);
      }, 600);
    }

    if (newSwipeCount >= 10) {
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
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

export function VisualPreferenceStep(props: VisualPreferenceStepProps) {
  return (
    <VisualPreferenceErrorBoundary onReset={props.onComplete}>
      <VisualPreferenceStepInner {...props} />
    </VisualPreferenceErrorBoundary>
  );
}
