import { useEffect, useRef, useState } from 'react';

interface SwipeToCloseOptions {
  onClose: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface SwipeState {
  startY: number;
  currentY: number;
  isDragging: boolean;
}

export function useSwipeToClose({
  onClose,
  threshold = 150,
  enabled = true,
}: SwipeToCloseOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startY: 0,
    currentY: 0,
    isDragging: false,
  });

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    let rafId: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setSwipeState({
        startY: touch.clientY,
        currentY: touch.clientY,
        isDragging: true,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.isDragging && e.touches[0]) {
        const touch = e.touches[0];
        const deltaY = touch.clientY - swipeState.startY;

        if (deltaY > 0) {
          e.preventDefault();

          if (rafId) {
            cancelAnimationFrame(rafId);
          }

          rafId = requestAnimationFrame(() => {
            setSwipeState(prev => ({
              ...prev,
              currentY: touch.clientY,
            }));
          });
        }
      }
    };

    const handleTouchEnd = () => {
      const deltaY = swipeState.currentY - swipeState.startY;

      if (deltaY > threshold) {
        onClose();
      }

      setSwipeState({
        startY: 0,
        currentY: 0,
        isDragging: false,
      });

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled, onClose, threshold, swipeState.isDragging, swipeState.startY]);

  const deltaY = swipeState.isDragging
    ? Math.max(0, swipeState.currentY - swipeState.startY)
    : 0;

  const opacity = swipeState.isDragging
    ? Math.max(0.3, 1 - deltaY / (threshold * 2))
    : 1;

  return {
    elementRef,
    deltaY,
    opacity,
    isDragging: swipeState.isDragging,
  };
}
