/**
 * StyleProfileSummary Component
 *
 * Clear, trustworthy style profile display
 *
 * Key Principles:
 * - Transparency (hoe is dit bepaald?)
 * - Control (gemakkelijk aan te passen)
 * - Confidence (vertrouwen in het advies)
 * - Action (wat nu?)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Eye,
  Info,
  Check,
  Calendar
} from 'lucide-react';

interface StyleProfileSummaryProps {
  /** Archetype name */
  archetype?: string | null;

  /** Primary colors */
  primaryColors?: string[];

  /** Color season */
  season?: string | null;

  /** Profile created date */
  createdAt?: string | Date | null;

  /** Last updated date */
  updatedAt?: string | Date | null;

  /** Confidence score (0-1) */
  confidence?: number;

  /** Show reset CTA? */
  showReset?: boolean;

  /** Reset handler */
  onReset?: () => void;

  /** View results handler */
  onViewResults?: () => void;
}

export function StyleProfileSummary({
  archetype,
  primaryColors = [],
  season,
  createdAt,
  updatedAt,
  confidence = 0.85,
  showReset = true,
  onReset,
  onViewResults
}: StyleProfileSummaryProps) {
  const navigate = useNavigate();

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 0.8) return 'Hoge zekerheid';
    if (score >= 0.6) return 'Goede zekerheid';
    return 'Gemiddelde zekerheid';
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[var(--ff-color-primary-25)] to-[var(--ff-color-accent-25)] border-2 border-[var(--ff-color-primary-100)] rounded-2xl p-6 sm:p-8 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-6 h-6 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[var(--color-text)]">Jouw Stijlprofiel</h3>
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Gebaseerd op je quiz antwoorden
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-semibold">
          <Check className={`w-3 h-3 ${getConfidenceColor(confidence)}`} aria-hidden="true" />
          <span className={getConfidenceColor(confidence)}>
            {getConfidenceLabel(confidence)}
          </span>
        </div>
      </div>

      {/* Archetype */}
      <div className="mb-6">
        <p className="text-sm text-[var(--color-muted)] mb-2">Stijl Archetype</p>
        <p className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">
          {archetype || 'Niet beschikbaar'}
        </p>
        {season && (
          <p className="text-sm text-[var(--color-text)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
            {season} kleurenseizoen
          </p>
        )}
      </div>

      {/* Colors */}
      {primaryColors.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-[var(--color-muted)] mb-3">Jouw Perfecte Kleuren</p>
          <div className="flex gap-2 flex-wrap" role="list" aria-label="Je persoonlijke kleurenpalet">
            {primaryColors.slice(0, 8).map((color, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
                style={{ backgroundColor: color }}
                role="listitem"
                aria-label={`Kleur ${i + 1}: ${color}`}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mb-6 p-4 bg-white/50 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-muted)]" aria-hidden="true" />
              <div>
                <p className="text-xs text-[var(--color-muted)]">Aangemaakt</p>
                <p className="font-medium text-[var(--color-text)]">{formatDate(createdAt)}</p>
              </div>
            </div>
          )}
          {updatedAt && updatedAt !== createdAt && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--color-muted)]" aria-hidden="true" />
              <div>
                <p className="text-xs text-[var(--color-muted)]">Bijgewerkt</p>
                <p className="font-medium text-[var(--color-text)]">{formatDate(updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Hoe werkt dit?</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              We analyseren je quiz antwoorden om je unieke stijl te bepalen. Je archetype helpt ons
              outfits samen te stellen die perfect bij jou passen. Niet tevreden? Doe de quiz opnieuw!
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onViewResults && (
          <button
            onClick={onViewResults}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            aria-label="Bekijk je gepersonaliseerde outfit aanbevelingen"
          >
            <Eye className="w-5 h-5" aria-hidden="true" />
            <span>Bekijk je outfits</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.div>
          </button>
        )}

        {showReset && onReset && (
          <button
            onClick={onReset}
            className="px-6 py-4 bg-white border-2 border-[var(--color-border)] rounded-xl font-semibold text-[var(--color-text)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--color-bg)] transition-all flex items-center justify-center gap-2"
            aria-label="Doe de quiz opnieuw om je stijlprofiel bij te werken"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Pas je stijl aan</span>
          </button>
        )}
      </div>

      {/* Frequency Hint */}
      <p className="text-xs text-center text-[var(--color-muted)] mt-4">
        💡 Tip: Update je profiel elke 3-6 maanden als je stijl evolueert
      </p>
    </motion.div>
  );
}

export default StyleProfileSummary;
