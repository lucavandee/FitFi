import { useState, useEffect } from 'react';
import { SwipeCard } from './SwipeCard';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/UserContext';

interface MoodPhoto {
  id: string;
  image_url: string;
  style_tags: string[];
  archetype_weights: Record<string, number>;
}

interface VisualPreferenceStepProps {
  onComplete: () => void;
  onSwipe?: (photoId: string, direction: 'left' | 'right') => void;
}

export function VisualPreferenceStep({ onComplete, onSwipe }: VisualPreferenceStepProps) {
  const [moodPhotos, setMoodPhotos] = useState<MoodPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const { user } = useAuth();

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

    setSwipeCount(prev => prev + 1);

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
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--ff-color-primary-700)] rounded-full animate-spin" />
          <p className="mt-4 text-[var(--color-muted)]">Beelden laden...</p>
        </div>
      </div>
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
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-4">
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            Visuele Voorkeuren
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Welke stijl spreekt je aan?
        </h2>
        <p className="text-[var(--color-muted)] max-w-md mx-auto">
          Swipe door 10 outfits. Dit helpt Nova om precies te begrijpen wat jouw perfecte stijl is.
        </p>

        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ff-color-primary-700)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-2">
            {swipeCount} van {moodPhotos.length}
          </p>
        </div>
      </div>

      <div className="relative h-[620px]">
        {currentPhoto && (
          <SwipeCard
            key={currentPhoto.id}
            imageUrl={currentPhoto.image_url}
            onSwipe={handleSwipe}
            index={currentIndex}
            total={moodPhotos.length}
          />
        )}
      </div>

      <div className="text-center mt-8 space-y-3">
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
      </div>
    </div>
  );
}
