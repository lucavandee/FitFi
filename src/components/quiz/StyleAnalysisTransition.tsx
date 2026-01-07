import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StyleAnalysisTransitionProps {
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * StyleAnalysisTransition - Premium transition after last swipe
 *
 * Flow:
 * 1. Celebration (1s) - "Perfect! Je stijlprofiel is compleet!"
 * 2. Analysis (2.5s) - "Jouw stijl wordt geanalyseerd..."
 * 3. Fade out + onComplete
 *
 * Total: ~3.5 seconds
 *
 * Purpose:
 * - Give psychological feeling of processing
 * - Smooth transition instead of abrupt jump
 * - Build anticipation for results
 * - Show that user input is valued
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
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[var(--ff-color-primary-900)] via-[var(--ff-color-primary-800)] to-[var(--ff-color-primary-700)]"
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
                  🎉
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-3">Perfect!</h3>
                <p className="text-xl text-white/90">Je stijlprofiel is compleet!</p>
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
                  Jouw stijl wordt geanalyseerd
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </h3>

                {/* Subtitle with dynamic message */}
                <motion.p
                  key={progress < 40 ? 'phase1' : progress < 70 ? 'phase2' : 'phase3'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-lg text-white/80 mb-8"
                >
                  {progress < 40 && 'Je voorkeuren worden geanalyseerd'}
                  {progress >= 40 && progress < 70 && 'Stijlarchetypen worden bepaald'}
                  {progress >= 70 && progress < 95 && 'Outfits worden samengesteld'}
                  {progress >= 95 && 'Je persoonlijke stijlrapport is klaar!'}
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
 *    - Phase labels: "Voorkeuren analyseren" → feels technical
 *    - NOT a lie: We ARE processing data in background
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
