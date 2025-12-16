import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TinderSwipeCard } from './TinderSwipeCard';
import { NovaBubble } from './NovaBubble';
import { Loader2, SkipForward, RotateCcw, PartyPopper } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';
import { loadAdaptivePhotos, generateAdaptationInsight } from '@/services/visualPreferences/adaptiveLoader';
import { generateQuickOutfit } from '@/services/visualPreferences/quickOutfitGenerator';
import type { MoodPhoto, StyleSwipe } from '@/services/visualPreferences/visualPreferenceService';
import type { QuickOutfit } from '@/services/visualPreferences/quickOutfitGenerator';

const MAX_SWIPES = 15;

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: number, direction: 'left' | 'right') => void;
  userGender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  sessionId?: string;
  onBack?: () => void;
}

export function VisualPreferenceStep({ onComplete, onSwipe, userGender }: VisualPreferenceStepProps) {
  const [moodPhotos, setMoodPhotos] = useState<MoodPhoto[]>([]);
  const [allPhotos, setAllPhotos] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [novaInsight, setNovaInsight] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ photo: MoodPhoto; direction: 'left' | 'right'; index: number }>>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasAdapted, setHasAdapted] = useState(false);
  const { user } = useUser();
  const analyzerRef = useRef(new SwipeAnalyzer());

  useEffect(() => {
    loadMoodPhotos();
  }, [userGender]);

  const determineGenderForQuery = (gender?: string): 'male' | 'female' | null => {
    if (!gender) return null;
    if (gender === 'male') return 'male';
    if (gender === 'female') return 'female';
    return null;
  };

  const loadMoodPhotos = async () => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        console.warn('⚠️ Supabase client not available, using placeholders');
        throw new Error('Supabase not available');
      }

      const genderForQuery = determineGenderForQuery(userGender);

      if (!genderForQuery) {
        console.error('❌ CRITICAL: No valid gender provided for mood photos');
        throw new Error('Gender is required for mood photos');
      }

      console.log(`🎯 Loading mood photos for gender: ${genderForQuery}`);

      const { data, error } = await client
        .from('mood_photos')
        .select('*')
        .eq('active', true)
        .eq('gender', genderForQuery)
        .order('display_order', { ascending: true })
        .limit(MAX_SWIPES);

      if (error) {
        console.error('❌ Error fetching mood photos:', error);
        throw error;
      }

      let photos = data || [];

      console.log(`📸 Loaded ${photos.length} photos for ${genderForQuery}`);

      const genderMismatch = photos.filter(p => p.gender !== genderForQuery);
      if (genderMismatch.length > 0) {
        console.error(`❌ CRITICAL: ${genderMismatch.length} photos have wrong gender!`, genderMismatch);
        photos = photos.filter(p => p.gender === genderForQuery);
      }

      if (photos.length < MAX_SWIPES) {
        console.warn(`⚠️ Only ${photos.length} photos for ${genderForQuery} - adding unisex`);

        const { data: unisexData } = await client
          .from('mood_photos')
          .select('*')
          .eq('active', true)
          .eq('gender', 'unisex')
          .order('display_order', { ascending: true })
          .limit(MAX_SWIPES - photos.length);

        if (unisexData && unisexData.length > 0) {
          console.log(`📦 Adding ${unisexData.length} unisex photos as fallback`);
          photos = [...photos, ...unisexData];
        } else {
          console.error(`❌ CRITICAL: Not enough photos! Only ${photos.length} available`);
        }
      }

      console.log(`✅ Final photo count: ${photos.length} photos for ${genderForQuery}`);

      if (photos.length === 0) {
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
        setAllPhotos(placeholderPhotos);
        setMoodPhotos(placeholderPhotos.slice(0, 10));
      } else {
        setAllPhotos(photos);
        setMoodPhotos(photos);
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

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;

    const lastSwipe = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastSwipe.index);
    setSwipeCount(prev => prev - 1);

  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = moodPhotos[currentIndex];
    if (!currentPhoto) return;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    setSwipeHistory(prev => [...prev, {
      photo: currentPhoto,
      direction,
      index: currentIndex
    }]);

    const swipeRecord: StyleSwipe = {
      user_id: user?.id,
      session_id: !user ? (sessionStorage.getItem('fitfi_session_id') || crypto.randomUUID()) : undefined,
      mood_photo_id: currentPhoto.id,
      swipe_direction: direction,
      response_time_ms: responseTimeMs
    };

    analyzerRef.current.addSwipe(currentPhoto, swipeRecord);

    // Save swipe to database (fire-and-forget, don't block UX)
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
      } else {
        console.warn('⚠️ Swipe not saved - Supabase unavailable (will work locally)');
      }

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

    // ADAPTIVE LOADING: After swipe 3, adapt remaining photos
    if (newSwipeCount === 3 && !hasAdapted && allPhotos.length > 0) {
      const pattern = analyzerRef.current.getPattern();

      if (pattern.shouldAdapt) {
        console.log('🎯 Adapting photos based on pattern:', pattern.topArchetypes);

        const alreadyShownIds = moodPhotos.slice(0, 3).map(p => p.id);
        const adaptivePhotos = loadAdaptivePhotos({
          pattern,
          gender: userGender || 'male',
          excludeIds: alreadyShownIds,
          count: 7,
          allPhotos
        });

        setMoodPhotos([...moodPhotos.slice(0, 3), ...adaptivePhotos]);
        setHasAdapted(true);

        const adaptationMessage = generateAdaptationInsight(pattern);
        if (adaptationMessage) {
          setTimeout(() => {
            setNovaInsight(adaptationMessage);
          }, 800);
        }

        console.log('✅ Loaded', adaptivePhotos.length, 'adaptive photos');
      }
    }

    // Move to next photo
    if (currentIndex < moodPhotos.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // All photos swiped - complete!
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onComplete();
      }, 2000);
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

  return (
    <>
      <AnimatePresence>
        {novaInsight && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 max-w-md w-full safe-top">
            <NovaBubble
              message={novaInsight}
              onDismiss={() => setNovaInsight(null)}
              autoHideDuration={4000}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center px-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-4"
              >
                <PartyPopper className="w-20 h-20 text-green-400 mx-auto" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Perfect! 🎉
              </h3>
              <p className="text-white/80 text-lg">
                Je stijlprofiel is compleet!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentPhoto && (
          <TinderSwipeCard
            key={currentPhoto.id}
            imageUrl={currentPhoto.image_url}
            onSwipe={handleSwipe}
            index={currentIndex}
            total={moodPhotos.length}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Deze stap overslaan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Je kunt je stijlvoorkeuren later altijd verfijnen via het dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Terug
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  Overslaan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo button - floating bottom left */}
      <AnimatePresence>
        {swipeHistory.length > 0 && !showSkipConfirm && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleUndo}
            className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center hover:scale-110 transition-transform safe-bottom"
          >
            <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip button - floating bottom right */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setShowSkipConfirm(true)}
        className="fixed bottom-24 right-4 z-40 px-4 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center gap-2 hover:scale-105 transition-transform safe-bottom"
      >
        <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overslaan</span>
      </motion.button>
    </>
  );
}
