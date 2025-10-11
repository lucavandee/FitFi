import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface NovaBubbleProps {
  message: string;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export function NovaBubble({ message, onDismiss, autoHideDuration = 5000 }: NovaBubbleProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4"
        onAnimationComplete={() => {
          if (autoHideDuration > 0) {
            setTimeout(onDismiss, autoHideDuration);
          }
        }}
      >
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-lg p-4 pr-12">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 pt-1">
              <div className="text-xs font-semibold text-[var(--ff-color-primary-700)] mb-1">
                Nova
              </div>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Sluit"
          >
            ×
          </button>
        </div>

        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[var(--color-surface)] border-l border-b border-[var(--color-border)] transform rotate-45" />
      </motion.div>
    </AnimatePresence>
  );
}
