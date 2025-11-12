import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, AlertCircle, Lightbulb, Palette, TrendingUp } from "lucide-react";
import type { PhotoAnalysisResult } from "@/services/nova/photoAnalysisService";

interface PhotoAnalysisFeedbackProps {
  analysis: PhotoAnalysisResult;
  compact?: boolean;
}

export function PhotoAnalysisFeedback({ analysis, compact = false }: PhotoAnalysisFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/20";
    if (score >= 40) return "bg-amber-100 dark:bg-amber-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[var(--ff-color-primary-700)] uppercase tracking-wide">
                Nova Analyse
              </span>
              <div
                className={`px-2 py-0.5 ${getScoreBg(analysis.match_score)} ${getScoreColor(analysis.match_score)} rounded-full text-xs font-bold`}
              >
                {analysis.match_score}%
              </div>
            </div>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">{analysis.feedback}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)] rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] dark:from-[var(--ff-color-primary-900)]/30 dark:to-[var(--ff-color-accent-900)]/30 p-6 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">Nova Analyse</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {new Date(analysis.created_at).toLocaleDateString("nl-NL")}
              </p>
            </div>
          </div>

          {/* Match Score */}
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getScoreColor(analysis.match_score)} leading-none`}
            >
              {analysis.match_score}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Match Score</div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
            Nova's Feedback
          </h4>
          <p className="text-base text-[var(--color-text)] leading-relaxed">{analysis.feedback}</p>
        </div>

        {/* Detected Items */}
        {analysis.detected_items && analysis.detected_items.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
              Gedetecteerde Items
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_items.map((item, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Detected Colors */}
        {analysis.detected_colors && analysis.detected_colors.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
              Gedetecteerde Kleuren
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_colors.map((color, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] capitalize"
                >
                  {color}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
              Verbeterpunten
            </h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-[var(--ff-color-primary-50)] dark:bg-[var(--ff-color-primary-900)]/20 border border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)] rounded-lg p-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--ff-color-primary-600)] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed flex-1">
                    {suggestion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]" />
    </motion.div>
  );
}
