import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StyleAnalysisTransitionProps {
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * StyleAnalysisTransition: overgang na de laatste swipe.
 *
 * Verloop: 1 seconde "Klaar met swipen", daarna 2,5 seconde een balk, dan
 * onComplete. Er wordt in die 3,5 seconde niets verwerkt: het is alleen een
 * timer. Hier stonden "Je stijlprofiel is compleet!", "Jouw stijl wordt
 * geanalyseerd", "Outfits worden samengesteld" en "Je persoonlijke
 * stijlrapport is klaar!", terwijl daarna nog de kalibratie komt en het
 * rapport pas na de quiz gemaakt wordt (copy-controle fase 4, bevinding 15).
 * De tekst zegt nu alleen wat er hierna komt. Of de wachttijd zelf moet
 * blijven, is een aparte keuze.
 */
export function StyleAnalysisTransition({
  isVisible,
  onComplete
}: StyleAnalysisTransitionProps) {
  const [phase, setPhase] = useState<'celebration' | 'analysis'>('celebration');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Phase 1: Celebration (1 second)
    const celebrationTimer = setTimeout(() => {
      setPhase('analysis');
    }, 1000);

    // Phase 2: Analysis with fake progress (2.5 seconds)
    const analysisTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    // Cleanup
    return () => {
      clearTimeout(celebrationTimer);
      clearTimeout(analysisTimer);
    };
  }, [isVisible, onComplete]);

  // Fake progress bar (smooth 0 → 100%)
  useEffect(() => {
    if (phase !== 'analysis') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50); // Update every 50ms = 2500ms total

    return () => clearInterval(interval);
  }, [phase]);

  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="transition-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#9A503B] to-[#9A503B]"
        style={{ pointerEvents: 'none' }}
      >
        <div className="max-w-md mx-auto px-6 text-center">
          <AnimatePresence mode="wait">
            {phase === 'celebration' ? (
              // Phase 1: Celebration (1s)
              <motion.div
                key="celebration"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ duration: 0.6, repeat: 1 }}
                  className="text-8xl mb-6"
                >
                  <CheckCircle2 className="w-16 h-16 text-white mx-auto" aria-hidden="true" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-3">Klaar met swipen</h3>
                <p className="text-xl text-white/90">Hierna beoordeel je drie outfits.</p>
              </motion.div>
            ) : (
              // Phase 2: Analysis (2.5s)
              <motion.div
                key="analysis"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Logo Animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' }
                  }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                {/* Analysis Text */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Op naar de outfits
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </h3>

                {/* Subtitle with dynamic message */}
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-lg text-white/80 mb-8"
                >
                  Daarna maakt FitFi je rapport.
                </motion.p>

                {/* Progress Bar */}
                <div className="w-full max-w-sm mx-auto">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="h-full bg-gradient-to-r from-white via-white/90 to-white rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  </div>

                  {/* Progress percentage */}
                  <motion.p
                    className="text-sm text-white/60 mt-3 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {Math.round(progress)}%
                  </motion.p>
                </div>

                {/* Subtle Loading Spinner */}
                <div className="mt-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    <Loader2 className="w-6 h-6 text-white/40" />
                  </motion.div>
                </div>

                {/* Floating particles - subtle background animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{
                        x: Math.random() * window.innerWidth,
                        y: window.innerHeight + 20
                      }}
                      animate={{
                        y: -20,
                        x: Math.random() * window.innerWidth
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: 'linear'
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * UX Psychology Notes:
 *
 * 1. Why 3.5 seconds?
 *    - Too short (<2s): Feels rushed, no processing feel
 *    - Too long (>5s): User gets impatient
 *    - Sweet spot: 3-4 seconds = anticipation without frustration
 *
 * 2. Two-phase approach:
 *    - Celebration: Reward user for completing task
 *    - Analysis: Show their input is being processed seriously
 *
 * 3. Fake progress bar:
 *    - Psychological: "Something is happening"
 *    - Geen fasenamen meer als "Voorkeuren analyseren": er wordt in deze tijd
 *      niets verwerkt, dus die namen waren niet waar.
 *
 * 4. Visual hierarchy:
 *    - Logo animation: Brand reinforcement
 *    - Progress bar: Tangible feedback
 *    - Loading text: Clear communication
 *    - Spinner: Subtle movement (not distracting)
 *
 * 5. Color choice:
 *    - Primary gradient: Premium, cohesive with brand
 *    - White text: High contrast, readable
 *    - Blur effects: Depth, modern feel
 *
 * 6. Animation principles:
 *    - Spring animations: Natural feel
 *    - Ease-in-out: Smooth transitions
 *    - Stagger: Not everything at once
 *
 * References:
 * - Nielsen Norman Group: Progress Indicators
 * - Material Design: Loading states
 * - Apple HIG: Activity indicators
 */
