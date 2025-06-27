/**
 * Utility functions for image handling
 */

/**
 * List of known problematic domains that often fail to load
 */
export const PROBLEMATIC_DOMAINS = [
  'debijenkorf.nl',
  'massimo-dutti',
  'bijenkorf',
  'cdn.debijenkorf',
  'media.s-bol.com'
];

/**
 * Validates if an image URL is likely to work
 * @param url - The image URL to validate
 * @returns Whether the URL is valid and not from a known problematic domain
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  // Check for known problematic domains
  if (PROBLEMATIC_DOMAINS.some(domain => url.includes(domain))) {
    return false;
  }
  
  // Check for relative URLs that start with /
  if (url.startsWith('/')) {
    // These are valid as they're relative to the base URL
    return true;
  }
  
  // Basic URL validation for absolute URLs
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Extracts the domain from a URL
 * @param url - The URL to extract the domain from
 * @returns The domain or null if invalid
 */
export const extractDomain = (url: string): string | null => {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (error) {
    return null;
  }
};

/**
 * Gets a fallback image URL based on category
 * @param category - Product category
 * @returns Fallback image URL
 */
export const getFallbackImageByCategory = (category?: string): string => {
  const fallbacks: Record<string, string> = {
    'Jassen': 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Broeken': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Tops': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Schoenen': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Accessoires': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Tassen': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'Jurken': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
  };
  
  return category && fallbacks[category] 
    ? fallbacks[category] 
    : '/placeholder.png';
};

/**
 * Optimizes an image URL for better performance
 * @param url - The image URL to optimize
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export const optimizeImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string => {
  if (!isValidImageUrl(url)) {
    return '/placeholder.png';
  }
  
  const { width, height, quality = 80 } = options;
  
  // Optimize Pexels images
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
};

/**
 * Preloads an image to ensure it's in the browser cache
 * @param src - The image URL to preload
 * @returns Promise that resolves when the image is loaded
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isValidImageUrl(src)) {
      reject(new Error('Invalid image URL'));
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * Preloads multiple images in parallel
 * @param urls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  const validUrls = urls.filter(isValidImageUrl);
  return Promise.all(validUrls.map(url => preloadImage(url)));
};

export default {
  isValidImageUrl,
  extractDomain,
  getFallbackImageByCategory,
  optimizeImageUrl,
  preloadImage,
  preloadImages,
  PROBLEMATIC_DOMAINS
};