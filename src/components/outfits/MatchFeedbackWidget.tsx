import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitMatchFeedback, getUserFeedback } from '@/services/feedback/matchFeedbackService';
import toast from 'react-hot-toast';

interface MatchFeedbackWidgetProps {
  outfitId: string;
  shownScore: number;
  compact?: boolean;
}

export const MatchFeedbackWidget: React.FC<MatchFeedbackWidgetProps> = ({
  outfitId,
  shownScore,
  compact = false
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Load existing feedback
  useEffect(() => {
    getUserFeedback(outfitId).then(feedback => {
      if (feedback) {
        setRating(feedback.user_rating);
        setFeedbackText(feedback.feedback_text || '');
        setHasSubmitted(true);
      }
    });
  }, [outfitId]);

  const handleSubmit = async () => {
    if (rating === null) {
      toast.error('Selecteer eerst een rating');
      return;
    }

    setIsSubmitting(true);

    const result = await submitMatchFeedback({
      outfit_id: outfitId,
      shown_score: shownScore,
      user_rating: rating,
      feedback_text: feedbackText || undefined
    });

    setIsSubmitting(false);

    if (result.success) {
      setHasSubmitted(true);
      toast.success('Bedankt voor je feedback!');
    } else {
      toast.error('Kon feedback niet opslaan');
    }
  };

  if (hasSubmitted && compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Feedback gegeven</span>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[var(--radius-md)] p-4">
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Bedankt voor je feedback!</span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
          Je rating helpt ons onze aanbevelingen te verbeteren
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
          Hoe accuraat was deze match score?
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          We toonden: {shownScore}%
        </p>
      </div>

      {/* Star Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Beoordeel ${star} sterren`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                (hoveredStar !== null ? star <= hoveredStar : star <= (rating || 0))
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Optional Text Feedback */}
      {!showTextInput && !compact && (
        <button
          onClick={() => setShowTextInput(true)}
          className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-3"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Voeg opmerking toe (optioneel)</span>
        </button>
      )}

      {showTextInput && (
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Waarom vond je deze match score accuraat of niet?"
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm resize-none mb-3 bg-[var(--color-bg)] text-[var(--color-text)]"
          rows={3}
        />
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={rating === null || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Versturen...' : 'Verstuur feedback'}
      </Button>
    </div>
  );
};
