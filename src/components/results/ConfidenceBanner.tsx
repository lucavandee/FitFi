import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, TrendingUp, Sparkles } from 'lucide-react';
import type { ConfidenceAnalysis } from '@/services/quiz/confidenceAnalyzer';

interface ConfidenceBannerProps {
  analysis: ConfidenceAnalysis;
  className?: string;
}

/**
 * ConfidenceBanner - Toont confidence/ambiguity waarschuwing op results page
 *
 * Communicatie: Transparant over diffuse/inconsistente input
 *
 * Features:
 * - Visueel onderscheid: high/medium/low confidence
 * - Lekentaal uitleg
 * - Actionable recommendations
 * - Dismissable (localStorage remember)
 */
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
    } catch (e) {
      console.warn('Could not save dismiss state:', e);
    }
  };

  // Don't show banner if high confidence
  if (analysis.overallConfidence >= 75 || isDismissed) {
    return null;
  }

  // Determine banner style based on confidence level
  const getBannerStyle = () => {
    if (analysis.overallConfidence >= 60) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Info,
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-800',
        title: 'Veelzijdig Stijlprofiel'
      };
    }

    if (analysis.isAmbiguous) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: AlertCircle,
        iconColor: 'text-amber-600',
        titleColor: 'text-amber-900',
        textColor: 'text-amber-800',
        title: 'Eclectische Stijl Gedetecteerd'
      };
    }

    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      textColor: 'text-orange-800',
      title: 'Flexibel Stijlprofiel'
    };
  };

  const style = getBannerStyle();
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`${style.bg} border ${style.border} rounded-xl sm:rounded-2xl p-3 sm:p-6 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${style.iconColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm sm:text-lg font-bold ${style.titleColor} mb-1.5 sm:mb-2`}>
            {style.title}
          </h3>

          <div className={`text-xs sm:text-base ${style.textColor} space-y-2 mb-3 sm:mb-4`}>
            <p className="leading-relaxed">
              {analysis.explanation}
            </p>

            {/* Confidence breakdown - Responsive */}
            <div className="flex flex-wrap gap-1.5 sm:gap-3 pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-full text-[10px] sm:text-sm font-medium">
                <span className="opacity-70">Stijl:</span>
                <span className="font-bold">{Math.round(analysis.styleConfidence)}%</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-full text-[10px] sm:text-sm font-medium">
                <span className="opacity-70">Kleur:</span>
                <span className="font-bold">{Math.round(analysis.colorConfidence)}%</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-full text-[10px] sm:text-sm font-medium">
                <span className="opacity-70">Overall:</span>
                <span className="font-bold">{Math.round(analysis.overallConfidence)}%</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className={`text-xs sm:text-sm font-semibold ${style.titleColor} flex items-center gap-1 sm:gap-1.5`}>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Onze aanbeveling:
              </h4>
              <ul className={`space-y-1 sm:space-y-1.5 ${style.textColor}`}>
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs sm:text-sm flex items-start gap-1.5 sm:gap-2">
                    <span className="text-sm sm:text-lg leading-none mt-0.5">•</span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Close Button - Touch friendly */}
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 rounded-full hover:bg-white/50 active:bg-white/70 transition-colors flex items-center justify-center ${style.iconColor} touch-manipulation`}
          aria-label="Sluit melding"
        >
          <span className="text-xl sm:text-xl leading-none">×</span>
        </button>
      </div>

      {/* Call to Action - Compact on mobile */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/50">
        <p className={`text-[10px] sm:text-sm ${style.textColor} opacity-80 leading-snug sm:leading-normal`}>
          💡 <strong>Tip:</strong> De outfits hieronder zijn een mix van verschillende stijlen om je te helpen ontdekken wat je het beste staat. Experimenteer gerust!
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function ConfidenceBadge({ analysis }: { analysis: ConfidenceAnalysis }) {
  if (analysis.overallConfidence >= 75) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        <span className="text-sm">✓</span>
        <span>Duidelijk profiel</span>
      </div>
    );
  }

  if (analysis.overallConfidence >= 60) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        <span className="text-sm">○</span>
        <span>Veelzijdig profiel</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
      <span className="text-sm">◐</span>
      <span>Eclectische stijl</span>
    </div>
  );
}
