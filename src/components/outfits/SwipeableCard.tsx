import React, { useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, MoreHorizontal, Sparkles } from 'lucide-react';
import { haptics } from '@/utils/haptics';

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
  onTrigger: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  swipeThreshold?: number;
  disabled?: boolean;
}

const defaultLeftAction: SwipeAction = {
  icon: X,
  label: 'Remove',
  color: 'text-red-600',
  bgColor: 'bg-red-100',
  onTrigger: () => {}
};

const defaultRightAction: SwipeAction = {
  icon: Heart,
  label: 'Save',
  color: 'text-pink-600',
  bgColor: 'bg-pink-100',
  onTrigger: () => {}
};

/**
 * Swipeable Card Component
 * Tinder-style swipe interactions for outfit cards
 *
 * Features:
 * - Swipe left/right with actions
 * - Visual feedback during swipe
 * - Haptic feedback at thresholds
 * - Rubber band effect
 * - Auto snap back
 *
 * @example
 * <SwipeableCard
 *   onSwipeLeft={() => dislikeOutfit()}
 *   onSwipeRight={() => saveOutfit()}
 *   leftAction={{
 *     icon: X,
 *     label: 'Niet mijn stijl',
 *     color: 'text-red-600',
 *     bgColor: 'bg-red-100',
 *     onTrigger: () => dislike()
 *   }}
 * >
 *   <OutfitContent />
 * </SwipeableCard>
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = defaultLeftAction,
  rightAction = defaultRightAction,
  swipeThreshold = 100,
  disabled = false
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const hasTriggeredHaptic = useRef(false);

  // Transforms for visual feedback
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Action indicator opacities
  const leftOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;

    // Determine direction
    if (offset < -20) {
      setDragDirection('left');
    } else if (offset > 20) {
      setDragDirection('right');
    }

    // Haptic feedback at threshold
    if (Math.abs(offset) >= swipeThreshold && !hasTriggeredHaptic.current) {
      haptics.impact();
      hasTriggeredHaptic.current = true;
    } else if (Math.abs(offset) < swipeThreshold) {
      hasTriggeredHaptic.current = false;
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe left (dislike/remove)
    if ((offset < -swipeThreshold || velocity < -500) && onSwipeLeft) {
      haptics.success();
      leftAction.onTrigger();
      onSwipeLeft();
    }
    // Swipe right (like/save)
    else if ((offset > swipeThreshold || velocity > 500) && onSwipeRight) {
      haptics.success();
      rightAction.onTrigger();
      onSwipeRight();
    }
    // Snap back
    else {
      haptics.tap();
      x.set(0);
    }

    setDragDirection(null);
    hasTriggeredHaptic.current = false;
  };

  return (
    <div className="relative">
      {/* Left action indicator (shows on right swipe) */}
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-0"
        style={{ opacity: rightOpacity }}
      >
        <div className={`flex flex-col items-center gap-1 p-3 rounded-full ${rightAction.bgColor}`}>
          <rightAction.icon className={`w-6 h-6 ${rightAction.color}`} />
        </div>
      </motion.div>

      {/* Right action indicator (shows on left swipe) */}
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-0"
        style={{ opacity: leftOpacity }}
      >
        <div className={`flex flex-col items-center gap-1 p-3 rounded-full ${leftAction.bgColor}`}>
          <leftAction.icon className={`w-6 h-6 ${leftAction.color}`} />
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x,
          rotate,
          opacity
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Stack Swipeable Cards
 * Tinder-style card stack for browsing multiple items
 */
interface StackSwipeableCardsProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onSwipeLeft?: (item: T) => void;
  onSwipeRight?: (item: T) => void;
  onStackEmpty?: () => void;
  maxVisible?: number;
}

export function StackSwipeableCards<T>({
  items,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  onStackEmpty,
  maxVisible = 3
}: StackSwipeableCardsProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    if (currentIndex < items.length) {
      onSwipeLeft?.(items[currentIndex]);
      setCurrentIndex(currentIndex + 1);

      if (currentIndex + 1 >= items.length) {
        onStackEmpty?.();
      }
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < items.length) {
      onSwipeRight?.(items[currentIndex]);
      setCurrentIndex(currentIndex + 1);

      if (currentIndex + 1 >= items.length) {
        onStackEmpty?.();
      }
    }
  };

  const visibleCards = items.slice(currentIndex, currentIndex + maxVisible);

  if (visibleCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-700)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Geen items meer
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Je hebt alle items bekeken!
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {visibleCards.map((item, index) => {
        const isTop = index === 0;
        const zIndex = maxVisible - index;
        const scale = 1 - index * 0.05;
        const y = index * 8;

        return (
          <motion.div
            key={currentIndex + index}
            className="absolute inset-0"
            style={{
              zIndex,
              scale,
              y
            }}
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale, y, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isTop ? (
              <SwipeableCard
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              >
                {renderCard(item)}
              </SwipeableCard>
            ) : (
              <div className="pointer-events-none">
                {renderCard(item)}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Horizontal Swipe List
 * Gmail-style swipe actions on list items
 */
interface HorizontalSwipeListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function HorizontalSwipeListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Delete',
  rightLabel = 'Archive'
}: HorizontalSwipeListItemProps) {
  const x = useMotionValue(0);
  const leftBgColor = useTransform(x, [-100, -50, 0], ['#ef4444', '#f87171', '#f3f4f6']);
  const rightBgColor = useTransform(x, [0, 50, 100], ['#f3f4f6', '#34d399', '#10b981']);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;

    if (offset < -80 && onSwipeLeft) {
      haptics.success();
      onSwipeLeft();
    } else if (offset > 80 && onSwipeRight) {
      haptics.success();
      onSwipeRight();
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[var(--color-surface)] rounded-xl">
      {/* Left action background */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-end pr-4"
        style={{ backgroundColor: leftBgColor }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.div>

      {/* Right action background */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-start pl-4"
        style={{ backgroundColor: rightBgColor }}
      >
        <Heart className="w-5 h-5 text-white" />
      </motion.div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-[var(--color-surface)]"
      >
        {children}
      </motion.div>
    </div>
  );
}
