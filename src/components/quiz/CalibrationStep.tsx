import { useState, useEffect } from 'react';
import { OutfitCalibrationCard } from './OutfitCalibrationCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { CalibrationService } from '@/services/visualPreferences/calibrationService';
import { VisualPreferenceService } from '@/services/visualPreferences/visualPreferenceService';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';

interface CalibrationStepProps {
  onComplete: () => void;
  quizData?: any;
}

export function CalibrationStep({ onComplete, quizData }: CalibrationStepProps) {
  const [outfits, setOutfits] = useState<CalibrationOutfit[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'spot_on' | 'not_for_me' | 'maybe'>>({});
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadCalibrationOutfits();
  }, []);

  const loadCalibrationOutfits = async () => {
    try {
      const userId = user?.id;
      const sessionId = sessionStorage.getItem('fitfi_session_id');

      // Fetch visual preference embedding
      const embedding = await VisualPreferenceService.getVisualEmbeddingFromProfile(
        userId,
        sessionId || undefined
      );

      if (!embedding || Object.keys(embedding).length === 0) {
        console.warn('No visual preferences found, using defaults');
        // Use default embedding
        const defaultEmbedding = {
          minimal: 70,
          classic: 60,
          casual: 50
        };
        const generatedOutfits = CalibrationService.generateCalibrationOutfits(
          defaultEmbedding,
          quizData
        );
        setOutfits(generatedOutfits);
      } else {
        const generatedOutfits = CalibrationService.generateCalibrationOutfits(
          embedding,
          quizData
        );
        setOutfits(generatedOutfits);
      }
    } catch (err) {
      console.error('Failed to load calibration outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (
    outfitId: string,
    feedbackType: 'spot_on' | 'not_for_me' | 'maybe',
    responseTimeMs: number
  ) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    setFeedback(prev => ({ ...prev, [outfitId]: feedbackType }));

    try {
      const userId = user?.id;
      const sessionId = sessionStorage.getItem('fitfi_session_id');

      await CalibrationService.recordFeedback({
        user_id: userId || undefined,
        session_id: sessionId || undefined,
        outfit_data: outfit.items,
        feedback: feedbackType,
        response_time_ms: responseTimeMs,
        outfit_archetypes: outfit.archetypes,
        dominant_colors: outfit.dominantColors,
        occasion: outfit.occasion
      });
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  const handleContinue = async () => {
    setApplying(true);

    try {
      const userId = user?.id;
      const sessionId = sessionStorage.getItem('fitfi_session_id');

      // Apply calibration to profile
      await CalibrationService.applyCalibrationToProfile(
        userId,
        !userId ? sessionId || undefined : undefined
      );

      // Short delay for UI feedback
      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (err) {
      console.error('Failed to apply calibration:', err);
      setApplying(false);
    }
  };

  const allRated = outfits.length > 0 && outfits.every(o => feedback[o.id]);
  const feedbackCount = Object.keys(feedback).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--ff-color-primary-700)] rounded-full animate-spin" />
          <p className="mt-4 text-[var(--color-muted)]">Outfits voorbereiden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--overlay-accent-08a)] border border-[var(--color-border)] mb-4">
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            Outfit Calibratie
          </span>
        </div>

        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">
          Zo ziet jouw stijl er volgens mij uit
        </h2>
        <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
          Nova heeft 3 outfits voor je samengesteld op basis van je swipes. Geef feedback zodat we je stijl perfect kunnen afstemmen.
        </p>

        {feedbackCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">
              {feedbackCount} van {outfits.length} beoordeeld
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6 mb-8">
        {outfits.map((outfit, index) => (
          <OutfitCalibrationCard
            key={outfit.id}
            outfit={outfit}
            onFeedback={(feedbackType, responseTimeMs) =>
              handleFeedback(outfit.id, feedbackType, responseTimeMs)
            }
            disabled={applying}
          />
        ))}
      </div>

      {allRated && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={applying}
            className="ff-btn ff-btn-primary inline-flex items-center gap-2 px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Profiel aanpassen...
              </>
            ) : (
              <>
                Doorgaan naar resultaten
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-[var(--color-muted)] mt-3">
            Je feedback wordt gebruikt om je aanbevelingen te verfijnen
          </p>
        </div>
      )}

      {!allRated && feedbackCount > 0 && (
        <div className="text-center">
          <p className="text-sm text-[var(--color-muted)]">
            Beoordeel alle outfits om door te gaan
          </p>
        </div>
      )}
    </div>
  );
}
