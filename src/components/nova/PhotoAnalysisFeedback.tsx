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
        className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C2654A] to-[#C2654A] rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#A8513A] uppercase tracking-wide">
                Nova Analyse
              </span>
              <div
                className={`px-2 py-0.5 ${getScoreBg(analysis.match_score)} ${getScoreColor(analysis.match_score)} rounded-full text-xs font-bold`}
              >
                {analysis.match_score}%
              </div>
            </div>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{analysis.feedback}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FFFFFF] border-2 border-[#F4E8E3] dark:border-[#8A3D28] rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-[#FAF5F2] to-[#FAF5F2] dark:from-[#5A2010]/30 dark:to-[#5A2010]/30 p-6 border-b border-[#E5E5E5]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C2654A] to-[#C2654A] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Nova Analyse</h3>
              <p className="text-sm text-[#8A8A8A]">
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
            <div className="text-xs text-[#8A8A8A] mt-1">Match Score</div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-[#A8513A]" />
            Nova's Feedback
          </h4>
          <p className="text-base text-[#1A1A1A] leading-relaxed">{analysis.feedback}</p>
        </div>

        {/* Detected Items */}
        {analysis.detected_items && analysis.detected_items.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A8513A]" />
              Gedetecteerde Items
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_items.map((item, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A]"
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
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#A8513A]" />
              Gedetecteerde Kleuren
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_colors.map((color, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A] capitalize"
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
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#A8513A]" />
              Verbeterpunten
            </h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-[#FAF5F2] dark:bg-[#5A2010]/20 border border-[#F4E8E3] dark:border-[#8A3D28] rounded-lg p-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-[#C2654A] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed flex-1">
                    {suggestion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-[#C2654A] to-[#C2654A]" />
    </motion.div>
  );
}
