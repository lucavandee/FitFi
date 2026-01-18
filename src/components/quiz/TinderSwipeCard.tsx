import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Keyboard support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (exitDirection) return; // Don't allow multiple swipes

      if (e.key === 'ArrowLeft' || e.key === ' ') {
        e.preventDefault();
        handleButtonClick('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleButtonClick('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitDirection]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
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

  const progress = ((index / total) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-[var(--color-bg)] to-slate-50">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-40 pt-6 pb-4 px-6 bg-white/80 backdrop-blur-xl border-b border-[var(--color-border)]/30 safe-top"
      >
        {/* Progress percentage */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--ff-color-text)] tracking-tight">
              Visuele Voorkeuren
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Swipe door stijlbeelden die je aanspreken
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
              {progress}%
            </div>
            <div className="text-xs text-[var(--color-muted)] mt-0.5">
              {index} / {total}
            </div>
          </div>
        </div>

        {/* Premium progress bar */}
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full"
          />
        </div>

        {/* Subtle instructions - Only show on first card */}
        {index === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-[var(--color-border)]/20"
          >
            <p className="text-xs text-center text-[var(--color-muted)] leading-relaxed">
              <span className="hidden sm:inline">Gebruik pijltjestoetsen (← →), swipe, of de knoppen onderaan</span>
              <span className="sm:hidden">Swipe horizontaal of gebruik de knoppen onderaan</span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Main card area with breathing room */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
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
                  y: 50,
                  rotate: exitDirection === 'right' ? 30 : -30,
                  opacity: 0,
                  transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
                }
              : {}
          }
          whileTap={{ scale: 0.98, cursor: 'grabbing' }}
          className="relative w-full max-w-md aspect-[9/16] cursor-grab active:cursor-grabbing"
        >
          {/* Premium card container */}
          <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-white/20">
            <img
              src={imageUrl}
              alt="Style inspiration"
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Subtle gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Subtle swipe indicators on the card itself */}
            <AnimatePresence>
              {exitDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl">
                    <X className="w-12 h-12 text-slate-600" strokeWidth={2} />
                  </div>
                </motion.div>
              )}

              {exitDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl">
                    <Heart className="w-12 h-12 text-[var(--ff-color-primary-600)] fill-[var(--ff-color-primary-600)]" strokeWidth={0} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Premium action buttons - Subtle and clean */}
      <div className="relative z-30 pb-8 pt-4 px-6 bg-white/80 backdrop-blur-xl border-t border-[var(--color-border)]/30 safe-bottom">
        <div className="flex items-center justify-center gap-8 max-w-md mx-auto">
          {/* Skip button */}
          <motion.button
            onClick={() => handleButtonClick('left')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Niet mijn stijl"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-700 transition-colors" strokeWidth={2.5} />
          </motion.button>

          {/* Like button - Emphasis */}
          <motion.button
            onClick={() => handleButtonClick('right')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Dit spreekt me aan"
          >
            <Heart className="w-7 h-7 text-white fill-white transition-transform duration-300 group-hover:scale-110" strokeWidth={0} />
          </motion.button>

          {/* Next button */}
          <motion.button
            onClick={() => handleButtonClick('right')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Volgende"
          >
            <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-slate-700 transition-colors" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Subtle helper text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-[var(--color-muted)]">
            <span className="hidden sm:inline">Gebruik ← voor overslaan • Spatiebalk of → voor like</span>
            <span className="sm:hidden">Swipe links of rechts</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
