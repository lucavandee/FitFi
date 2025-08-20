/**
 * Body scroll utilities for modal/drawer management
 * Prevents background scrolling when overlays are open
 */

/**
 * Lock body scroll and compensate for scrollbar width
 * Prevents layout shift when scrollbar disappears
 */
export function lockBodyScroll(): void {
  if (typeof window === 'undefined') return;
  
  // Calculate scrollbar width to prevent layout shift
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  // Lock scroll
  document.body.style.overflow = 'hidden';
  
  // Compensate for scrollbar width
  if (scrollBarWidth > 0) {
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }
  
  // Add class for CSS targeting
  document.body.classList.add('scroll-locked');
}

/**
 * Unlock body scroll and remove scrollbar compensation
 */
export function unlockBodyScroll(): void {
  if (typeof window === 'undefined') return;
  
  // Restore scroll
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  // Remove class
  document.body.classList.remove('scroll-locked');
}

/**
 * Toggle body scroll lock
 * @param lock - Whether to lock or unlock scroll
 */
export function toggleBodyScroll(lock: boolean): void {
  if (lock) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
}

/**
 * Check if body scroll is currently locked
 * @returns Whether body scroll is locked
 */
export function isBodyScrollLocked(): boolean {
  if (typeof window === 'undefined') return false;
  return document.body.style.overflow === 'hidden';
}