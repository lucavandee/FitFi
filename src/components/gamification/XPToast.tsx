import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface XPNotificationProps {
  xp: number;
  message: string;
  leveledUp?: boolean;
  newLevel?: string;
}

export function showXPNotification({
  xp,
  message,
  leveledUp,
  newLevel,
}: XPNotificationProps) {
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`max-w-md w-full ${
              leveledUp
                ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                : 'bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]'
            } text-white rounded-2xl shadow-2xl p-4`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {leveledUp ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">
                  {leveledUp ? '🎉 Level Up!' : `+${xp} XP`}
                </div>
                <div className="text-sm opacity-90">
                  {leveledUp ? `Je bent nu ${newLevel}!` : message}
                </div>
              </div>
            </div>
            {leveledUp && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs font-semibold opacity-90">
                  Nieuwe perks ontgrendeld! 🎁
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    ),
    {
      duration: leveledUp ? 5000 : 3000,
      position: 'top-center',
    }
  );
}

export function XPFloatingBadge({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 1 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-20, -40, -60, -80],
        scale: [1, 1.2, 1, 0.8],
      }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="absolute pointer-events-none z-50"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>+{xp} XP</span>
      </div>
    </motion.div>
  );
}
