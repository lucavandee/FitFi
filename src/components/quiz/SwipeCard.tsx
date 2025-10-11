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
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        ref={cardRef}
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={
          exitDirection
            ? {
                x: exitDirection === 'right' ? 400 : -400,
                opacity: 0,
                transition: { duration: 0.3 }
              }
            : {}
        }
        className="absolute w-full max-w-[360px] h-[520px] cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-full h-full rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg"
          >
            <X className="w-6 h-6" />
          </motion.div>
        )}

        {exitDirection === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg"
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-10">
        <button
          onClick={() => handleButtonClick('left')}
          className="w-16 h-16 rounded-full bg-[var(--color-surface)] border-2 border-red-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Niet mijn stijl"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>

        <button
          onClick={() => handleButtonClick('right')}
          className="w-16 h-16 rounded-full bg-[var(--color-surface)] border-2 border-green-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Dit spreekt me aan"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>
    </div>
  );
}
