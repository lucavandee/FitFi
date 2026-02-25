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
 * 1. Photo Analysis (GREEN) - High confidence, objective data
 * 2. Quiz + Swipes (AMBER) - Medium confidence, preference data
 * 3. Quiz Only (RED) - Low confidence, minimal data
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
        className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              Gebaseerd op jouw persoonlijke kleuranalyse
              <span className="text-xs px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full font-semibold">
                {Math.round(confidence * 100)}% accuraat
              </span>
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed">
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
        className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              Gebaseerd op jouw stijlvoorkeuren
              <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full font-semibold">
                {Math.round(confidence * 100)}% betrouwbaar
              </span>
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed mb-3">
              Dit profiel is gebaseerd op je quiz-antwoorden en swipes. Voor een <strong>nauwkeuriger</strong> analyse
              op basis van je <strong>persoonlijke kleuren</strong>, upload een selfie.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors"
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
        className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl p-6 mb-8 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
              Basis stijlprofiel
              <span className="text-xs px-2 py-1 bg-rose-200 text-rose-800 rounded-full font-semibold">
                Geschat
              </span>
            </h3>
            <p className="text-sm text-rose-800 leading-relaxed mb-3">
              Dit is een geschat profiel op basis van beperkte data. Voor betrouwbare resultaten:
            </p>
            <div className="space-y-2 text-sm text-rose-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Swipe door meer foto's voor voorkeuranalyse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span><strong>Upload een selfie</strong> voor persoonlijke kleuranalyse (aanbevolen)</span>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors text-sm"
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
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2">
            Gebaseerd op jouw swipes
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-3">
            We hebben je stijlprofiel bepaald op basis van je visuele voorkeuren. Voor een completer profiel,
            doorloop de quiz of upload een selfie.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * UX Psychology:
 *
 * 1. Color-coded Confidence:
 *    - Green = Good (photo analysis)
 *    - Amber = Okay but improvable (quiz + swipes)
 *    - Red = Needs improvement (quiz only)
 *
 * 2. Transparent Communication:
 *    - Show exactly what data was used
 *    - No false promises
 *    - Clear upgrade path
 *
 * 3. Positive Framing:
 *    - Even low confidence = "basis profiel" not "slecht"
 *    - Focus on what CAN be done
 *    - Actionable CTAs
 *
 * 4. Social Proof:
 *    - Percentage scores (90% feels trustworthy)
 *    - "Geanalyseerd via AI" = credibility
 *
 * 5. Incremental Upgrade Path:
 *    - Quiz → Quiz + Swipes → Photo
 *    - Clear next step at each level
 *    - Low friction (just click)
 *
 * References:
 * - Nielsen Norman Group: Trust & Credibility
 * - Material Design: Feedback & States
 * - Apple HIG: Informational Alerts
 */
