import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
}

/**
 * Hook for optimizing and validating images
 * Provides utilities for image URL optimization, validation, and preloading
 */
export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState<boolean>(false);
  const [brokenDomains, setBrokenDomains] = useState<string[]>([
    'debijenkorf.nl',
    'massimo-dutti',
    'bijenkorf',
    'cdn.debijenkorf'
  ]);

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    setIsWebPSupported(checkWebPSupport());
    
    // Load broken domains from localStorage if available
    const savedBrokenDomains = localStorage.getItem('fitfi-broken-domains');
    if (savedBrokenDomains) {
      try {
        const parsedDomains = JSON.parse(savedBrokenDomains);
        if (Array.isArray(parsedDomains)) {
          setBrokenDomains(parsedDomains);
        }
      } catch (error) {
        console.error('Failed to parse broken domains from localStorage:', error);
      }
    }
  }, []);

  /**
   * Validates if an image URL is likely to work
   * @param url - The image URL to validate
   * @returns Whether the URL is valid and not from a known problematic domain
   */
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    
    // Check for known problematic domains
    if (brokenDomains.some(domain => url.includes(domain))) {
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Optimizes an image URL with appropriate parameters
   * @param url - The original image URL
   * @param options - Optimization options
   * @returns The optimized image URL or fallback
   */
  const optimizeImageUrl = (
    url: string, 
    options: ImageOptimizationOptions = {}
  ): string => {
    // If URL is invalid or empty, return placeholder
    if (!isValidImageUrl(url)) {
      console.warn(`Invalid image URL: ${url}, using placeholder instead`);
      return '/placeholder.png';
    }
    
    const { quality = 80, width, height } = options;
    const format = options.format || (isWebPSupported ? 'webp' : 'jpeg');
    
    try {
      // For Pexels images, add optimization parameters
      if (url.includes('pexels.com')) {
        const params = new URLSearchParams();
        params.append('auto', 'compress');
        params.append('cs', 'tinysrgb');
        if (width) params.append('w', width.toString());
        if (height) params.append('h', height.toString());
        params.append('dpr', '2');
        
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${params.toString()}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error optimizing image URL:', error);
      return url;
    }
  };

  /**
   * Preloads an image to ensure it's in the browser cache
   * @param src - The image URL to preload
   * @returns Promise that resolves when the image is loaded
   */
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isValidImageUrl(src)) {
        reject(new Error('Invalid image URL'));
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        
        // Add to broken domains list if not already included
        const domain = extractDomain(src);
        if (domain && !brokenDomains.includes(domain)) {
          const updatedDomains = [...brokenDomains, domain];
          setBrokenDomains(updatedDomains);
          localStorage.setItem('fitfi-broken-domains', JSON.stringify(updatedDomains));
          console.log(`Added ${domain} to broken domains list`);
        }
        
        reject(new Error(`Failed to preload image: ${src}`));
      };
      img.src = src;
    });
  };

  /**
   * Extracts the domain from a URL
   * @param url - The URL to extract the domain from
   * @returns The domain or null if invalid
   */
  const extractDomain = (url: string): string | null => {
    try {
      const { hostname } = new URL(url);
      return hostname;
    } catch (error) {
      return null;
    }
  };

  /**
   * Reports a broken image URL to be tracked
   * @param url - The broken image URL
   * @param component - The component that reported the broken URL
   */
  const reportBrokenImage = (url: string, component: string = 'Unknown'): void => {
    console.warn(`[${component}] Broken image URL: ${url}`);
    
    // Track in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'broken_image', {
        event_category: 'error',
        event_label: url,
        component,
        non_interaction: true
      });
    }
    
    // Add to broken domains list if not already included
    const domain = extractDomain(url);
    if (domain && !brokenDomains.includes(domain)) {
      const updatedDomains = [...brokenDomains, domain];
      setBrokenDomains(updatedDomains);
      localStorage.setItem('fitfi-broken-domains', JSON.stringify(updatedDomains));
      console.log(`Added ${domain} to broken domains list`);
    }
  };

  return {
    isWebPSupported,
    isValidImageUrl,
    optimizeImageUrl,
    preloadImage,
    reportBrokenImage,
    brokenDomains
  };
};