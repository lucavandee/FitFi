import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info, RefreshCcw, X } from "lucide-react";
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
          icon: <CheckCircle className="w-4 h-4 text-[#C2654A]" />,
          iconBg: 'bg-[#F4E8E3]',
        };
      case 'medium':
        return {
          icon: <Info className="w-4 h-4 text-[#D4913D]" />,
          iconBg: 'bg-[#D4913D]/10',
        };
      case 'low':
        return {
          icon: <AlertCircle className="w-4 h-4 text-[#D4913D]" />,
          iconBg: 'bg-[#D4913D]/10',
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
        className="bg-white border border-[#E5E5E5] rounded-2xl p-6 mb-6 relative overflow-hidden max-w-[800px] mx-auto"
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[#F5F0EB] flex items-center justify-center transition-colors"
          aria-label="Sluit banner"
        >
          <X className="w-4 h-4 text-[#8A8A8A]" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          {/* Icon */}
          <div className={`${style.iconBg} w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0`}>
            {style.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            <h3 className="font-bold text-base text-[#1A1A1A] mb-2">
              {analysis.level === 'high' && (
                analysis.topArchetypes.length > 0
                  ? `Consistent profiel — ${analysis.topArchetypes[0]?.name}`
                  : "Consistent Stijlprofiel"
              )}
              {analysis.level === 'medium' && (
                analysis.topArchetypes.length >= 2
                  ? `Mix van ${analysis.topArchetypes[0]?.name} en ${analysis.topArchetypes[1]?.name}`
                  : "Gemengd Stijlprofiel"
              )}
              {analysis.level === 'low' && (
                analysis.topArchetypes.length >= 2
                  ? `${analysis.topArchetypes[0]?.name} trekt, maar ook ${analysis.topArchetypes[1]?.name}`
                  : "Diverse Stijlvoorkeuren"
              )}
            </h3>

            {/* Guidance text */}
            <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">
              {analysis.guidance}
            </p>

            {/* Top archetypes display */}
            {analysis.topArchetypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {analysis.topArchetypes.map((archetype, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4E8E3] rounded-full border border-[#E5E5E5]"
                  >
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {archetype.name}
                    </span>
                    <span className="text-[10px] font-medium text-[#4A4A4A]">
                      {archetype.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Consistency score visual */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  Profiel Consistentie
                </span>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {analysis.score}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#C2654A]"
                />
              </div>
            </div>

            {/* Actions */}
            {analysis.level === 'low' && onRetakeQuiz && (
              <button
                onClick={onRetakeQuiz}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F5F0EB] border border-[#E5E5E5] hover:border-[#C2654A] rounded-full font-semibold text-sm text-[#1A1A1A] transition-all duration-200"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Quiz opnieuw doen</span>
              </button>
            )}

            {analysis.level === 'medium' && (
              <div className="p-4 bg-[#F5F0EB] rounded-xl">
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
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
