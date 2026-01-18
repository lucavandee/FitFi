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
        className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-[var(--color-bg)] to-slate-50"
      >
        <div className="text-center px-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[var(--ff-color-primary-600)]" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-[var(--ff-color-text)] mb-2 tracking-tight"
          >
            Stijlbeelden laden...
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[var(--color-muted)]"
          >
            We verzamelen inspiratie voor jou
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[var(--ff-color-primary-600)]/95 to-[var(--ff-color-accent-600)]/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="text-center px-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                className="mb-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PartyPopper className="w-14 h-14 text-white" strokeWidth={2} />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Perfect!
              </h3>
              <p className="text-white/90 text-lg font-medium">
                Je stijlprofiel is compleet
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-2xl font-bold text-[var(--ff-color-text)] mb-3 tracking-tight">
                Deze stap overslaan?
              </h3>
              <p className="text-[var(--color-muted)] mb-8 leading-relaxed">
                We raden aan deze stap te voltooien voor de beste stijlaanbevelingen. Je kunt dit later ook nog doen via je dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 px-6 py-3.5 border-2 border-slate-200 rounded-2xl text-[var(--ff-color-text)] hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 font-semibold"
                >
                  Terug
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Overslaan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
