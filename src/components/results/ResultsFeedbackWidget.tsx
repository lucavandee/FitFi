import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { track } from '@/utils/analytics';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';

interface ResultsFeedbackWidgetProps {
  archetype?: string;
  colorProfile?: any;
  onClose?: () => void;
  className?: string;
}

type FeedbackState = 'initial' | 'positive' | 'negative' | 'submitted';
type FeedbackRating = 'very_helpful' | 'helpful' | 'not_helpful' | null;

/**
 * ResultsFeedbackWidget - Vraagt gebruikers om feedback op Style Report
 *
 * Features:
 * - "Was dit nuttig?" vraag met duim omhoog/omlaag
 * - Optionele tekst feedback input
 * - Opslaan in database (results_feedback table)
 * - Analytics tracking
 * - Dismissable met localStorage remember
 */
export function ResultsFeedbackWidget({
  archetype,
  colorProfile,
  onClose,
  className = ''
}: ResultsFeedbackWidgetProps) {
  const { user } = useUser();
  const [state, setState] = useState<FeedbackState>('initial');
  const [rating, setRating] = useState<FeedbackRating>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  // Check if feedback was already given (localStorage)
  useEffect(() => {
    try {
      const key = 'fitfi_results_feedback_given';
      const timestamp = localStorage.getItem(key);

      if (timestamp) {
        // Check if it's been more than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (parseInt(timestamp) > thirtyDaysAgo) {
          // Don't show widget if feedback was given in last 30 days
          return;
        }
      }

      // Show widget after 5 seconds delay (user has time to see results)
      const timer = setTimeout(() => {
        setShowWidget(true);
      }, 5000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.warn('Could not check feedback status:', error);
    }
  }, []);

  const handleRating = (newRating: FeedbackRating) => {
    setRating(newRating);

    if (newRating === 'very_helpful' || newRating === 'helpful') {
      setState('positive');
      track('results_feedback_positive', { archetype, rating: newRating });
    } else {
      setState('negative');
      track('results_feedback_negative', { archetype, rating: newRating });
    }
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Selecteer eerst een beoordeling');
      return;
    }

    setIsSubmitting(true);

    try {
      const client = supabase();

      // Save to database (if user is logged in)
      if (client && user?.id) {
        const { error } = await client.from('results_feedback').insert({
          user_id: user.id,
          archetype: archetype || 'unknown',
          color_profile: colorProfile || {},
          rating,
          feedback_text: feedbackText.trim() || null,
          created_at: new Date().toISOString()
        });

        if (error) {
          console.error('Could not save feedback to database:', error);
          // Continue anyway - not critical
        }
      }

      // Track in analytics
      track('results_feedback_submitted', {
        archetype,
        rating,
        has_text: feedbackText.length > 0,
        user_id: user?.id || 'anonymous'
      });

      // Remember feedback was given (localStorage)
      try {
        localStorage.setItem('fitfi_results_feedback_given', Date.now().toString());
      } catch (e) {
        console.warn('Could not save feedback status:', e);
      }

      setState('submitted');
      toast.success('Bedankt voor je feedback!', { icon: '🙏', duration: 3000 });

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Feedback kon niet worden verzonden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowWidget(false);
    if (onClose) {
      onClose();
    }
  };

  const handleDismiss = () => {
    track('results_feedback_dismissed', { archetype, state });
    handleClose();
  };

  if (!showWidget) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`fixed bottom-4 right-4 z-50 max-w-md w-full mx-4 sm:mx-0 ${className}`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Hoe vind je je Style Report?
            </h3>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Sluit feedback widget"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {state === 'initial' && (
              <>
                <p className="text-[var(--color-text)] text-sm sm:text-base">
                  Herken je jezelf in dit advies?
                </p>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleRating('very_helpful')}
                    className="flex-1 flex flex-col items-center gap-2 px-3 py-3 sm:py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl hover:bg-green-50 hover:border-green-400 transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">Ja, helemaal!</span>
                  </button>

                  <button
                    onClick={() => handleRating('helpful')}
                    className="flex-1 flex flex-col items-center gap-2 px-3 py-3 sm:py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all active:scale-95"
                  >
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">Grotendeels</span>
                  </button>

                  <button
                    onClick={() => handleRating('not_helpful')}
                    className="flex-1 flex flex-col items-center gap-2 px-3 py-3 sm:py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl hover:bg-red-50 hover:border-red-400 transition-all active:scale-95"
                  >
                    <ThumbsDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">Niet echt</span>
                  </button>
                </div>
              </>
            )}

            {(state === 'positive' || state === 'negative') && (
              <>
                <div className="flex items-center gap-2 p-3 bg-[var(--ff-color-primary-50)] rounded-lg border border-[var(--ff-color-primary-200)]">
                  {state === 'positive' ? (
                    <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <ThumbsDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p className="text-sm text-[var(--color-text)]">
                    {state === 'positive'
                      ? 'Fijn om te horen! 🎉'
                      : 'Bedankt voor je feedback. Hoe kunnen we beter worden?'}
                  </p>
                </div>

                <div>
                  <label htmlFor="feedback-text" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Wil je nog iets toevoegen? (optioneel)
                  </label>
                  <textarea
                    id="feedback-text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={state === 'positive'
                      ? 'Wat vond je het beste aan het advies?'
                      : 'Wat kunnen we verbeteren?'
                    }
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    {feedbackText.length}/500 tekens
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface)] transition-colors text-sm font-medium"
                  >
                    Overslaan
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-[var(--ff-color-primary-600)] text-white rounded-lg hover:bg-[var(--ff-color-primary-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verzenden...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Verstuur</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {state === 'submitted' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                  Bedankt!
                </h4>
                <p className="text-sm text-[var(--color-muted)]">
                  Je feedback helpt ons om FitFi nog beter te maken.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
