import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface NovaBubbleProps {
  message: string;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export function NovaBubble({ message, onDismiss, autoHideDuration = 5000 }: NovaBubbleProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20
          }
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.9,
          transition: { duration: 0.2 }
        }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4"
        onAnimationComplete={() => {
          if (autoHideDuration > 0) {
            setTimeout(onDismiss, autoHideDuration);
          }
        }}
      >
        <motion.div
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-2xl p-4 pr-12"
          whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-2xl)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(var(--ff-color-primary-rgb, 119, 79, 56), 0.4)',
                  '0 0 0 10px rgba(var(--ff-color-primary-rgb, 119, 79, 56), 0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <div className="flex-1 pt-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-semibold text-[var(--ff-color-primary-700)] mb-1"
              >
                Nova
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-[var(--color-text)] leading-relaxed"
              >
                {message}
              </motion.p>
            </div>
          </div>

          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)]"
            aria-label="Sluit"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
          className="absolute -bottom-2 left-8 w-4 h-4 bg-[var(--color-surface)] border-l border-b border-[var(--color-border)] transform rotate-45"
        />
      </motion.div>
    </AnimatePresence>
  );
}
