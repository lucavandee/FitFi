import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Camera, TrendingUp, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StyleProfileConfidenceBadgeProps {
  dataSource: 'photo_analysis' | 'quiz+swipes' | 'quiz_only' | 'swipes_only' | 'fallback';
  confidence: number;
}

/**
 * StyleProfileConfidenceBadge - Shows user how reliable their Style DNA is
 *
 * Purpose:
 * - Transparency about data sources
 * - Manage expectations
 * - Encourage photo upload for better accuracy
 * - Build trust through honesty
 *
 * Three tiers:
 * 1. Photo Analysis - High confidence, objective data
 * 2. Quiz + Swipes - Medium confidence, preference data
 * 3. Quiz Only - Low confidence, minimal data
 */
export function StyleProfileConfidenceBadge({
  dataSource,
  confidence
}: StyleProfileConfidenceBadgeProps) {
  // Photo Analysis - Highest accuracy
  if (dataSource === 'photo_analysis') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C2654A]/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-[#C2654A]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
              Gebaseerd op jouw persoonlijke kleuranalyse
              <span className="text-xs px-2.5 py-1 bg-[#C2654A]/10 text-[#C2654A] rounded-full font-semibold">
                {Math.round(confidence * 100)}% accuraat
              </span>
            </h3>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              Dit profiel is gebaseerd op AI-analyse van jouw selfie. We hebben je ondertoon, seizoen en contrast
              objectief bepaald aan de hand van je huid, haar en ogen.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Quiz + Swipes - Medium accuracy
  if (dataSource === 'quiz+swipes') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#D4913D]/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-[#D4913D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
              Gebaseerd op jouw stijlvoorkeuren
              <span className="text-xs px-2.5 py-1 bg-[#D4913D]/10 text-[#D4913D] rounded-full font-semibold">
                {Math.round(confidence * 100)}% betrouwbaar
              </span>
            </h3>
            <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">
              Dit profiel is gebaseerd op je quiz-antwoorden en swipes. Voor een <strong>nauwkeuriger</strong> analyse
              op basis van je <strong>persoonlijke kleuren</strong>, upload een selfie.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
            >
              <Camera className="w-4 h-4" />
              Upload selfie voor betere analyse
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Quiz Only OR Fallback - Low accuracy
  if (dataSource === 'quiz_only' || dataSource === 'fallback') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#D4913D]/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#D4913D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
              Basis stijlprofiel
              <span className="text-xs px-2.5 py-1 bg-[#D4913D]/10 text-[#D4913D] rounded-full font-semibold">
                Geschat
              </span>
            </h3>
            <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">
              Dit is een geschat profiel op basis van beperkte data. Voor betrouwbare resultaten:
            </p>
            <div className="space-y-2 text-sm text-[#4A4A4A]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2654A]" />
                <span>Swipe door meer foto's voor voorkeuranalyse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2654A]" />
                <span><strong>Upload een selfie</strong> voor persoonlijke kleuranalyse (aanbevolen)</span>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
            >
              <Upload className="w-4 h-4" />
              Upgrade naar nauwkeurig profiel
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Swipes only (rare case)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-6 mb-8"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[#C2654A]/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-[#C2654A]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#1A1A1A] mb-2">
            Gebaseerd op jouw swipes
          </h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">
            We hebben je stijlprofiel bepaald op basis van je visuele voorkeuren. Voor een completer profiel,
            doorloop de quiz of upload een selfie.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
