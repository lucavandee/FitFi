/**
 * Accessibility Utilities — WCAG 2.1 AA Compliant
 *
 * @module utils/accessibility
 * @description Helper functions for keyboard navigation, focus management,
 *              and ARIA attributes to ensure WCAG compliance.
 *
 * Legal Requirements:
 * - European Accessibility Act (EAA) - June 2025
 * - ADA (Americans with Disabilities Act)
 * - Section 508 (US Federal)
 *
 * All functions follow WCAG 2.1 Level AA guidelines.
 */

/**
 * Focus Trap for Modals/Dialogs
 * Keeps keyboard focus within a container (prevents tabbing outside)
 *
 * WCAG: 2.4.3 Focus Order (Level A)
 *
 * @example
 * const cleanupFocusTrap = createFocusTrap(modalRef.current);
 * // Later: cleanupFocusTrap();
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function getFocusableElements(): HTMLElement[] {
    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    // Shift+Tab on first element → focus last
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
      return;
    }

    // Tab on last element → focus first
    if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
      return;
    }
  }

  // Focus first element immediately
  const focusable = getFocusableElements();
  if (focusable.length > 0) {
    focusable[0].focus();
  }

  // Listen for Tab key
  container.addEventListener('keydown', handleKeyDown);

  // Cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Restore Focus After Modal Close
 * Returns focus to the element that opened the modal
 *
 * WCAG: 2.4.3 Focus Order (Level A)
 *
 * @example
 * const restoreFocus = saveFocusBeforeModal();
 * // ... modal opens ...
 * // ... modal closes ...
 * restoreFocus();
 */
export function saveFocusBeforeModal(): () => void {
  const activeElement = document.activeElement as HTMLElement;

  return () => {
    if (activeElement && activeElement.focus) {
      // Small delay to allow DOM updates
      requestAnimationFrame(() => {
        activeElement.focus();
      });
    }
  };
}

/**
 * Scroll to Element and Focus
 * Smooth scroll + focus management for skip links and navigation
 *
 * WCAG: 2.4.1 Bypass Blocks (Level A)
 *
 * @example
 * <a href="#main" onClick={(e) => {
 *   e.preventDefault();
 *   scrollToAndFocus('main');
 * }}>Skip to content</a>
 */
export function scrollToAndFocus(targetId: string): void {
  const target = document.getElementById(targetId);
  if (!target) return;

  // Smooth scroll
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  // Focus after scroll completes
  setTimeout(() => {
    // Make target focusable if not already
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus();
  }, 500);
}

/**
 * Announce to Screen Readers
 * Politely announces dynamic content changes
 *
 * WCAG: 4.1.3 Status Messages (Level AA)
 *
 * @example
 * announceToScreenReader('Form submitted successfully!');
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Keyboard Event Handler Generator
 * Handles Enter and Space as click events
 *
 * WCAG: 2.1.1 Keyboard (Level A)
 *
 * @example
 * <div
 *   onClick={handleClick}
 *   onKeyDown={makeKeyboardClickable(handleClick)}
 *   tabIndex={0}
 *   role="button"
 * >
 *   Click me
 * </div>
 */
export function makeKeyboardClickable(
  handler: (e: React.MouseEvent | React.KeyboardEvent) => void
): (e: React.KeyboardEvent) => void {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
    }
  };
}

/**
 * Check if Element is Keyboard Accessible
 * Validates that interactive elements are keyboard accessible
 *
 * @example
 * if (!isKeyboardAccessible(element)) {
 *   console.warn('Element is not keyboard accessible!');
 * }
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  // Has tabindex
  const hasTabIndex = element.hasAttribute('tabindex');

  // Is naturally focusable
  const naturallyFocusable = [
    'A',
    'BUTTON',
    'INPUT',
    'SELECT',
    'TEXTAREA',
  ].includes(element.tagName);

  // Has appropriate role
  const hasRole = element.hasAttribute('role');

  // Must have either native focusability or explicit tabindex
  const isFocusable = naturallyFocusable || hasTabIndex;

  // Interactive elements should have role
  const hasAppropriateRole = naturallyFocusable || hasRole;

  return isFocusable && hasAppropriateRole;
}

/**
 * WCAG AA Focus Classes
 * CSS class strings for consistent focus states
 */
export const FOCUS_CLASSES = {
  /** Standard focus (light backgrounds) */
  standard: 'ff-focus',

  /** Brand focus (light backgrounds only) */
  brand: 'ff-focus--brand',

  /** Dark background focus */
  dark: 'ff-focus--dark',

  /** Strong focus (critical CTAs) */
  strong: 'ff-focus--strong',

  /** Inline Tailwind focus (when utility classes needed) */
  inline: [
    'outline-none',
    'transition-all',
    'focus-visible:shadow-[var(--ff-shadow-ring)]',
    'focus-visible:outline-[3px]',
    'focus-visible:outline-solid',
    'focus-visible:outline-[var(--ff-focus-ring-color)]',
    'focus-visible:outline-offset-2',
  ].join(' '),
} as const;

