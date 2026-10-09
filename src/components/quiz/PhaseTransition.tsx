import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Image, Target, Sparkles, CheckCircle } from 'lucide-react';

interface PhaseTransitionProps {
  fromPhase: 'questions' | 'swipes' | 'calibration';
  toPhase: 'swipes' | 'calibration' | 'reveal';
  onContinue: () => void;
}

export function PhaseTransition({ fromPhase, toPhase, onContinue }: PhaseTransitionProps) {
  const content = getTransitionContent(fromPhase, toPhase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#FAFAF8] flex items-start justify-center px-4 py-6 overflow-y-auto"
    >
      {/* Geen veren: die schieten door en vallen terug (CLAUDE.md deel 8). */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl w-full my-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#A85740] to-[#A85740] flex items-center justify-center mb-6 sm:mb-8 shadow-lg"
        >
          <content.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-[#A85740] to-[#A85740] bg-clip-text text-transparent"
        >
          {content.title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-center text-[#1A1A1A]/70 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto"
        >
          {content.description}
        </motion.p>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A1A1A]/50 mb-4">
            Wat te verwachten
          </h3>
          <div className="space-y-3">
            {content.expectations.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-[#A85740] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#1A1A1A]/80">{exp}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nova tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[#A85740]/10 to-[#A85740]/10 border border-[#A85740]/20 rounded-2xl p-4 mb-6 sm:mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#A85740] to-[#A85740] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">Nova's tip</p>
              <p className="text-sm text-[#1A1A1A]/70">{content.novaTip}</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          style={{ paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}
          className="w-full pt-4 px-6 bg-gradient-to-r from-[#A85740] to-[#A85740] text-white rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-sm transition-shadow flex items-center justify-center gap-2"
        >
          {content.ctaText}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Hier stond "Dit duurt ongeveer ..." (2-3 minuten, ~5 minuten, 10
            seconden). Geen van die tijden is gemeten. */}
      </motion.div>
    </motion.div>
  );
}

/*
 * Getallen uit VisualPreferenceStepClean.tsx. Daar staan ze als niet-geëxporteerde
 * constanten; PhaseTransition.tekst.test.tsx leest ze uit die bron en faalt als
 * ze hier afwijken. Afronden kan vanaf MIN_SWIPES_TO_COMPLETE swipes, daarvoor
 * staat er "Sla deze stap over". Na ADAPT_AFTER_SWIPES swipes laadt de stap de
 * volgende beelden via loadAdaptivePhotos, en die stemt ze alleen af op je keuzes
 * als je patroon daar genoeg voor zegt (swipeAnalyzer, shouldAdapt). Vandaar "kan".
 */
const AFRONDEN_NA = 15;
const AFSTEMMEN_NA = 7;

/*
 * Eén stem: FitFi in de derde persoon, geen "ik" of "me" van Nova. Alleen wat de
 * code doet: geen "pixel-perfect", geen "Ik leer van elke swipe", en bij de
 * kalibratie geen belofte dat je oordeel je profiel verandert. De beoordeling
 * gaat via record_swipe naar swipe_preferences, apply_calibration_to_profile
 * leest outfit_calibration_feedback, en bij het afronden schrijft
 * OnboardingFlowPage de embedding opnieuw uit de swipes. Een effect op het
 * rapport is niet aan te wijzen.
 */
function getTransitionContent(fromPhase: string, toPhase: string) {
  if (toPhase === 'swipes') {
    return {
      icon: Image,
      title: 'Laten we je visuele voorkeur ontdekken',
      description: 'Je hebt de vragen beantwoord. Nu zie je beelden van outfits. Swipe naar rechts op looks die je aanspreken, naar links op wat je minder vindt.',
      expectations: [
        `Na ${AFRONDEN_NA} swipes kun je afronden, overslaan kan ook`,
        'Er zijn geen foute antwoorden',
        `Na ${AFSTEMMEN_NA} swipes kan FitFi de volgende beelden afstemmen op je keuzes`,
      ],
      novaTip: 'Ga op je eerste indruk af. Je hoeft niet lang na te denken.',
      ctaText: 'Start met swipen',
    };
  }

  if (toPhase === 'calibration') {
    return {
      icon: Target,
      title: 'De laatste stap',
      description: 'Je ziet nu complete outfits. Geef per outfit aan wat je ervan vindt.',
      expectations: [
        // Drie: CalibrationStep vraagt de engine om count: 3.
        'Je ziet drie outfits die FitFi voor je samenstelt',
        'Beoordeel elke outfit: Spot on, Misschien of Lijkt me niks',
        // CalibrationStep toont "Beoordeling overslaan" zolang je niets beoordeeld hebt.
        'Je kunt deze stap ook overslaan',
      ],
      novaTip: 'Kijk naar de outfit als geheel: zou je dit zo aantrekken?',
      ctaText: 'Bekijk de outfits',
    };
  }

  // OnboardingFlowPage zet transitionTo nu nooit op 'reveal': na de kalibratie
  // komt ResultsRevealSequence. Deze tekst klopt toch, voor als dat verandert.
  if (toPhase === 'reveal') {
    return {
      icon: Sparkles,
      title: 'Klaar met de quiz',
      description: 'Je antwoorden zijn verwerkt. Voor je rapport heb je een gratis account nodig.',
      expectations: [
        'Je stijlprofiel met archetype',
        'Je kleurpalet',
        'Outfits met links naar winkels',
      ],
      novaTip: 'Veranderen je antwoorden, dan kun je de quiz later opnieuw doen.',
      ctaText: 'Bekijk je resultaten',
    };
  }

  // Terugval
  return {
    icon: ArrowRight,
    title: 'Klaar voor de volgende stap',
    description: 'We gaan verder met de quiz.',
    expectations: ['De volgende stap van de quiz'],
    novaTip: 'Er zijn geen foute antwoorden.',
    ctaText: 'Ga verder',
  };
}
