/**
 * Performance optimization utilities for FitFi
 */

/**
 * Preload critical resources
 */
const preloadCriticalResources = (): void => {
  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
  ];

  fontPreloads.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2',
    '/placeholder.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load non-critical resources
 */
const lazyLoadResources = (): void => {
  // Lazy load analytics
  if (typeof window !== 'undefined' && import.meta.env.VITE_GTAG_ID) {
    setTimeout(() => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GTAG_ID}`;
      document.head.appendChild(script);
    }, 3000); // Load after 3 seconds
  }
};

/**
 * Optimize bundle loading with prefetch hints
 */
const addPrefetchHints = (): void => {
  const prefetchRoutes = [
    '/onboarding',
    '/quiz',
    '/results',
    '/dashboard'
  ];

  prefetchRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

/**
 * Monitor Core Web Vitals
 */
const monitorWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  // Monitor LCP (Largest Contentful Paint)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
        
        // Track in analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'LCP',
            value: Math.round(entry.startTime)
          });
        }
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.warn('Performance observer not supported');
  }

  // Monitor CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.warn('Layout shift observer not supported');
  }

  // Report CLS on page unload
  window.addEventListener('beforeunload', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: 'CLS',
        value: Math.round(clsValue * 1000)
      });
    }
  });
};

/**
 * Optimize images with Intersection Observer
 */
const setupImageLazyLoading = (): void => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  // Run immediately
  preloadCriticalResources();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupImageLazyLoading();
      monitorWebVitals();
    });
  } else {
    setupImageLazyLoading();
    monitorWebVitals();
  }
  
  // Run after initial load
  window.addEventListener('load', () => {
    lazyLoadResources();
    addPrefetchHints();
  });
};

