import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, ArrowRight, X } from 'lucide-react';

interface SwipeableOutfitCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 100;

export function SwipeableOutfitCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLike,
  onDislike,
  className = ''
}: SwipeableOutfitCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
      if (offset > 0) {
        setExitDirection('right');
        onSwipeRight?.();
        onLike?.();
      } else {
        setExitDirection('left');
        onSwipeLeft?.();
        onDislike?.();
      }
    } else {
      x.set(0);
    }
  };

  const exitVariants = {
    left: { x: -300, opacity: 0, transition: { duration: 0.3 } },
    right: { x: 300, opacity: 0, transition: { duration: 0.3 } },
    center: { x: 0, opacity: 1 }
  };

  return (
    <motion.div
      className={`relative touch-none ${className}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? exitDirection : 'center'}
      variants={exitVariants}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Swipe Indicators */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: useTransform(x, [-200, -50, 0], [1, 0, 0]) }}
      >
        <div className="bg-red-500 rounded-full p-4">
          <X className="w-8 h-8 text-white" strokeWidth={3} />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: useTransform(x, [0, 50, 200], [0, 0, 1]) }}
      >
        <div className="bg-green-500 rounded-full p-4">
          <Heart className="w-8 h-8 text-white fill-white" strokeWidth={3} />
        </div>
      </motion.div>

      {children}
    </motion.div>
  );
}
