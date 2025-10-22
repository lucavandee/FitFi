import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { NovaBubble } from './NovaBubble';
import { Sparkles, Loader2, SkipForward } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';
import type { MoodPhoto, StyleSwipe } from '@/services/visualPreferences/visualPreferenceService';

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: number, direction: 'left' | 'right') => void;
}

export function VisualPreferenceStep({ onComplete, onSwipe }: VisualPreferenceStepProps) {
  const [moodPhotos, setMoodPhotos] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [novaInsight, setNovaInsight] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const { user } = useUser();
  const analyzerRef = useRef(new SwipeAnalyzer());

  useEffect(() => {
    loadMoodPhotos();
  }, []);

  const loadMoodPhotos = async () => {
    try {
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

      if (error) {
        console.error('❌ Error fetching mood photos:', error);
        throw error;
      }

      console.log('✅ Mood photos fetched:', data?.length || 0, 'photos');

      // If no photos in database, use placeholder data
      if (!data || data.length === 0) {
        console.warn('⚠️ No mood photos in database, using placeholders');
        const placeholderPhotos: MoodPhoto[] = [
          { id: 1, image_url: '/images/fallbacks/default.jpg', mood_tags: ['casual', 'relaxed'], archetype_weights: { casual: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.3 }, active: true, display_order: 1 },
          { id: 2, image_url: '/images/fallbacks/default.jpg', mood_tags: ['formal', 'confident'], archetype_weights: { classic: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.9 }, active: true, display_order: 2 },
          { id: 3, image_url: '/images/fallbacks/default.jpg', mood_tags: ['sporty', 'energetic'], archetype_weights: { sporty: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.2 }, active: true, display_order: 3 },
          { id: 4, image_url: '/images/fallbacks/default.jpg', mood_tags: ['minimal', 'calm'], archetype_weights: { minimalist: 0.9 }, dominant_colors: ['#FFF'], style_attributes: { formality: 0.5 }, active: true, display_order: 4 },
          { id: 5, image_url: '/images/fallbacks/default.jpg', mood_tags: ['vintage', 'nostalgic'], archetype_weights: { vintage: 0.8 }, dominant_colors: ['#8B7355'], style_attributes: { formality: 0.6 }, active: true, display_order: 5 },
          { id: 6, image_url: '/images/fallbacks/default.jpg', mood_tags: ['edgy', 'bold'], archetype_weights: { edgy: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.4 }, active: true, display_order: 6 },
          { id: 7, image_url: '/images/fallbacks/default.jpg', mood_tags: ['bohemian', 'free'], archetype_weights: { bohemian: 0.8 }, dominant_colors: ['#D4AF37'], style_attributes: { formality: 0.3 }, active: true, display_order: 7 },
          { id: 8, image_url: '/images/fallbacks/default.jpg', mood_tags: ['preppy', 'polished'], archetype_weights: { preppy: 0.8 }, dominant_colors: ['#000080'], style_attributes: { formality: 0.7 }, active: true, display_order: 8 },
          { id: 9, image_url: '/images/fallbacks/default.jpg', mood_tags: ['romantic', 'soft'], archetype_weights: { romantic: 0.8 }, dominant_colors: ['#FFC0CB'], style_attributes: { formality: 0.6 }, active: true, display_order: 9 },
          { id: 10, image_url: '/images/fallbacks/default.jpg', mood_tags: ['urban', 'street'], archetype_weights: { urban: 0.8 }, dominant_colors: ['#808080'], style_attributes: { formality: 0.3 }, active: true, display_order: 10 },
        ];
        setMoodPhotos(placeholderPhotos);
      } else {
        setMoodPhotos(data);
      }
    } catch (err) {
      console.error('Failed to load mood photos:', err);
      console.warn('⚠️ Error loading mood photos, using placeholders');
      const placeholderPhotos: MoodPhoto[] = [
        { id: 1, image_url: '/images/fallbacks/default.jpg', mood_tags: ['casual', 'relaxed'], archetype_weights: { casual: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.3 }, active: true, display_order: 1 },
        { id: 2, image_url: '/images/fallbacks/default.jpg', mood_tags: ['formal', 'confident'], archetype_weights: { classic: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.9 }, active: true, display_order: 2 },
        { id: 3, image_url: '/images/fallbacks/default.jpg', mood_tags: ['sporty', 'energetic'], archetype_weights: { sporty: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.2 }, active: true, display_order: 3 },
        { id: 4, image_url: '/images/fallbacks/default.jpg', mood_tags: ['minimal', 'calm'], archetype_weights: { minimalist: 0.9 }, dominant_colors: ['#FFF'], style_attributes: { formality: 0.5 }, active: true, display_order: 4 },
        { id: 5, image_url: '/images/fallbacks/default.jpg', mood_tags: ['vintage', 'nostalgic'], archetype_weights: { vintage: 0.8 }, dominant_colors: ['#8B7355'], style_attributes: { formality: 0.6 }, active: true, display_order: 5 },
        { id: 6, image_url: '/images/fallbacks/default.jpg', mood_tags: ['edgy', 'bold'], archetype_weights: { edgy: 0.8 }, dominant_colors: ['#000'], style_attributes: { formality: 0.4 }, active: true, display_order: 6 },
        { id: 7, image_url: '/images/fallbacks/default.jpg', mood_tags: ['bohemian', 'free'], archetype_weights: { bohemian: 0.8 }, dominant_colors: ['#D4AF37'], style_attributes: { formality: 0.3 }, active: true, display_order: 7 },
        { id: 8, image_url: '/images/fallbacks/default.jpg', mood_tags: ['preppy', 'polished'], archetype_weights: { preppy: 0.8 }, dominant_colors: ['#000080'], style_attributes: { formality: 0.7 }, active: true, display_order: 8 },
        { id: 9, image_url: '/images/fallbacks/default.jpg', mood_tags: ['romantic', 'soft'], archetype_weights: { romantic: 0.8 }, dominant_colors: ['#FFC0CB'], style_attributes: { formality: 0.6 }, active: true, display_order: 9 },
        { id: 10, image_url: '/images/fallbacks/default.jpg', mood_tags: ['urban', 'street'], archetype_weights: { urban: 0.8 }, dominant_colors: ['#808080'], style_attributes: { formality: 0.3 }, active: true, display_order: 10 },
      ];
      setMoodPhotos(placeholderPhotos);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (client && user) {
        await client
          .from('style_profiles')
          .upsert({
            user_id: user.id,
            visual_preference_skipped: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }

      localStorage.setItem('ff_visual_pref_skipped', 'true');
      onComplete();
    } catch (err) {
      console.error('Failed to save skip status:', err);
      onComplete();
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = moodPhotos[currentIndex];
    if (!currentPhoto) return;

    if (swipeCount >= 10) {
      onComplete();
      return;
    }

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
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        console.warn('⚠️ Swipe not saved - Supabase unavailable (will work locally)');
        onSwipe?.(currentPhoto.id, direction);
        return;
      }

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

      onSwipe?.(currentPhoto.id, direction);
    } catch (err) {
      console.warn('⚠️ Failed to save swipe to database (continuing locally):', err);
    }

    // Generate Nova insight
    const insight = analyzerRef.current.generateInsight(newSwipeCount);
    if (insight && insight.shouldShow) {
      setTimeout(() => {
        setNovaInsight(insight.message);
      }, 600);
    }

    // Complete after 10 swipes
    if (newSwipeCount >= 10) {
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }

    // Move to next photo
    if (currentIndex < moodPhotos.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 100);
    } else {
      // Out of photos before 10 swipes - still complete
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

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowSkipConfirm(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          <span>Dit stap overslaan</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-[var(--shadow-soft)]"
            >
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                Deze stap overslaan?
              </h3>
              <p className="text-[var(--color-muted)] mb-6">
                Je kunt je stijlvoorkeuren later altijd verfijnen via het dashboard. Dit helpt wel om je aanbevelingen te personaliseren.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--overlay-hover)] transition-colors"
                >
                  Terug naar swipen
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors"
                >
                  Overslaan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
