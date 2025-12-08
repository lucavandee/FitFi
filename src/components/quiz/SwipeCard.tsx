import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeCardProps {
  imageUrl: string;
  onSwipe: (direction: 'left' | 'right', responseTimeMs: number) => void;
  onSkip?: () => void;
  index: number;
  total: number;
}

export function SwipeCard({ imageUrl, onSwipe, index, total }: SwipeCardProps) {
  const [startTime] = useState(Date.now());
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const swipeThreshold = 100;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const responseTime = Date.now() - startTime;

    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left';
      setExitDirection(direction);
      setTimeout(() => {
        onSwipe(direction, responseTime);
      }, 200);
    } else {
      x.set(0);
    }
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    const responseTime = Date.now() - startTime;
    setExitDirection(direction);
    setTimeout(() => {
      onSwipe(direction, responseTime);
    }, 200);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <motion.div
        ref={cardRef}
        style={{ x, rotate, opacity, scale }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={
          exitDirection
            ? {
                x: exitDirection === 'right' ? 500 : -500,
                opacity: 0,
                rotate: exitDirection === 'right' ? 25 : -25,
                transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
              }
            : {}
        }
        whileTap={{ scale: 1.02, cursor: 'grabbing' }}
        className="w-full max-w-[340px] sm:max-w-[360px] h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <div className="relative w-full h-full rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-soft)] bg-[var(--color-surface)] transition-shadow hover:shadow-[var(--shadow-lg)]">
          <img
            src={imageUrl}
            alt="Style mood"
            className="w-full h-full object-cover"
            draggable={false}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-sm font-medium opacity-80">
              {index + 1} van {total}
            </div>
          </div>
        </div>

        {exitDirection === 'left' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl"
          >
            <X className="w-6 h-6" />
          </motion.div>
        )}

        {exitDirection === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl"
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons - Always Visible with Pulse Hint */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 sm:gap-6 z-10 mt-6 sm:mt-8 flex-shrink-0"
      >
        <motion.button
          onClick={() => handleButtonClick('left')}
          whileHover={{ scale: 1.15, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
              '0 10px 20px -3px rgba(239, 68, 68, 0.4)',
              '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
            ]
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-surface)] border-3 border-red-400 flex items-center justify-center shadow-lg active:shadow-xl"
          aria-label="Niet mijn stijl"
          title="Niet mijn stijl (of veeg naar links)"
        >
          <X className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" strokeWidth={2.5} />
        </motion.button>

        <motion.button
          onClick={() => handleButtonClick('right')}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 10px 15px -3px rgba(34, 197, 94, 0.2)',
              '0 10px 20px -3px rgba(34, 197, 94, 0.4)',
              '0 10px 15px -3px rgba(34, 197, 94, 0.2)'
            ]
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            delay: 0.5
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-surface)] border-3 border-green-400 flex items-center justify-center shadow-lg active:shadow-xl"
          aria-label="Dit spreekt me aan"
          title="Dit spreekt me aan (of veeg naar rechts)"
        >
          <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-green-500" strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
}
