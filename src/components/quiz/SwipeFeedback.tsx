import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Flame, Zap } from 'lucide-react';
import { fireConfetti } from '@/utils/confetti';

interface SwipeFeedbackProps {
  direction: 'left' | 'right' | null;
  swipeCount: number;
  onAnimationComplete?: () => void;
}

export function SwipeFeedback({ direction, swipeCount, onAnimationComplete }: SwipeFeedbackProps) {
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    if (direction && onAnimationComplete) {
      setTimeout(onAnimationComplete, 600);
    }

    if (swipeCount > 0 && swipeCount % 5 === 0) {
      setShowStreak(true);
      fireConfetti({ particleCount: 15, spread: 70 });
      setTimeout(() => setShowStreak(false), 2000);
    }
  }, [direction, swipeCount, onAnimationComplete]);

  const getStreakMessage = () => {
    if (swipeCount % 10 === 0) {
      return {
        icon: <Zap className="w-8 h-8" />,
        title: 'Halfway There!',
        message: 'Je AI stylist leert snel! 🚀'
      };
    }
    return {
      icon: <Flame className="w-8 h-8" />,
      title: `${swipeCount} Swipe Streak!`,
      message: "You're on fire! Keep going 🔥"
    };
  };

  const streak = getStreakMessage();

  return (
    <>
      <AnimatePresence>
        {direction && (
          <motion.div
            key={`swipe-${Date.now()}`}
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            {direction === 'right' ? (
              <motion.div
                className="bg-green-500 rounded-full p-8 shadow-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.3 }}
              >
                <Heart className="w-24 h-24 text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                className="bg-red-500 rounded-full p-8 shadow-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-24 h-24 text-white stroke-[3]" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreak && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-2xl shadow-2xl p-6 text-center min-w-[280px]">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2
                }}
                className="flex justify-center mb-3"
              >
                {streak.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">{streak.title}</h3>
              <p className="text-sm opacity-90">{streak.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
