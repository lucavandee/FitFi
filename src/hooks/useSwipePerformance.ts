import { useEffect, useRef } from 'react';

interface SwipePerformanceMetrics {
  imageLoadTime: number;
  swipeToNextDelay: number;
  animationFramerate: number;
  totalSwipeTime: number;
}

/**
 * useSwipePerformance - Monitor swipe performance metrics
 *
 * Tracks:
 * - Image load time (via PerformanceObserver)
 * - Time between swipe action and next card render
 * - Animation smoothness (FPS)
 * - Memory usage (if available)
 *
 * Usage:
 * ```tsx
 * const { trackSwipe, getMetrics } = useSwipePerformance();
 *
 * const handleSwipe = () => {
 *   trackSwipe('start');
 *   // ... swipe logic
 *   trackSwipe('end');
 * };
 * ```
 */
export function useSwipePerformance() {
  const metricsRef = useRef<SwipePerformanceMetrics[]>([]);
  const swipeStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    // Monitor image load performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource' && entry.name.includes('storage')) {
            // Image from Supabase storage
            const duration = entry.duration;
            console.debug(`📊 Image load time: ${duration.toFixed(2)}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // PerformanceObserver not fully supported
      }

      return () => observer.disconnect();
    }
  }, []);

  const trackSwipe = (event: 'start' | 'end') => {
    if (event === 'start') {
      swipeStartTimeRef.current = performance.now();
    } else if (event === 'end') {
      const duration = performance.now() - swipeStartTimeRef.current;
      console.debug(`⚡ Swipe completed in ${duration.toFixed(2)}ms`);

      // Warn if slow
      if (duration > 300) {
        console.warn(`⚠️ Slow swipe detected: ${duration.toFixed(2)}ms (target: <300ms)`);
      }
    }
  };

  const trackFrameRate = () => {
    const now = performance.now();
    if (lastFrameTimeRef.current > 0) {
      const delta = now - lastFrameTimeRef.current;
      const fps = 1000 / delta;
      frameCountRef.current++;

      // Log FPS every 60 frames (1 second at 60fps)
      if (frameCountRef.current % 60 === 0) {
        console.debug(`🎬 Average FPS: ${fps.toFixed(1)}`);

        // Warn if low FPS
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps.toFixed(1)} (target: 60)`);
        }
      }
    }
    lastFrameTimeRef.current = now;
  };

  const getMetrics = () => {
    return metricsRef.current;
  };

  const logMemoryUsage = () => {
    // @ts-ignore - performance.memory is Chrome-only
    if (performance.memory) {
      // @ts-ignore
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      const usedMB = (usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (totalJSHeapSize / 1024 / 1024).toFixed(2);
      console.debug(`💾 Memory: ${usedMB}MB / ${totalMB}MB`);

      // Warn if high memory usage
      const usagePercent = (usedJSHeapSize / totalJSHeapSize) * 100;
      if (usagePercent > 80) {
        console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  };

  return {
    trackSwipe,
    trackFrameRate,
    getMetrics,
    logMemoryUsage
  };
}

/**
 * Performance tips for developers:
 *
 * 1. Image Optimization:
 *    - Use WebP format (smaller, faster)
 *    - Serve responsive images (srcset)
 *    - Compress to ~100-200KB per image
 *    - Use CDN (Supabase Storage has built-in CDN)
 *
 * 2. Animation Optimization:
 *    - Use transform/opacity (GPU-accelerated)
 *    - Avoid animating width/height/top/left
 *    - Use will-change sparingly (CSS)
 *    - Framer Motion already optimizes this
 *
 * 3. Rendering Optimization:
 *    - Lazy load images (only current + next 2)
 *    - Use React.memo for heavy components
 *    - Avoid inline functions in render
 *    - Use CSS containment (contain: layout paint)
 *
 * 4. Memory Management:
 *    - Clean up Image() objects after preload
 *    - Unmount unused components
 *    - Avoid memory leaks in useEffect
 *
 * 5. Network Optimization:
 *    - Preconnect to storage domain
 *    - Use HTTP/2 (Supabase supports this)
 *    - Enable image caching (Cache-Control headers)
 *    - Consider Service Worker for offline
 */
