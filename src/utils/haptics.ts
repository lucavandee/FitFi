/**
 * Haptic Feedback Utility
 *
 * Provides consistent haptic feedback across the app
 * Gracefully degrades when not supported
 *
 * Supported on:
 * - iOS Safari (iPhone 6s+)
 * - Android Chrome (Android 8+)
 * - PWA on supported devices
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotification = 'success' | 'warning' | 'error';

class HapticEngine {
  private isSupported: boolean;

  constructor() {
    // Check if haptics are supported
    this.isSupported = 'vibrate' in navigator || 'hapticEngine' in window;
  }

  /**
   * Light tap feedback
   * Use for: Button taps, selections, toggles
   */
  tap() {
    if (!this.isSupported) return;

    try {
      if ('hapticEngine' in window) {
        // iOS Haptic Engine (if available via capacitor/native bridge)
        (window as any).hapticEngine?.impact({ style: 'light' });
      } else {
        // Fallback to vibrate API
        navigator.vibrate(10);
      }
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Impact feedback (medium)
   * Use for: Threshold reached, important selections, swipe actions
   */
  impact(style: HapticStyle = 'medium') {
    if (!this.isSupported) return;

    const durations: Record<HapticStyle, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      rigid: 15,
      soft: 12
    };

    try {
      if ('hapticEngine' in window) {
        (window as any).hapticEngine?.impact({ style });
      } else {
        navigator.vibrate(durations[style]);
      }
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Notification feedback
   * Use for: Success/error/warning states
   */
  notification(type: HapticNotification) {
    if (!this.isSupported) return;

    const patterns: Record<HapticNotification, number[]> = {
      success: [10, 50, 10],
      warning: [10, 30, 10, 30, 10],
      error: [30, 50, 30]
    };

    try {
      if ('hapticEngine' in window) {
        (window as any).hapticEngine?.notification({ type });
      } else {
        navigator.vibrate(patterns[type]);
      }
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Success feedback
   * Use for: Completed actions, saved items, successful uploads
   */
  success() {
    this.notification('success');
  }

  /**
   * Error feedback
   * Use for: Failed actions, validation errors
   */
  error() {
    this.notification('error');
  }

  /**
   * Warning feedback
   * Use for: Important alerts, confirmations needed
   */
  warning() {
    this.notification('warning');
  }

  /**
   * Selection feedback
   * Use for: Item selections, radio buttons, checkboxes
   */
  selection() {
    this.tap();
  }

  /**
   * Custom vibration pattern
   * @param pattern Array of vibration/pause durations in ms
   */
  custom(pattern: number[]) {
    if (!this.isSupported) return;

    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Cancel any ongoing vibration
   */
  cancel() {
    if (!this.isSupported) return;

    try {
      navigator.vibrate(0);
    } catch (e) {
      // Silently fail
    }
  }
}

// Export singleton instance
export const haptics = new HapticEngine();

/**
 * React hook for haptics
 *
 * @example
 * const haptics = useHaptics();
 * haptics.tap();
 */
export function useHaptics() {
  return haptics;
}

/**
 * Haptic feedback wrapper for onClick handlers
 *
 * @example
 * <button onClick={withHaptic(() => handleClick(), 'tap')}>
 *   Click me
 * </button>
 */
export function withHaptic<T extends any[]>(
  callback: (...args: T) => void,
  type: 'tap' | 'impact' | 'success' | 'error' | 'warning' = 'tap'
) {
  return (...args: T) => {
    haptics[type]();
    callback(...args);
  };
}
