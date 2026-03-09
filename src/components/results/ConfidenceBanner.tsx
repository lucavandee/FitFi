import React from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles } from 'lucide-react';
import type { ConfidenceAnalysis } from '@/services/quiz/confidenceAnalyzer';

interface ConfidenceBannerProps {
  analysis: ConfidenceAnalysis;
  className?: string;
}

export function ConfidenceBanner({ analysis, className = '' }: ConfidenceBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    try {
      return localStorage.getItem('fitfi_confidence_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('fitfi_confidence_banner_dismissed', 'true');
    } catch {
    }
  };

  if (analysis.overallConfidence >= 75 || isDismissed) {
    return null;
  }

  const title = analysis.overallConfidence >= 60
    ? 'Veelzijdig stijlprofiel'
    : analysis.isAmbiguous
      ? 'Brede stijlvoorkeur'
      : 'Stijlprofiel op basis van je antwoorden';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`border border-[var(--color-border)] bg-[var(--ff-color-primary-50)] rounded-2xl p-4 sm:p-6 ${className}`}
      role="note"
      aria-label="Toelichting bij je stijlprofiel"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <Info className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-2">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-4">
            {analysis.explanation}
          </p>

          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                Suggestie
              </h4>
              <ul className="space-y-1.5 text-[var(--color-muted)]">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="leading-none mt-1 text-[var(--ff-color-primary-400)]">–</span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[var(--color-border)] transition-colors flex items-center justify-center text-[var(--color-muted)]"
          aria-label="Sluit toelichting"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs sm:text-sm text-[var(--color-muted)]">
          De outfits hieronder zijn afgestemd op de breedte van je voorkeuren. Je kunt altijd de quiz opnieuw doen voor een scherper profiel.
        </p>
      </div>
    </motion.div>
  );
}

export function ConfidenceBadge({ analysis }: { analysis: ConfidenceAnalysis }) {
  if (analysis.overallConfidence >= 75) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)]"
        style={{ background: 'var(--ff-color-primary-50)', color: 'var(--ff-color-primary-700)' }}
      >
        <span>✓</span>
        <span>Duidelijk profiel</span>
      </div>
    );
  }

  if (analysis.overallConfidence >= 60) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)]"
        style={{ background: 'var(--ff-color-primary-50)', color: 'var(--ff-color-primary-700)' }}
      >
        <span>○</span>
        <span>Veelzijdig profiel</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)]"
      style={{ background: 'var(--ff-color-primary-50)', color: 'var(--ff-color-primary-600)' }}
    >
      <span>◐</span>
      <span>Brede stijlvoorkeur</span>
    </div>
  );
}
