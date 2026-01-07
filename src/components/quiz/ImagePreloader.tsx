import { useEffect } from 'react';

interface ImagePreloaderProps {
  imageUrls: string[];
  currentIndex: number;
  lookahead?: number;
}

/**
 * ImagePreloader - Preload upcoming images for smooth swipe experience
 *
 * Strategy:
 * 1. Preload next N images (default: 2)
 * 2. Use native Image() preloading (browser cache)
 * 3. Priority: current + 1, current + 2, etc.
 * 4. Clean up on unmount
 *
 * Performance:
 * - Prevents "flash of empty image" between swipes
 * - Uses browser's native image cache
 * - Non-blocking (async)
 * - Minimal memory footprint
 */
export function ImagePreloader({ imageUrls, currentIndex, lookahead = 2 }: ImagePreloaderProps) {
  useEffect(() => {
    // Preload next N images
    const imagesToPreload: HTMLImageElement[] = [];

    for (let i = 1; i <= lookahead; i++) {
      const nextIndex = currentIndex + i;

      // Don't preload beyond array bounds
      if (nextIndex >= imageUrls.length) break;

      const imageUrl = imageUrls[nextIndex];
      if (!imageUrl) continue;

      // Create Image object for preloading
      const img = new Image();

      // Optional: Add loading priority hint (Chrome/Edge)
      // @ts-ignore - fetchpriority is not in TS types yet
      img.fetchPriority = i === 1 ? 'high' : 'low';

      img.src = imageUrl;
      imagesToPreload.push(img);

      // Optional: Track preload success/failure
      img.onload = () => {
        // Image cached, swipe will be instant
      };

      img.onerror = (err) => {
        console.warn(`⚠️ Failed to preload image ${i} ahead:`, imageUrl, err);
      };
    }

    // Cleanup: Remove references on unmount or index change
    return () => {
      imagesToPreload.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = ''; // Release memory
      });
    };
  }, [imageUrls, currentIndex, lookahead]);

  // This component doesn't render anything
  return null;
}

/**
 * useImagePreloader - Hook version for more control
 *
 * Usage:
 * ```tsx
 * useImagePreloader(imageUrls, currentIndex, 2);
 * ```
 */
export function useImagePreloader(
  imageUrls: string[],
  currentIndex: number,
  lookahead: number = 2
) {
  useEffect(() => {
    const imagesToPreload: HTMLImageElement[] = [];

    for (let i = 1; i <= lookahead; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex >= imageUrls.length) break;

      const imageUrl = imageUrls[nextIndex];
      if (!imageUrl) continue;

      const img = new Image();
      // @ts-ignore
      img.fetchPriority = i === 1 ? 'high' : 'low';
      img.src = imageUrl;
      imagesToPreload.push(img);
    }

    return () => {
      imagesToPreload.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
    };
  }, [imageUrls, currentIndex, lookahead]);
}
