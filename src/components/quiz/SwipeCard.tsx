import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
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
  const [showTooltip, setShowTooltip] = useState(index === 0);
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

    // Hide tooltip on first interaction
    if (showTooltip) setShowTooltip(false);

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

    // Hide tooltip on first interaction
    if (showTooltip) setShowTooltip(false);

    setExitDirection(direction);
    setTimeout(() => {
      onSwipe(direction, responseTime);
    }, 200);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* First-Time User Tooltip - WCAG AA Compliant */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.05, 1]
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-50
                       bg-[var(--ff-color-primary-700)] text-white
                       px-5 py-3 rounded-2xl text-sm font-semibold
                       shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                       pointer-events-none whitespace-nowrap
                       flex items-center gap-2"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            role="tooltip"
            aria-label="Instructies voor swipe interactie"
          >
            <span className="text-xl" role="img" aria-label="Wijzende vinger">👇</span>
            <span>Klik op de knoppen of sleep de foto</span>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* Stronger gradient for text contrast - WCAG AA compliance */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          {/* Progress Indicator with Enhanced Contrast */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              <span className="text-xs opacity-90">{index + 1} van {total}</span>
            </div>
          </div>
        </div>

        {/* Exit Direction Badges - Enhanced Contrast & Accessibility */}
        {exitDirection === 'left' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-4 ring-white/30"
            style={{
              backdropFilter: 'blur(8px)'
            }}
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </motion.div>
        )}

        {exitDirection === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-4 ring-white/30"
            style={{
              backdropFilter: 'blur(8px)'
            }}
          >
            <Heart className="w-6 h-6 fill-current" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons - Always Visible, Larger on Desktop, Accessible */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 sm:gap-8 z-10 mt-6 sm:mt-8 flex-shrink-0"
        role="group"
        aria-label="Stijl voorkeur keuze"
      >
        <motion.button
          onClick={() => handleButtonClick('left')}
          whileHover={{ scale: 1.1, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.04, 1],
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
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-surface)] border-4 border-red-400 flex items-center justify-center shadow-xl hover:shadow-2xl active:shadow-lg transition-shadow focus:outline-none focus:ring-4 focus:ring-red-300"
          aria-label="Niet mijn stijl - veeg of klik links"
          title="Niet mijn stijl (veeg naar links of druk op pijltje-links)"
        >
          <X className="w-8 h-8 sm:w-11 sm:h-11 text-red-500" strokeWidth={2.8} aria-hidden="true" />
        </motion.button>

        <motion.button
          onClick={() => handleButtonClick('right')}
          whileHover={{ scale: 1.1, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.04, 1],
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
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-surface)] border-4 border-green-400 flex items-center justify-center shadow-xl hover:shadow-2xl active:shadow-lg transition-shadow focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Dit spreekt me aan - veeg of klik rechts"
          title="Dit spreekt me aan (veeg naar rechts, druk op pijltje-rechts of spatiebalk)"
        >
          <Heart className="w-8 h-8 sm:w-11 sm:h-11 text-green-500" strokeWidth={2.8} fill="currentColor" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </div>
  );
}
