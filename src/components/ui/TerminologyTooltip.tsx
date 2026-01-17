import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';

interface TerminologyTooltipProps {
  term: string;
  explanation: string;
  variant?: 'inline' | 'icon';
  className?: string;
}

/**
 * TerminologyTooltip - Uitlegt vakjargon in lekentaal
 *
 * Gebruik:
 * <TerminologyTooltip
 *   term="Ondertoon"
 *   explanation="Of je een warme of koele uitstraling hebt..."
 * />
 */
export function TerminologyTooltip({
  term,
  explanation,
  variant = 'icon',
  className = ''
}: TerminologyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    // Detect if touch device
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
  }, []);

  // Close on outside click (mobile)
  React.useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-tooltip-container]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, isMobile]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsOpen(false);
  };

  return (
    <span
      className={`relative inline-flex items-center gap-1 ${className}`}
      data-tooltip-container
    >
      {/* Term */}
      {variant === 'inline' && (
        <span className="font-medium text-[var(--color-text)]">{term}</span>
      )}

      {/* Trigger Button - Touch friendly */}
      <button
        type="button"
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[var(--ff-color-primary-100)] hover:bg-[var(--ff-color-primary-200)] active:bg-[var(--ff-color-primary-300)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] focus:ring-offset-1 touch-manipulation"
        aria-label={`Uitleg over ${term}`}
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-primary-600)]" />
      </button>

      {/* Tooltip Popup - Mobile optimized */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: isMobile ? 20 : -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isMobile ? 20 : -5, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                ${isMobile
                  ? 'fixed bottom-4 left-4 right-4 z-50'
                  : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-4 sm:p-4 max-w-full sm:max-w-sm">
                {/* Arrow - Desktop only */}
                {!isMobile && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-8 border-transparent border-t-white" />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Info className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0" />
                      <h4 className="font-semibold text-sm sm:text-sm text-[var(--color-text)] truncate">
                        {term}
                      </h4>
                    </div>
                    {/* Close button - Mobile only */}
                    {isMobile && (
                      <button
                        onClick={() => setIsOpen(false)}
                        className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center touch-manipulation"
                        aria-label="Sluiten"
                      >
                        <span className="text-xl text-gray-500">×</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * Predefined terminology explanations voor FitFi
 */
export const TERMINOLOGY = {
  archetype: {
    term: 'Archetype',
    explanation: 'Je hoofdstijl - het overkoepelende thema in hoe je je kleedt. Bijvoorbeeld: Minimalist, Classic, of Streetwear.'
  },
  ondertoon: {
    term: 'Ondertoon',
    explanation: 'Of je een warme of koele uitstraling hebt, gebaseerd op je huid-, haar- en oogkleur. Dit bepaalt welke kleuren je het beste staan.'
  },
  seizoenspalet: {
    term: 'Seizoenspalet',
    explanation: 'Een kleurgroep die bij jou past, zoals "Soft Summer" of "Warm Autumn". Gebaseerd op je ondertoon en contrast.'
  },
  contrast: {
    term: 'Contrast',
    explanation: 'Het verschil tussen je haar-, huid- en oogkleur. Hoog contrast (bijv. donker haar + lichte huid) vs laag contrast (alles vergelijkbare tinten).'
  },
  colorTemperature: {
    term: 'Kleurtemperatuur',
    explanation: 'Of kleuren warm (geel/oranje ondertoon) of koel (blauw ondertoon) zijn. Jouw ondertoon bepaalt welke temperatuur je het beste staat.'
  },
  styleDNA: {
    term: 'Style DNA',
    explanation: 'Je unieke stijlmix - de combinatie van verschillende stijlelementen die jouw persoonlijke look definiëren.'
  },
  occasionBalance: {
    term: 'Gelegenheids-balans',
    explanation: 'Hoe formeel of casual je normaal kleedt. We kijken waar je je het meest comfortabel voelt.'
  },
  colorHarmony: {
    term: 'Kleurharmonie',
    explanation: 'Hoe goed kleuren samen passen in een outfit. Goede harmonie = visueel prettige combinaties.'
  },
  visualPreference: {
    term: 'Visuele voorkeur',
    explanation: 'Welke looks en stijlen jou visueel aanspreken, gebaseerd op foto\'s die je leuk vond tijdens de quiz.'
  },
  matchPercentage: {
    term: 'Match percentage',
    explanation: 'Hoe goed een outfit bij jouw stijlprofiel past. 80%+ = uitstekende match met je voorkeuren.'
  }
};

/**
 * Quick helper component for common terms
 */
export function ArchetypeTooltip() {
  return (
    <TerminologyTooltip
      term={TERMINOLOGY.archetype.term}
      explanation={TERMINOLOGY.archetype.explanation}
    />
  );
}

export function OnderToonTooltip() {
  return (
    <TerminologyTooltip
      term={TERMINOLOGY.ondertoon.term}
      explanation={TERMINOLOGY.ondertoon.explanation}
    />
  );
}

export function SeizoensPaletTooltip() {
  return (
    <TerminologyTooltip
      term={TERMINOLOGY.seizoenspalet.term}
      explanation={TERMINOLOGY.seizoenspalet.explanation}
    />
  );
}

export function ContrastTooltip() {
  return (
    <TerminologyTooltip
      term={TERMINOLOGY.contrast.term}
      explanation={TERMINOLOGY.contrast.explanation}
    />
  );
}
