import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeFeedbackProps {
  direction: 'left' | 'right' | null;
  swipeCount: number;
  onAnimationComplete?: () => void;
}

export function SwipeFeedback({ direction, onAnimationComplete }: SwipeFeedbackProps) {
  useEffect(() => {
    if (direction && onAnimationComplete) {
      setTimeout(onAnimationComplete, 400);
    }
  }, [direction, onAnimationComplete]);

  return (
    <AnimatePresence>
      {direction && (
        <motion.div
          key={`swipe-${Date.now()}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          {direction === 'right' ? (
            <div className="bg-green-500/90 rounded-full p-4 shadow-lg">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
          ) : (
            <div className="bg-red-500/90 rounded-full p-4 shadow-lg">
              <X className="w-12 h-12 text-white stroke-[2.5]" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
