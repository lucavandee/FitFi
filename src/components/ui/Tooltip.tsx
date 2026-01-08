/**
 * Universal Tooltip Component
 *
 * Works on:
 * - Desktop: Hover (instant)
 * - Mobile: Long-press (500ms) or tap-and-hold
 * - Touch: Optional always-visible variant for critical actions
 *
 * Features:
 * - Auto-positioning (top/bottom/left/right)
 * - Arrow indicator
 * - Accessible (aria-describedby)
 * - Animation (fade + scale)
 * - Portal rendering (avoids overflow issues)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipSize = 'sm' | 'md' | 'lg';
export type TooltipTheme = 'dark' | 'light' | 'primary';

interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;

  /** Preferred position (auto-adjusts if no space) */
  position?: TooltipPosition;

  /** Size variant */
  size?: TooltipSize;

  /** Theme variant */
  theme?: TooltipTheme;

  /** Delay before showing (ms) */
  delay?: number;

  /** Always visible (no hover required) */
  alwaysVisible?: boolean;

  /** Disable tooltip */
  disabled?: boolean;

  /** Enable on mobile long-press (default: true) */
  enableLongPress?: boolean;

  /** Long-press duration (ms, default: 500) */
  longPressDuration?: number;

  /** Custom className for tooltip */
  className?: string;

  /** Custom className for trigger */
  triggerClassName?: string;

  /** Accessibility: describe relationship */
  ariaLabel?: string;

  /** Children to wrap */
  children: React.ReactNode;
}

const SIZE_VARIANTS = {
  sm: 'px-2 py-1 text-xs max-w-[200px]',
  md: 'px-3 py-1.5 text-sm max-w-[280px]',
  lg: 'px-4 py-2 text-base max-w-[360px]'
};

const THEME_VARIANTS = {
  dark: 'bg-gray-900 text-white border-gray-800',
  light: 'bg-white text-gray-900 border-gray-200 shadow-xl',
  primary: 'bg-[var(--ff-color-primary-700)] text-white border-[var(--ff-color-primary-800)]'
};

const ARROW_SIZE = 6; // pixels

/**
 * Calculate tooltip position relative to trigger element
 */
function calculatePosition(
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  preferredPosition: TooltipPosition
): { position: Exclude<TooltipPosition, 'auto'>; x: number; y: number } {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollY: window.scrollY,
    scrollX: window.scrollX
  };

  const gap = 8; // Gap between trigger and tooltip

  // Calculate available space in each direction
  const spaceTop = triggerRect.top;
  const spaceBottom = viewport.height - triggerRect.bottom;
  const spaceLeft = triggerRect.left;
  const spaceRight = viewport.width - triggerRect.right;

  let position: Exclude<TooltipPosition, 'auto'> = preferredPosition === 'auto' ? 'top' : preferredPosition;

  // Auto-adjust if preferred position doesn't fit
  if (preferredPosition === 'auto') {
    if (spaceTop >= tooltipHeight + gap) {
      position = 'top';
    } else if (spaceBottom >= tooltipHeight + gap) {
      position = 'bottom';
    } else if (spaceRight >= tooltipWidth + gap) {
      position = 'right';
    } else if (spaceLeft >= tooltipWidth + gap) {
      position = 'left';
    } else {
      // Fallback: use largest space
      const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
      if (maxSpace === spaceBottom) position = 'bottom';
      else if (maxSpace === spaceTop) position = 'top';
      else if (maxSpace === spaceRight) position = 'right';
      else position = 'left';
    }
  }

  // Calculate coordinates
  let x = 0;
  let y = 0;

  switch (position) {
    case 'top':
      x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + viewport.scrollX;
      y = triggerRect.top - tooltipHeight - gap + viewport.scrollY;
      break;

    case 'bottom':
      x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + viewport.scrollX;
      y = triggerRect.bottom + gap + viewport.scrollY;
      break;

    case 'left':
      x = triggerRect.left - tooltipWidth - gap + viewport.scrollX;
      y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2 + viewport.scrollY;
      break;

    case 'right':
      x = triggerRect.right + gap + viewport.scrollX;
      y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2 + viewport.scrollY;
      break;
  }

  // Clamp to viewport bounds
  x = Math.max(gap, Math.min(x, viewport.width - tooltipWidth - gap));
  y = Math.max(gap, Math.min(y, viewport.height - tooltipHeight - gap + viewport.scrollY));

  return { position, x, y };
}

