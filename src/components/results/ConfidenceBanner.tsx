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
      className={`border border-[#E5E5E5] bg-[#FAF5F2] rounded-2xl p-4 sm:p-6 ${className}`}
      role="note"
      aria-label="Toelichting bij je stijlprofiel"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center">
            <Info className="w-5 h-5 text-[#C2654A]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-2">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-[#8A8A8A] leading-relaxed mb-4">
            {analysis.explanation}
          </p>

          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C2654A]" />
                Suggestie
              </h4>
              <ul className="space-y-1.5 text-[#8A8A8A]">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="leading-none mt-1 text-[#D4856E]">–</span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#E5E5E5] transition-colors flex items-center justify-center text-[#8A8A8A]"
          aria-label="Sluit toelichting"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
        <p className="text-xs sm:text-sm text-[#8A8A8A]">
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
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E5]"
        style={{ background: '#FAF5F2', color: '#A8513A' }}
      >
        <span>✓</span>
        <span>Duidelijk profiel</span>
      </div>
    );
  }

  if (analysis.overallConfidence >= 60) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E5]"
        style={{ background: '#FAF5F2', color: '#A8513A' }}
      >
        <span>○</span>
        <span>Veelzijdig profiel</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E5]"
      style={{ background: '#FAF5F2', color: '#C2654A' }}
    >
      <span>◐</span>
      <span>Brede stijlvoorkeur</span>
    </div>
  );
}
