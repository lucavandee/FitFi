import React from 'react';
import { Palette } from 'lucide-react';
import { motion } from 'framer-motion';

interface ColorHarmonyBadgeProps {
  harmonyScore: number;
  className?: string;
  compact?: boolean;
}

export function ColorHarmonyBadge({ harmonyScore, className = '', compact = false }: ColorHarmonyBadgeProps) {
  if (harmonyScore < 0.7) {
    return null;
  }

  const getHarmonyLabel = (score: number): string => {
    if (score >= 0.85) return 'Perfecte kleurcombinatie';
    if (score >= 0.75) return 'Mooie harmonie';
    return 'Goede match';
  };

  const getHarmonyEmoji = (score: number): string => {
    if (score >= 0.85) return '🎨';
    if (score >= 0.75) return '✨';
    return '👌';
  };

  if (compact) {
    return (
      <motion.span
        className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200 rounded-full text-xs font-medium ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        title={`Color harmony: ${Math.round(harmonyScore * 100)}%`}
      >
        <Palette className="w-3 h-3" />
        <span>{getHarmonyEmoji(harmonyScore)}</span>
      </motion.span>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200 rounded-full text-sm font-medium ${className}`}
      initial={{ scale: 0, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
      whileHover={{ scale: 1.05 }}
      title={`Color harmony score: ${Math.round(harmonyScore * 100)}%`}
    >
      <Palette className="w-4 h-4" />
      <span>{getHarmonyEmoji(harmonyScore)} {getHarmonyLabel(harmonyScore)}</span>
    </motion.div>
  );
}
