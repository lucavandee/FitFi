import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SwipeCard } from './SwipeCard';
import { ImagePreloader } from './ImagePreloader';
import { StyleAnalysisTransition } from './StyleAnalysisTransition';
import { Sparkles, Loader as Loader2, SkipForward } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';
import { loadAdaptivePhotos } from '@/services/visualPreferences/adaptiveLoader';
import type { MoodPhoto, StyleSwipe } from '@/services/visualPreferences/visualPreferenceService';

const INITIAL_BATCH = 10;
const NEXT_BATCH_SIZE = 8;
const MIN_SWIPES_TO_COMPLETE = 15;
const ADAPT_AFTER_SWIPES = 7;

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: string, direction: 'left' | 'right') => void;
  userGender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
}

export function VisualPreferenceStepClean({ onComplete, onSwipe, userGender }: VisualPreferenceStepProps) {
  const [allPhotos, setAllPhotos] = useState<MoodPhoto[]>([]);
  const [queue, setQueue] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const swipingRef = useRef(false);
  const analyzerRef = useRef(new SwipeAnalyzer());
  const seenIdsRef = useRef<Set<number>>(new Set());
  const { user } = useUser();

  useEffect(() => {
    loadAllPhotos();
  }, [userGender]);

  useEffect(() => {
    if (showCelebration || loading || queue.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      const current = queue[currentIndex];
      if (!current) return;
      if (e.key === 'ArrowLeft') handleSwipe('left', 0);
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') handleSwipe('right', 0);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, queue, showCelebration, loading]);

  const loadAllPhotos = async () => {
    try {
      const { VisualPreferenceService } = await import('@/services/visualPreferences/visualPreferenceService');
      const photos = await VisualPreferenceService.getAllMoodPhotos(userGender, true);
      setAllPhotos(photos);
      const initial = photos.slice(0, INITIAL_BATCH);
      initial.forEach(p => seenIdsRef.current.add(p.id));
      setQueue(initial);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load mood photos:', err);
      setLoading(false);
    }
  };

  const loadNextBatch = (currentSwipeCount: number) => {
    const pattern = analyzerRef.current.getPattern();
    const seenIds = Array.from(seenIdsRef.current);

    const nextPhotos = loadAdaptivePhotos({
      pattern,
      gender: userGender || 'unisex',
      excludeIds: seenIds,
      count: NEXT_BATCH_SIZE,
      allPhotos,
    });

    if (nextPhotos.length === 0) return;

    nextPhotos.forEach(p => seenIdsRef.current.add(p.id));
    setQueue(prev => [...prev, ...nextPhotos]);
  };

  const handleSwipe = async (direction: 'left' | 'right', responseTimeMs: number) => {
    const currentPhoto = queue[currentIndex];
    if (!currentPhoto || showCelebration || swipingRef.current) return;
    swipingRef.current = true;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    const swipeRecord: StyleSwipe = {
      mood_photo_id: currentPhoto.id as unknown as number,
      swipe_direction: direction,
      response_time_ms: responseTimeMs,
    };
    analyzerRef.current.addSwipe(currentPhoto as unknown as import('@/services/visualPreferences/visualPreferenceService').MoodPhoto, swipeRecord);

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
          response_time_ms: responseTimeMs,
        });
      }
      onSwipe?.(currentPhoto.id as unknown as string, direction);
    } catch (err) {
      console.warn('Failed to save swipe:', err);
    }

    const isLastInQueue = newSwipeCount >= queue.length;
    const hasMorePhotos = seenIdsRef.current.size < allPhotos.length;
    const metMinimum = newSwipeCount >= MIN_SWIPES_TO_COMPLETE;

    if (newSwipeCount === ADAPT_AFTER_SWIPES && hasMorePhotos) {
      loadNextBatch(newSwipeCount);
    }

    if (isLastInQueue && !hasMorePhotos) {
      setShowCelebration(true);
      swipingRef.current = false;
      return;
    }

    if (isLastInQueue && hasMorePhotos) {
      loadNextBatch(newSwipeCount);
    }

    if (metMinimum && !canComplete) {
      setCanComplete(true);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      swipingRef.current = false;
    }, 100);
  };

  const handleFinishEarly = () => {
    if (canComplete) {
      setShowCelebration(true);
    }
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

  if (queue.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-muted)] mb-4">Geen stijlbeelden beschikbaar</p>
        <button onClick={onComplete} className="ff-btn ff-btn-primary">
          Doorgaan
        </button>
      </div>
    );
  }

  const currentPhoto = queue[currentIndex];
  const totalAvailable = allPhotos.length;
  const progress = Math.min((swipeCount / Math.max(totalAvailable, MIN_SWIPES_TO_COMPLETE)) * 100, 100);
  const imageUrls = queue.map(p => p.image_url);
  const storageDomain = (() => {
    try {
      return imageUrls.length > 0 ? new URL(imageUrls[0]).origin : '';
    } catch {
      return '';
    }
  })();

  return (
    <div
      className="flex flex-col bg-[var(--color-bg)] overflow-hidden"
      style={{ height: 'calc(100dvh - 56px)', minHeight: 0 }}
    >
      {storageDomain && (
        <Helmet>
          <link rel="preconnect" href={storageDomain} />
          <link rel="dns-prefetch" href={storageDomain} />
        </Helmet>
      )}

      {queue.length > 0 && (
        <ImagePreloader imageUrls={imageUrls} currentIndex={currentIndex} lookahead={3} />
      )}

      <StyleAnalysisTransition
        isVisible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          onComplete();
        }}
      />

      {/* ── MOBILE layout (< sm) ── */}
      <div className="sm:hidden flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <h2 className="text-base font-bold text-[var(--color-text)] mb-0.5">
            Welke stijl spreekt je aan?
          </h2>
          <p className="text-xs text-[var(--color-muted)] mb-2">
            <strong className="text-[var(--color-text)]">Swipe</strong> door de foto's — hoe meer, hoe beter je resultaat
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-[var(--color-muted)] flex-shrink-0 tabular-nums">
              {swipeCount}/{totalAvailable}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-3 min-h-0 pt-1 overflow-hidden">
          <div className="w-full max-w-[340px] flex flex-col items-center h-full min-h-0">
            <AnimatePresence mode="popLayout">
              {currentPhoto && (
                <SwipeCard
                  key={currentPhoto.id}
                  imageUrl={currentPhoto.image_url}
                  onSwipe={handleSwipe}
                  index={currentIndex}
                  total={queue.length}
                  variant="mobile"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pt-1 pb-3 flex flex-col gap-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          {canComplete ? (
            <button
              onClick={handleFinishEarly}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-[var(--ff-color-primary-700)] transition-all"
              style={{ background: 'var(--ff-color-primary-50)', border: '1.5px solid var(--ff-color-primary-200)' }}
            >
              Klaar — bekijk mijn stijlprofiel
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="w-full py-2 rounded-xl text-xs font-medium text-[var(--color-muted)] transition-all flex items-center justify-center gap-1.5 hover:text-[var(--color-text)]"
              aria-label="Sla visuele stap over"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
              Sla deze stap over
            </button>
          )}
          <p className="text-center text-xs text-[var(--color-muted)]">
            Tik op de knoppen of sleep de foto
          </p>
        </div>
      </div>

      {/* ── DESKTOP layout (≥ sm) ── */}
      <div className="hidden sm:flex h-full">
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-[420px] lg:max-w-[460px]">
            <AnimatePresence mode="popLayout">
              {currentPhoto && (
                <SwipeCard
                  key={currentPhoto.id}
                  imageUrl={currentPhoto.image_url}
                  onSwipe={handleSwipe}
                  index={currentIndex}
                  total={queue.length}
                  variant="desktop"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col justify-center px-8 lg:px-12 border-l"
          style={{ borderColor: 'var(--color-border)' }}
        >
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
            <strong className="text-[var(--color-text)] font-semibold">Laatste stap!</strong> Swipe door de foto's — Nova leert van elke keuze en past de selectie aan.
          </p>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">{Math.round(progress)}% compleet</span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
              >
                {swipeCount} / {totalAvailable}
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
            {canComplete && (
              <p className="text-xs text-[var(--ff-color-primary-700)] mt-1.5 font-medium">
                Genoeg data verzameld — je kunt nu afronden of doorgaan voor nog betere resultaten
              </p>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => { const p = queue[currentIndex]; if (p) handleSwipe('left', 0); }}
              className="flex-1 group flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}
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

            <button
              onClick={() => { const p = queue[currentIndex]; if (p) handleSwipe('right', 0); }}
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

          {canComplete ? (
            <button
              onClick={handleFinishEarly}
              className="w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'var(--ff-color-primary-700)',
                color: 'var(--color-bg)',
              }}
            >
              Klaar — bekijk mijn stijlprofiel
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-xl text-sm font-medium mb-6 flex items-center justify-center gap-2 transition-all hover:bg-[var(--ff-color-primary-50)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
              style={{ border: '1px solid var(--color-border)' }}
              aria-label="Sla visuele stap over"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
              Sla deze stap over
            </button>
          )}

          <div
            className="rounded-xl px-5 py-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">Sneltoetsen</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Niet mijn stijl</span>
                <kbd className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}>←</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Spreekt me aan</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}>→</kbd>
                  <span className="text-[10px] text-[var(--color-muted)]">of</span>
                  <kbd className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}>Space</kbd>
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
