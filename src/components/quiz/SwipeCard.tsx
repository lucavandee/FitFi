import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeCardProps {
  imageUrl: string;
  onSwipe: (direction: 'left' | 'right', responseTimeMs: number) => void;
  onSkip?: () => void;
  index: number;
  total: number;
  variant?: 'mobile' | 'desktop';
}

export function SwipeCard({ imageUrl, onSwipe, index, total, variant = 'mobile' }: SwipeCardProps) {
  const [startTime] = useState(Date.now());
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [showTooltip, setShowTooltip] = useState(index === 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const swipeThreshold = 100;

  // Track drag direction for visual feedback
  const dragDirection = useTransform(x, (value) => {
    if (value > 50) return 'right';
    if (value < -50) return 'left';
    return null;
  });

  const handleDragStart = () => {
    setIsDragging(true);
    if (showTooltip) setShowTooltip(false);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
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
    <div className="relative w-full h-full flex flex-col items-center justify-end">
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 1.02, cursor: 'grabbing' }}
        className={[
          'swipe-card-container swipe-card-draggable cursor-grab active:cursor-grabbing w-full',
          variant === 'desktop'
            ? 'flex-shrink-0 h-[520px] lg:h-[600px] max-w-full'
            : 'flex-1 min-h-0 max-w-[340px] max-h-[calc(100%-96px)]',
        ].join(' ')}
      >
        <div className="relative w-full h-full rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-soft)] bg-[var(--color-surface)] transition-shadow hover:shadow-[var(--shadow-lg)]">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-100)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-200)] animate-pulse" />
          )}
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-100)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-200)]" />
          )}
          <img
            src={imageUrl}
            alt="Style mood"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imgLoaded && !imgError ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
            loading="eager"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
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

          {/* Drag Indicators - always mounted, opacity driven by motion value to avoid DOM mutations */}
          <motion.div
            style={{ opacity: useTransform(x, [-120, -30, 0], [1, 0.3, 0]) }}
            className="swipe-drag-indicator absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl ring-4 ring-white/40">
              <X className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: useTransform(x, [0, 30, 120], [0, 0.3, 1]) }}
            className="swipe-drag-indicator absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl ring-4 ring-white/40">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Desktop Hover Hint - Only drag instruction, no overlapping icons */}
          {isHovering && !isDragging && (
            <div className="swipe-hover-hints hidden sm:block absolute inset-0 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-6 left-1/2 -translate-x-1/2"
              >
                <div
                  className="px-4 py-2 rounded-full text-white text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  ← Sleep naar links of rechts →
                </div>
              </motion.div>
            </div>
          )}
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

      {/* Action Buttons — alleen op mobiel, desktop gebruikt eigen knoppen in rechterkolom */}
      {variant !== 'desktop' && (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-6 sm:gap-10 z-10 mt-3 mb-1 flex-shrink-0 relative"
        role="group"
        aria-label="Stijl voorkeur keuze"
      >
        {/* Left Button (Dislike) */}
        <div className="relative group">
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
            className="swipe-button w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-red-400 flex items-center justify-center shadow-xl hover:shadow-2xl active:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-300 hover:bg-red-50"
            aria-label="Niet mijn stijl - veeg of klik links"
          >
            <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" strokeWidth={3} aria-hidden="true" />
          </motion.button>

          {/* Desktop Hover Tooltip */}
          <div className="hidden sm:block absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="px-3 py-2 rounded-lg text-white text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                backdropFilter: 'blur(8px)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              Niet mijn stijl
              {/* Arrow pointing down */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.95)' }}
              />
            </div>
          </div>
        </div>

        {/* Right Button (Like) */}
        <div className="relative group">
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
            className="swipe-button w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-green-400 flex items-center justify-center shadow-xl hover:shadow-2xl active:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-300 hover:bg-green-50"
            aria-label="Dit spreekt me aan - veeg of klik rechts"
          >
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" strokeWidth={3} fill="currentColor" aria-hidden="true" />
          </motion.button>

          {/* Desktop Hover Tooltip */}
          <div className="hidden sm:block absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="px-3 py-2 rounded-lg text-white text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.95)',
                backdropFilter: 'blur(8px)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              Dit spreekt me aan
              {/* Arrow pointing down */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.95)' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
