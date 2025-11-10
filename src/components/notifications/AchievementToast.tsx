import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star, Award, X } from 'lucide-react';
import { confettiPresets, hapticFeedback } from '@/utils/confetti';

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  xp: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-500 to-gray-600',
    glow: 'rgba(107, 114, 128, 0.3)',
    label: 'Common',
  },
  rare: {
    gradient: 'from-blue-500 to-blue-600',
    glow: 'rgba(59, 130, 246, 0.3)',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-purple-500 to-pink-500',
    glow: 'rgba(139, 92, 246, 0.3)',
    label: 'Epic',
  },
  legendary: {
    gradient: 'from-yellow-400 to-orange-500',
    glow: 'rgba(251, 191, 36, 0.3)',
    label: 'Legendary',
  },
};

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (achievement) {
      // Fire confetti
      confettiPresets.achievement();

      // Haptic feedback
      hapticFeedback('heavy');

      // Auto-close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const rarity = achievement.rarity || 'common';
  const config = rarityConfig[rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-[90vw] sm:w-96"
      >
        <div className="relative">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-60 animate-pulse"
            style={{ background: config.glow }}
          />

          {/* Main card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />

            {/* Sparkles animation */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 1,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
                aria-label="Sluit notificatie"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-3xl shadow-lg animate-bounce`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                    {config.label} Achievement
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {achievement.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                {achievement.description}
              </p>

              {/* XP Reward */}
              <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-bold shadow-lg`}>
                <Zap className="w-5 h-5" />
                <span>+{achievement.xp} XP</span>
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Level Up Toast
interface LevelUpToastProps {
  level: number;
  levelName: string;
  levelIcon: string;
  onClose: () => void;
}

export function LevelUpToast({ level, levelName, levelIcon, onClose }: LevelUpToastProps) {
  useEffect(() => {
    confettiPresets.levelUp();
    hapticFeedback('heavy');

    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-[90vw] sm:w-96"
    >
      <div className="relative">
        {/* Epic glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 blur-3xl opacity-60 animate-pulse" />

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl shadow-2xl border-2 border-yellow-400/50 overflow-hidden">
          {/* Rays animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-yellow-400/50 to-transparent"
                style={{
                  height: '200%',
                  transformOrigin: 'top',
                  transform: `rotate(${i * 30}deg)`,
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 hover:bg-white/70 flex items-center justify-center transition-colors z-10"
              aria-label="Sluit notificatie"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Crown icon */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-24 h-24 mx-auto mb-6 text-7xl"
            >
              {levelIcon}
            </motion.div>

            {/* Text */}
            <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Level Up!
            </h3>
            <p className="text-xl text-[var(--color-muted)] mb-4">
              Je bent nu level <span className="font-bold text-[var(--color-text)]">{level}</span>
            </p>
            <div className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold shadow-lg inline-block">
              {levelName}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// XP Gain Toast (smaller, bottom right)
interface XPToastProps {
  amount: number;
  reason: string;
  onClose: () => void;
}

export function XPToast({ amount, reason, onClose }: XPToastProps) {
  useEffect(() => {
    hapticFeedback('light');
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className="fixed bottom-24 right-6 z-[9999]"
    >
      <div className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
        <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
        <div>
          <div className="text-sm font-bold">+{amount} XP</div>
          <div className="text-xs opacity-90">{reason}</div>
        </div>
      </div>
    </motion.div>
  );
}
