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
      className="fixed inset-0 z-50 bg-[var(--color-bg)] flex items-start justify-center px-4 py-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-2xl w-full my-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-6 sm:mb-8 shadow-[var(--shadow-elevated)]"
        >
          <content.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent"
        >
          {content.title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-center text-[var(--color-text)]/70 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto"
        >
          {content.description}
        </motion.p>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text)]/50 mb-4">
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
                <CheckCircle className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-text)]/80">{exp}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nova tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border border-[var(--color-primary)]/20 rounded-[var(--radius-2xl)] p-4 mb-6 sm:mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">Nova's tip</p>
              <p className="text-sm text-[var(--color-text)]/70">{content.novaTip}</p>
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
          className="w-full pt-4 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-[var(--radius-2xl)] font-semibold text-base sm:text-lg shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-soft)] transition-shadow flex items-center justify-center gap-2"
        >
          {content.ctaText}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Time estimate */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-[var(--color-text)]/50 mt-4"
        >
          Dit duurt ongeveer {content.timeEstimate}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function getTransitionContent(fromPhase: string, toPhase: string) {
  if (toPhase === 'swipes') {
    return {
      icon: Image,
      title: 'Laten we je visuele voorkeur ontdekken',
      description: 'Je hebt de basis vragen beantwoord. Nu gaan we dieper: ik laat je echte outfit foto\'s zien. Swipe naar rechts op looks die je aantrekken, links op wat je minder vindt.',
      expectations: [
        'Je ziet 15-20 outfit foto\'s die passen bij jouw stijl',
        'Swipe intuïtief - je eerste indruk is vaak het beste',
        'Er zijn geen foute antwoorden, dit gaat over jouw gevoel',
        'Hoe meer je swiped, hoe beter ik je stijl begrijp'
      ],
      novaTip: 'Ik leer van elke swipe. Als je twijfelt tussen twee looks, kies de outfit die je direct aanspreekt - dat is vaak je échte stijl.',
      ctaText: 'Start met swipen',
      timeEstimate: '2-3 minuten'
    };
  }

  if (toPhase === 'calibration') {
    return {
      icon: Target,
      title: 'Tijd voor de finishing touch',
      description: 'Geweldig! Ik heb nu een goed beeld van je stijl. In deze laatste stap laat ik je complete outfits zien. Jouw feedback helpt me om je aanbevelingen pixel-perfect te maken.',
      expectations: [
        'Je ziet 5 complete outfits samengesteld door mij',
        'Beoordeel elk outfit: Love it, Like it, of Meh',
        'Vertel me wat je wel/niet aantrekkelijk vindt',
        'Dit is de laatste verfijning voor je Style DNA'
      ],
      novaTip: 'Dit is waar de magie gebeurt. Je feedback hier maakt het verschil tussen "leuke outfits" en "outfits die voelen alsof ze voor jou gemaakt zijn".',
      ctaText: 'Bekijk de outfits',
      timeEstimate: '2 minuten'
    };
  }

  if (toPhase === 'reveal') {
    return {
      icon: Sparkles,
      title: 'Je Style DNA is klaar!',
      description: 'Wauw! Ik heb alle data verwerkt. Je staat op het punt om je persoonlijke Style Report te zien met 50+ outfits die perfect bij je passen.',
      expectations: [
        'Je unieke stijlprofiel met archetype',
        '50+ gepersonaliseerde outfit aanbevelingen',
        'Kleur- en styling advies op maat',
        'Direct shoppable items van top merken'
      ],
      novaTip: 'Dit is het resultaat van alles wat we samen hebben ontdekt. Elk outfit is bewust geselecteerd op basis van je antwoorden, swipes én feedback. Ready to see your style?',
      ctaText: 'Toon mijn Style DNA',
      timeEstimate: '10 seconden'
    };
  }

  // Fallback
  return {
    icon: ArrowRight,
    title: 'Klaar voor de volgende stap',
    description: 'Laten we verder gaan met je stijl journey.',
    expectations: ['Next phase coming up'],
    novaTip: 'Blijf jezelf - er zijn geen foute antwoorden!',
    ctaText: 'Ga verder',
    timeEstimate: '1 minuut'
  };
}
