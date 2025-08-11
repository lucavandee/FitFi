/**
 * Scroll utilities for smooth navigation and section scrolling
 */

const HEADER_HEIGHT = 72; // 4.5rem in pixels

/**
 * Handle hash-based navigation with header offset
 * @param href - URL with potential hash
 */
export function scrollToHash(href: string): void {
  if (href.includes('#')) {
    const hash = href.split('#')[1];
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - HEADER_HEIGHT;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
}