/**
 * ARIA Expanded Props
 * Generates correct ARIA props for expandable elements
 *
 * @example
 * <button {...getAriaExpandedProps(isOpen, 'menu-panel')}>
 *   Menu
 * </button>
 */
export function getAriaExpandedProps(
  isExpanded: boolean,
  controlsId?: string
): {
  'aria-expanded': boolean;
  'aria-controls'?: string;
} {
  const props: {
    'aria-expanded': boolean;
    'aria-controls'?: string;
  } = {
    'aria-expanded': isExpanded,
  };

  if (controlsId) {
    props['aria-controls'] = controlsId;
  }

  return props;
}

/**
 * Generate Unique ID
 * Creates unique IDs for ARIA relationships
 *
 * @example
 * const labelId = generateUniqueId('label');
 * <span id={labelId}>Field Label</span>
 * <input aria-labelledby={labelId} />
 */
let idCounter = 0;
export function generateUniqueId(prefix: string = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Contrast Ratio Calculator
 * Calculates WCAG contrast ratio between two colors
 *
 * @returns Contrast ratio (1-21)
 * @example
 * const ratio = getContrastRatio('#1E2333', '#F7F3EC');
 * // 13.2:1 ✅ WCAG AA Pass
 */
export function getContrastRatio(color1: string, color2: string): number {
  function parseColor(color: string): [number, number, number] {
    // Simple hex parser (supports #RGB and #RRGGBB)
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  function getLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const srgb = c / 255;
      return srgb <= 0.03928
        ? srgb / 12.92
        : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  const lum1 = getLuminance(parseColor(color1));
  const lum2 = getLuminance(parseColor(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG Compliance
 * Validates contrast ratio against WCAG standards
 *
 * @example
 * const result = checkWCAGCompliance('#1E2333', '#F7F3EC', 'normal');
 * // { ratio: 13.2, passAA: true, passAAA: true }
 */
export function checkWCAGCompliance(
  foreground: string,
  background: string,
  textType: 'normal' | 'large' | 'ui' = 'normal'
): {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  message: string;
} {
  const ratio = getContrastRatio(foreground, background);

  let aaMinimum = 4.5;
  let aaaMinimum = 7;

  if (textType === 'large') {
    // Large text: 18pt+ or 14pt+ bold
    aaMinimum = 3;
    aaaMinimum = 4.5;
  } else if (textType === 'ui') {
    // UI components (borders, icons, etc)
    aaMinimum = 3;
    aaaMinimum = 3; // AAA same as AA for UI
  }

  const passAA = ratio >= aaMinimum;
  const passAAA = ratio >= aaaMinimum;

  let message = `${ratio.toFixed(1)}:1`;
  if (passAAA) {
    message += ' ✅ WCAG AAA';
  } else if (passAA) {
    message += ' ✅ WCAG AA';
  } else {
    message += ` ❌ FAIL (need ${aaMinimum}:1)`;
  }

  return { ratio, passAA, passAAA, message };
}

/**
 * Keyboard Navigation Hook Helper
 * Common keyboard navigation patterns
 *
 * @example
 * const { onKeyDown } = useKeyboardNav({
 *   onEnter: handleSelect,
 *   onEscape: handleClose,
 *   onArrowDown: handleNext,
 *   onArrowUp: handlePrev,
 * });
 */
export function createKeyboardNavHandler(handlers: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
}): (e: React.KeyboardEvent) => void {
  return (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        if (handlers.onEnter) {
          e.preventDefault();
          handlers.onEnter();
        }
        break;
      case ' ':
        if (handlers.onSpace) {
          e.preventDefault();
          handlers.onSpace();
        }
        break;
      case 'Escape':
        if (handlers.onEscape) {
          e.preventDefault();
          handlers.onEscape();
        }
        break;
      case 'ArrowUp':
        if (handlers.onArrowUp) {
          e.preventDefault();
          handlers.onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (handlers.onArrowDown) {
          e.preventDefault();
          handlers.onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (handlers.onArrowLeft) {
          e.preventDefault();
          handlers.onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (handlers.onArrowRight) {
          e.preventDefault();
          handlers.onArrowRight();
        }
        break;
      case 'Home':
        if (handlers.onHome) {
          e.preventDefault();
          handlers.onHome();
        }
        break;
      case 'End':
        if (handlers.onEnd) {
          e.preventDefault();
          handlers.onEnd();
        }
        break;
    }
  };
}

/**
 * Export all utilities as default object
 */
export default {
  createFocusTrap,
  saveFocusBeforeModal,
  scrollToAndFocus,
  announceToScreenReader,
  makeKeyboardClickable,
  isKeyboardAccessible,
  FOCUS_CLASSES,
  getAriaExpandedProps,
  generateUniqueId,
  getContrastRatio,
  checkWCAGCompliance,
  createKeyboardNavHandler,
};