export function Tooltip({
  content,
  position = 'auto',
  size = 'md',
  theme = 'dark',
  delay = 0,
  alwaysVisible = false,
  disabled = false,
  enableLongPress = true,
  longPressDuration = 500,
  className,
  triggerClassName,
  ariaLabel,
  children
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState<Exclude<TooltipPosition, 'auto'>>('top');
  const [tooltipId] = useState(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const longPressRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef<number>(0);

  // Calculate position when visible
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const { position: pos, x, y } = calculatePosition(
      triggerRect,
      tooltipRect.width,
      tooltipRect.height,
      position
    );

    setCoords({ x, y });
    setActualPosition(pos);
  }, [position]);

  // Show tooltip with delay
  const showTooltip = useCallback(() => {
    if (disabled || alwaysVisible) return;

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [disabled, alwaysVisible, delay]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (alwaysVisible) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }

    setIsVisible(false);
  }, [alwaysVisible]);

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();

      // Recalculate on scroll/resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible, updatePosition]);

  // Desktop: Mouse handlers
  const handleMouseEnter = () => showTooltip();
  const handleMouseLeave = () => hideTooltip();

  // Mobile: Long-press handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableLongPress) return;

    touchStartRef.current = Date.now();

    longPressRef.current = setTimeout(() => {
      setIsVisible(true);
      // Haptic feedback (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, longPressDuration);
  };

  const handleTouchEnd = () => {
    if (!enableLongPress) return;

    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }

    // If long-press triggered, hide after 3s
    if (isVisible && Date.now() - touchStartRef.current >= longPressDuration) {
      setTimeout(() => setIsVisible(false), 3000);
    }
  };

  const handleTouchMove = () => {
    // Cancel long-press if finger moves
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (longPressRef.current) clearTimeout(longPressRef.current);
    };
  }, []);

  // Always show if alwaysVisible prop
  useEffect(() => {
    if (alwaysVisible) {
      setIsVisible(true);
    }
  }, [alwaysVisible]);

  if (disabled && !alwaysVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Trigger wrapper */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={cn('inline-block', triggerClassName)}
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      {/* Tooltip portal */}
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              className={cn(
                'fixed z-[9999] rounded-lg border font-medium pointer-events-none',
                SIZE_VARIANTS[size],
                THEME_VARIANTS[theme],
                className
              )}
              style={{
                left: coords.x,
                top: coords.y
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {/* Content */}
              <div className="relative z-10">{content}</div>

              {/* Arrow */}
              <div
                className={cn(
                  'absolute w-0 h-0 border-solid',
                  theme === 'dark' && 'border-gray-900',
                  theme === 'light' && 'border-white',
                  theme === 'primary' && 'border-[var(--ff-color-primary-700)]'
                )}
                style={{
                  ...(actualPosition === 'top' && {
                    bottom: -ARROW_SIZE,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
                    borderColor: 'inherit transparent transparent transparent'
                  }),
                  ...(actualPosition === 'bottom' && {
                    top: -ARROW_SIZE,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
                    borderColor: 'transparent transparent inherit transparent'
                  }),
                  ...(actualPosition === 'left' && {
                    right: -ARROW_SIZE,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
                    borderColor: 'transparent transparent transparent inherit'
                  }),
                  ...(actualPosition === 'right' && {
                    left: -ARROW_SIZE,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
                    borderColor: 'transparent inherit transparent transparent'
                  })
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/**
 * Simple text-only tooltip variant
 */
export function SimpleTooltip({
  text,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & { text: string }) {
  return (
    <Tooltip content={<span>{text}</span>} {...props}>
      {children}
    </Tooltip>
  );
}

/**
 * Keyboard shortcut tooltip
 */
export function KeyboardTooltip({
  text,
  shortcut,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & { text: string; shortcut: string }) {
  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <span>{text}</span>
          <kbd className="px-1.5 py-0.5 bg-black/20 rounded text-xs font-mono">{shortcut}</kbd>
        </div>
      }
      {...props}
    >
      {children}
    </Tooltip>
  );
}
