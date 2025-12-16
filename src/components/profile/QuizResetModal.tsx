import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { profileSyncService } from '@/services/data/profileSyncService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface QuizResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArchetype?: string;
}

const RESET_REASONS = [
  { value: 'stijl_veranderd', label: 'Mijn stijl is veranderd' },
  { value: 'nieuwe_inspiratie', label: 'Ik heb nieuwe inspiratie opgedaan' },
  { value: 'resultaten_niet_goed', label: 'Resultaten klopten niet helemaal' },
  { value: 'nieuwsgierig', label: 'Gewoon nieuwsgierig naar nieuwe resultaten' },
  { value: 'anders', label: 'Andere reden' }
];

export function QuizResetModal({ isOpen, onClose, currentArchetype }: QuizResetModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReset = async () => {
    if (confirmText.toLowerCase() !== 'reset') {
      toast.error('Type "RESET" om te bevestigen');
      return;
    }

    if (!selectedReason) {
      toast.error('Selecteer een reden voor de reset (helpt ons om FitFi te verbeteren)');
      return;
    }

    setIsResetting(true);

    try {
      const reason = selectedReason === 'anders' && customReason
        ? customReason
        : RESET_REASONS.find(r => r.value === selectedReason)?.label;

      const result = await profileSyncService.archiveAndResetQuiz(reason);

      if (!result.success) {
        throw new Error(result.error || 'Reset failed');
      }

      const message = result.days_since_last_quiz
        ? `Quiz gereset! Je vorige profiel (${result.old_archetype || 'onbekend'}) na ${result.days_since_last_quiz} dagen is gearchiveerd.`
        : 'Quiz gereset! Je wordt doorgestuurd...';

      toast.success(message, {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        duration: 3000
      });

      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);

    } catch (error) {
      console.error('[QuizResetModal] Reset error:', error);
      toast.error(error instanceof Error ? error.message : 'Kon quiz niet resetten. Probeer het opnieuw.');
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-3xl max-w-lg w-full p-8 shadow-2xl border-2 border-[var(--color-border)] relative">
        <button
          onClick={onClose}
          disabled={isResetting}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5 text-[var(--color-muted)]" />
        </button>

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-6 mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-3">
          Quiz opnieuw doen?
        </h2>

        <p className="text-[var(--color-muted)] text-center mb-4 leading-relaxed">
          Je huidige profiel wordt <strong>gearchiveerd</strong> (niet verwijderd) en je kunt de quiz opnieuw doen.
        </p>

        {currentArchetype && (
          <div className="bg-[var(--ff-color-primary-50)] dark:bg-[var(--ff-color-primary-900)] rounded-xl p-3 mb-4 text-center border border-[var(--ff-color-primary-200)]">
            <p className="text-sm text-[var(--ff-color-primary-700)] dark:text-[var(--ff-color-primary-300)]">
              Huidig archetype: <strong>{currentArchetype}</strong>
            </p>
          </div>
        )}

        <div className="bg-[var(--color-bg)] rounded-xl p-4 mb-6 border border-[var(--color-border)]">
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-2">Wat blijft behouden:</h3>
          <ul className="space-y-1 text-sm text-[var(--color-muted)]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Je oude profiel (gearchiveerd voor vergelijking)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Account, email, subscription en tier
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Gamification voortgang en achievements
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Waarom wil je de quiz opnieuw doen? <span className="text-[var(--color-muted)]">(helpt ons)</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isResetting}
            className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:border-[var(--ff-color-primary-500)] transition-colors disabled:opacity-50"
          >
            <option value="">-- Selecteer een reden --</option>
            {RESET_REASONS.map(reason => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        {selectedReason === 'anders' && (
          <div className="mb-4">
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isResetting}
              placeholder="Typ je reden hier..."
              className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--ff-color-primary-500)] transition-colors disabled:opacity-50"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Type <strong>"RESET"</strong> om te bevestigen:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isResetting}
            placeholder="RESET"
            className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--ff-color-primary-500)] transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="flex-1 px-6 py-3 bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-surface)] transition-all border-2 border-[var(--color-border)] disabled:opacity-50"
          >
            Annuleren
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting || confirmText.toLowerCase() !== 'reset'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Resetten...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Reset Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
