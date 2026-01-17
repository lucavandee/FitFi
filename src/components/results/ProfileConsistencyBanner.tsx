import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, RefreshCcw, X } from "lucide-react";
import type { ConsistencyAnalysis } from "@/engine/profileConsistency";

interface ProfileConsistencyBannerProps {
  analysis: ConsistencyAnalysis;
  onRetakeQuiz?: () => void;
  onDismiss?: () => void;
}

/**
 * Banner die gebruikers informeert over hun profiel-consistentie
 * en guidance geeft bij gemengde profielen
 */
export function ProfileConsistencyBanner({
  analysis,
  onRetakeQuiz,
  onDismiss
}: ProfileConsistencyBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Toon alleen als nodig
  if (!analysis.shouldShowBanner || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Bepaal styling op basis van level
  const getBannerStyle = () => {
    switch (analysis.level) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-300',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100',
          textColor: 'text-green-900',
          mutedColor: 'text-green-700',
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-300',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100',
          textColor: 'text-blue-900',
          mutedColor: 'text-blue-700',
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          border: 'border-amber-300',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-100',
          textColor: 'text-amber-900',
          mutedColor: 'text-amber-700',
        };
    }
  };

  const style = getBannerStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${style.bg} ${style.border} border-2 rounded-2xl p-4 md:p-5 mb-6 relative overflow-hidden`}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 transition-colors"
          aria-label="Sluit banner"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          {/* Icon */}
          <div className={`${style.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
            {style.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            <h3 className={`font-bold text-lg ${style.textColor} mb-2`}>
              {analysis.level === 'high' && "Consistent Stijlprofiel"}
              {analysis.level === 'medium' && "Gemengd Stijlprofiel"}
              {analysis.level === 'low' && "Diverse Stijlvoorkeuren"}
            </h3>

            {/* Guidance text */}
            <p className={`text-sm ${style.mutedColor} leading-relaxed mb-3`}>
              {analysis.guidance}
            </p>

            {/* Top archetypes display */}
            {analysis.topArchetypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {analysis.topArchetypes.map((archetype, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full border border-gray-200"
                  >
                    <span className="text-xs font-semibold text-gray-900">
                      {archetype.name}
                    </span>
                    <span className="text-[10px] font-medium text-gray-600">
                      {archetype.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Consistency score visual */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  Profiel Consistentie
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {analysis.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    analysis.level === 'high'
                      ? 'bg-green-500'
                      : analysis.level === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            {analysis.level === 'low' && onRetakeQuiz && (
              <button
                onClick={onRetakeQuiz}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-900 transition-all hover:scale-105"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Quiz opnieuw doen</span>
              </button>
            )}

            {/* Helpful tip for medium consistency */}
            {analysis.level === 'medium' && (
              <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Tip:</strong> De outfits hieronder zijn gelabeld per stijl.
                  Gebruik de filters om alleen outfits van één stijlrichting te zien.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative element */}
        <div
          className="absolute bottom-0 right-0 w-32 h-32 opacity-10"
          style={{
            background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
