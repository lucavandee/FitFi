import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface TinderSwipeCardProps {
  imageUrl: string;
  onSwipe: (direction: 'left' | 'right', responseTimeMs: number) => void;
  index: number;
  total: number;
}

export function TinderSwipeCard({ imageUrl, onSwipe, index, total }: TinderSwipeCardProps) {
  const [startTime] = useState(Date.now());
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 0.5, 1, 0.5, 0]);

  const swipeThreshold = 120;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const responseTime = Date.now() - startTime;

    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 600) {
      const direction = offset > 0 ? 'right' : 'left';
      setExitDirection(direction);

      setTimeout(() => {
        onSwipe(direction, responseTime);
      }, 250);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    const responseTime = Date.now() - startTime;
    setExitDirection(direction);

    setTimeout(() => {
      onSwipe(direction, responseTime);
    }, 250);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--color-bg)]">
      {/* Progress indicator - top */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/20"
            >
              <motion.div
                initial={{ width: i < index ? '100%' : '0%' }}
                animate={{ width: i < index ? '100%' : i === index ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
                className="h-full bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main card area */}
      <div className="relative flex-1 flex items-center justify-center">
        <motion.div
          ref={cardRef}
          style={{ x, y, rotate, opacity }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          animate={
            exitDirection
              ? {
                  x: exitDirection === 'right' ? 1000 : -1000,
                  y: 100,
                  rotate: exitDirection === 'right' ? 45 : -45,
                  opacity: 0,
                  transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
                }
              : {}
          }
          whileTap={{ scale: 0.98, cursor: 'grabbing' }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Card inner */}
          <div className="relative w-full h-full">
            {/* Image - 9:16 ratio, centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-[500px] h-full max-h-[calc(100vh-180px)] aspect-[9/16]">
                <img
                  src={imageUrl}
                  alt="Style mood"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                  draggable={false}
                />

                {/* Gradient overlay - subtle */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30 rounded-3xl pointer-events-none" />

                {/* Counter badge - bottom left */}
                <div className="absolute bottom-6 left-6">
                  <div className="bg-black/40 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full">
                    {index + 1} / {total}
                  </div>
                </div>
              </div>
            </div>

            {/* Swipe direction indicators */}
            <AnimatePresence>
              {exitDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1.2, rotate: -15 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="bg-red-500 text-white p-8 rounded-full shadow-2xl border-4 border-white">
                    <X className="w-16 h-16" strokeWidth={3} />
                  </div>
                </motion.div>
              )}

              {exitDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
                  animate={{ opacity: 1, scale: 1.2, rotate: 15 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="bg-green-500 text-white p-8 rounded-full shadow-2xl border-4 border-white">
                    <Heart className="w-16 h-16 fill-white" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Action buttons - Tinder style at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 safe-bottom">
        <div className="flex items-center justify-center gap-6 py-6 px-4">
          <motion.button
            onClick={() => handleButtonClick('left')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-red-500/20 flex items-center justify-center hover:border-red-500 transition-all active:shadow-lg"
            aria-label="Niet mijn stijl"
          >
            <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </motion.button>

          <motion.button
            onClick={() => handleButtonClick('right')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all active:shadow-lg"
            aria-label="Dit spreekt me aan"
          >
            <Heart className="w-10 h-10 text-white fill-white" strokeWidth={0} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
