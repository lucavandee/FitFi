import { useEffect, useRef, useState } from 'react';

interface UseExitIntentOptions {
  threshold?: number;
  maxDisplays?: number;
  delayMs?: number;
  enabled?: boolean;
}

export function useExitIntent(options: UseExitIntentOptions = {}) {
  const {
    threshold = 20,
    maxDisplays = 1,
    delayMs = 0,
    enabled = true,
  } = options;

  const [shouldShow, setShouldShow] = useState(false);
  const displayCount = useRef(0);
  const hasShown = useRef(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!enabled || hasShown.current || displayCount.current >= maxDisplays) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= threshold &&
        !hasShown.current &&
        displayCount.current < maxDisplays
      ) {
        if (delayMs > 0) {
          timeoutRef.current = window.setTimeout(() => {
            setShouldShow(true);
            hasShown.current = true;
            displayCount.current += 1;
          }, delayMs);
        } else {
          setShouldShow(true);
          hasShown.current = true;
          displayCount.current += 1;
        }
      }
    };

    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseout', handleMouseLeave);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [threshold, maxDisplays, delayMs, enabled]);

  const reset = () => {
    hasShown.current = false;
    setShouldShow(false);
  };

  const dismiss = () => {
    setShouldShow(false);
  };

  return { shouldShow, reset, dismiss };
}
