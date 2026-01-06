import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { haptics } from '@/utils/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

/**
 * Pull-to-Refresh Component
 * Native iOS/Android-style pull-to-refresh interaction
 *
 * @example
 * <PullToRefresh onRefresh={async () => { await refetchData(); }}>
 *   <DashboardContent />
 * </PullToRefresh>
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const y = useMotionValue(0);

  // Transform for rotation of refresh icon
  const rotate = useTransform(y, [0, threshold], [0, 180]);

  // Transform for opacity
  const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);

  // Transform for scale
  const scale = useTransform(y, [0, threshold / 2, threshold], [0.5, 0.8, 1]);

  // Check if user is at top of scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setIsAtTop(element.scrollTop === 0);
  }, []);

  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isAtTop) return;

    startY.current = info.point.y;
    haptics.tap();
  }, [disabled, isRefreshing, isAtTop]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isAtTop) return;

    currentY.current = info.point.y;
    const delta = Math.max(0, currentY.current - startY.current);

    // Apply rubber band effect
    const dampenedDelta = Math.min(delta * 0.5, threshold * 1.2);
    y.set(dampenedDelta);

    // Haptic feedback at threshold
    if (dampenedDelta >= threshold && currentY.current - startY.current === delta) {
      haptics.impact();
    }
  }, [disabled, isRefreshing, isAtTop, y, threshold]);

  const handleDragEnd = useCallback(async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isAtTop) {
      y.set(0);
      return;
    }

    const delta = currentY.current - startY.current;

    if (delta >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      haptics.success();

      try {
        await onRefresh();
      } catch (error) {
        console.error('[PullToRefresh] Refresh failed:', error);
        haptics.error();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      // Reset
      y.set(0);
    }
  }, [disabled, isRefreshing, isAtTop, y, threshold, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onScroll={handleScroll}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50"
        style={{
          y,
          opacity
        }}
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <motion.div
            className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center"
            style={{
              rotate,
              scale
            }}
          >
            <RefreshCw
              className={[
                'w-5 h-5 text-[var(--ff-color-primary-700)]',
                isRefreshing && 'animate-spin'
              ].filter(Boolean).join(' ')}
            />
          </motion.div>

          {!isRefreshing && (
            <motion.p
              className="text-xs text-[var(--color-muted)] font-medium"
              style={{ opacity }}
            >
              {currentY.current - startY.current >= threshold ? 'Laat los om te vernieuwen' : 'Trek om te vernieuwen'}
            </motion.p>
          )}

          {isRefreshing && (
            <p className="text-xs text-[var(--color-muted)] font-medium">
              Vernieuwen...
            </p>
          )}
        </div>
      </motion.div>

      {/* Content wrapper with drag detection */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Lightweight version without Framer Motion (for performance-critical areas)
 */
export function SimplePullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance * 0.5, threshold * 1.2));
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      haptics.success();

      try {
        await onRefresh();
      } catch (error) {
        haptics.error();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Simple indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 transition-all duration-200"
          style={{
            transform: `translateY(${pullDistance}px)`,
            opacity: Math.min(pullDistance / threshold, 1)
          }}
        >
          <div className="py-4">
            <RefreshCw
              className={[
                'w-6 h-6 text-[var(--ff-color-primary-700)]',
                isRefreshing && 'animate-spin'
              ].filter(Boolean).join(' ')}
            />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
