/**
 * Scroll utilities for smooth navigation and section scrolling
 */

const HEADER_HEIGHT = 72; // 4.5rem in pixels

/**
 * Smooth scroll to a section with header offset compensation
 * @param sectionId - ID of the target section
 * @param offset - Additional offset in pixels (default: HEADER_HEIGHT)
 */
export function scrollToSection(sectionId: string, offset: number = HEADER_HEIGHT): void {
  const element = document.getElementById(sectionId);
  
  if (!element) {
    console.warn(`Section with ID "${sectionId}" not found`);
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Check if an element is in viewport
 * @param element - DOM element to check
 * @param threshold - Percentage of element that should be visible (0-1)
 * @returns boolean indicating if element is in viewport
 */
export function isElementInViewport(element: Element, threshold: number = 0.1): boolean {
  const rect = element.getBoundingClientRect();
  const elementHeight = rect.bottom - rect.top;
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  
  return visibleHeight >= elementHeight * threshold;
}

/**
 * Add scroll margin top to sections for proper anchor scrolling
 * This should be called on page load to add the necessary CSS
 */
export function addScrollMarginToSections(): void {
  const sections = document.querySelectorAll('section[id], div[id]');
  
  sections.forEach(section => {
    if (section.id) {
      (section as HTMLElement).style.scrollMarginTop = `${HEADER_HEIGHT}px`;
    }
  });
}

/**
 * Smooth scroll with focus management for accessibility
 * @param targetId - ID of target element
 * @param shouldFocus - Whether to focus the target element after scrolling
 */
export function accessibleScrollTo(targetId: string, shouldFocus: boolean = false): void {
  scrollToSection(targetId);
  
  if (shouldFocus) {
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.addEventListener('blur', () => {
          target.removeAttribute('tabindex');
        }, { once: true });
      }
    }, 500); // Wait for scroll to complete
  }
}

export default {
  scrollToSection,
  scrollToTop,
  isElementInViewport,
  addScrollMarginToSections,
  accessibleScrollTo,
  HEADER_HEIGHT
};