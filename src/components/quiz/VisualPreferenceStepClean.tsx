import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SwipeCard } from './SwipeCard';
import { ImagePreloader } from './ImagePreloader';
import { StyleAnalysisTransition } from './StyleAnalysisTransition';
import { Sparkles, Loader as Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (showCelebration || loading || moodPhotos.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      const currentPhoto = moodPhotos[currentIndex];
      if (!currentPhoto) return;
      if (e.key === 'ArrowLeft') {
        handleSwipe('left', 0);
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        handleSwipe('right', 0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, moodPhotos, showCelebration, loading]);

  const loadMoodPhotos = async () => {
    try {
      const { VisualPreferenceService } = await import('@/services/visualPreferences/visualPreferenceService');
      const photos = await VisualPreferenceService.getMoodPhotos(15, userGender);
      if (photos.length === 0) {
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

    const newSwipeCount = swipeCount + 1;
    const isLastSwipe = newSwipeCount >= moodPhotos.length;

    setSwipeCount(newSwipeCount);

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

    if (isLastSwipe) {
      setShowCelebration(true);
      return;
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-bg)] fixed inset-0">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[var(--ff-color-primary-700)] animate-spin" />
            <p className="text-sm font-medium text-[var(--color-text)]">Stijlbeelden laden...</p>
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
  const imageUrls = moodPhotos.map(photo => photo.image_url);
  const storageDomain = imageUrls.length > 0 ? new URL(imageUrls[0]).origin : '';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)] fixed inset-0">
      {storageDomain && (
        <Helmet>
          <link rel="preconnect" href={storageDomain} />
          <link rel="dns-prefetch" href={storageDomain} />
        </Helmet>
      )}

      {!loading && moodPhotos.length > 0 && (
        <ImagePreloader imageUrls={imageUrls} currentIndex={currentIndex} lookahead={2} />
      )}

      <StyleAnalysisTransition
        isVisible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          onComplete();
        }}
      />

      {/* ── MOBILE layout (< sm) ── */}
      <div className="sm:hidden flex flex-col h-full">
        {/* Mobile Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" />
            <span className="text-xs font-medium text-[var(--color-text)]">Visuele Voorkeuren</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">
            Welke stijl spreekt je aan?
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            <strong className="text-[var(--color-text)]">Laatste stap!</strong> {moodPhotos.length} outfits
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[var(--color-text)]">{Math.round(progress)}% compleet</span>
              <span className="text-xs text-[var(--color-muted)]">{swipeCount} / {moodPhotos.length}</span>
            </div>
            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Swipe Area */}
        <div className="flex-1 flex items-center justify-center px-4 min-h-0">
          <div className="w-full max-w-[360px] h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {currentPhoto && (
                <SwipeCard
                  key={currentPhoto.id}
                  imageUrl={currentPhoto.image_url}
                  onSwipe={handleSwipe}
                  index={currentIndex}
                  total={moodPhotos.length}
                  variant="mobile"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 px-4 pb-6 pt-2">
          <p className="text-center text-xs text-[var(--color-muted)]">
            Tik op de knoppen of sleep de foto
          </p>
        </div>
      </div>

      {/* ── DESKTOP layout (≥ sm) — twee kolommen ── */}
      <div className="hidden sm:flex h-full">

        {/* Linker kolom: kaart */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-[420px] lg:max-w-[460px]">
            <AnimatePresence mode="popLayout">
              {currentPhoto && (
                <SwipeCard
                  key={currentPhoto.id}
                  imageUrl={currentPhoto.image_url}
                  onSwipe={handleSwipe}
                  index={currentIndex}
                  total={moodPhotos.length}
                  variant="desktop"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rechter kolom: header + progress + knoppen + instructies */}
        <div
          className="w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col justify-center px-8 lg:px-12 border-l"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 self-start"
            style={{
              background: 'var(--overlay-accent-08a)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
            <span className="text-sm font-semibold text-[var(--color-text)]">Visuele Voorkeuren</span>
          </div>

          <h2
            className="font-heading font-bold tracking-tight mb-2"
            style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)', lineHeight: 1.1, color: 'var(--color-text)' }}
          >
            Welke stijl spreekt je aan?
          </h2>

          <p className="text-sm text-[var(--color-muted)] mb-8">
            <strong className="text-[var(--color-text)] font-semibold">Laatste stap!</strong> Swipe door {moodPhotos.length} outfits en geef aan wat bij jou past.
          </p>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">{Math.round(progress)}% compleet</span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
              >
                {swipeCount} / {moodPhotos.length}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-primary-700))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Actie-knoppen */}
          <div className="flex gap-4 mb-8">
            {/* Dislike */}
            <button
              onClick={() => {
                const currentPhoto = moodPhotos[currentIndex];
                if (currentPhoto) handleSwipe('left', 0);
              }}
              className="flex-1 group flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
              }}
              aria-label="Niet mijn stijl"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-red-50"
                style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.25)' }}
              >
                <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors">
                Niet mijn stijl
              </span>
            </button>

            {/* Like */}
            <button
              onClick={() => {
                const currentPhoto = moodPhotos[currentIndex];
                if (currentPhoto) handleSwipe('right', 0);
              }}
              className="flex-1 group flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.12) 100%)',
                border: '2px solid rgba(34,197,94,0.30)',
              }}
              aria-label="Spreekt me aan"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-green-50"
                style={{ background: 'rgba(34,197,94,0.10)', border: '2px solid rgba(34,197,94,0.30)' }}
              >
                <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-700 group-hover:text-green-800 transition-colors">
                Spreekt me aan
              </span>
            </button>
          </div>

          {/* Sneltoetsen */}
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">Sneltoetsen</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Niet mijn stijl</span>
                <kbd
                  className="px-2.5 py-1 text-xs font-bold rounded-lg"
                  style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  ←
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Spreekt me aan</span>
                <div className="flex items-center gap-1.5">
                  <kbd
                    className="px-2.5 py-1 text-xs font-bold rounded-lg"
                    style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    →
                  </kbd>
                  <span className="text-[10px] text-[var(--color-muted)]">of</span>
                  <kbd
                    className="px-2.5 py-1 text-xs font-bold rounded-lg"
                    style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    Space
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Sleep de foto</span>
                <span className="text-xs text-[var(--color-muted)]">← →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
