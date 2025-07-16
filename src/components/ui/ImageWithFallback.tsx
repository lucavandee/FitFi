import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (originalSrc: string) => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  width?: number | string;
  height?: number | string;
  componentName?: string;
}

/**
 * A reusable image component with built-in fallback handling
 * 
 * This component will automatically handle image loading errors
 * and display a fallback image when the original source fails to load.
 * It also includes URL validation to prevent known problematic domains.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  className = '',
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  width,
  height,
  componentName = 'Unknown',
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const retryCount = useRef<number>(0);
  const MAX_RETRIES = 2;
  
  // Reset state when src changes
  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setHasError(false);
    setImgSrc(src);
    retryCount.current = 0;
  }, [src]);
  
  // Use fallback immediately if URL is invalid
  useEffect(() => {
    if (!isValidImageUrl(imgSrc)) {
      console.warn(`[${componentName ?? 'ImageWithFallback'}] Invalid image URL, using fallback: ${imgSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
      if (onError) {
        onError(src);
      }
      
      // Track broken image
      trackBrokenImage(src, componentName);
    }
  }, [imgSrc, fallbackSrc, onError, src, componentName]);
  
  const handleError = () => {
    // Only update if we haven't already fallen back
    if (imgSrc !== fallbackSrc) {
      // Log the error for tracking purposes
      console.warn(`[${componentName ?? 'ImageWithFallback'}] Image failed to load: ${imgSrc}`);
      
      // Try to retry loading the image
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        
        // Add cache-busting parameter to force reload
        const cacheBuster = `?cb=${Date.now()}`;
        const srcWithCacheBuster = src.includes('?') 
          ? `${src}&cb=${Date.now()}` 
          : `${src}${cacheBuster}`;
        
        console.log(`[${componentName ?? 'ImageWithFallback'}] Retrying image load (${retryCount.current}/${MAX_RETRIES}): ${srcWithCacheBuster}`);
        setImgSrc(srcWithCacheBuster);
        return;
      }
      
      // Call the optional onError callback with the original source
      if (onError) {
        onError(imgSrc);
      }
      
      // Set error state to trigger fallback
      setHasError(true);
      setImgSrc(fallbackSrc);
      
      // Track broken image
      trackBrokenImage(src, componentName);
    } else if (imgSrc === fallbackSrc) {
      // If even the fallback fails, log a critical error
      console.error(`[${componentName ?? 'ImageWithFallback'}] Critical: Fallback image also failed to load: ${fallbackSrc}`);
      
      // Use an inline SVG as last resort
      setImgSrc(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Cpath d='M30,50 L70,50 M50,30 L50,70' stroke='%23999' stroke-width='4'/%3E%3C/svg%3E`);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  // Optimize image URL
  const optimizedSrc = optimizeImageUrl(imgSrc, {
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined
  });

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        decoding={decoding}
        width={width}
        height={height}
        {...rest}
      />
    </div>
  );
};

// List of known problematic domains
const PROBLEMATIC_DOMAINS = [
  'debijenkorf.nl',
  'massimo-dutti',
  'bijenkorf',
  'cdn.debijenkorf',
  'media.s-bol.com'
];

// Validate if an image URL is likely to work
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  // Check for known problematic domains
  if (PROBLEMATIC_DOMAINS.some(domain => url.includes(domain))) {
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

// Optimize image URL for better performance
const optimizeImageUrl = (
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

// Track broken image for analytics
const trackBrokenImage = (imageUrl: string, componentName: string): void => {
  // In a real app, you would send this to your analytics service
  console.warn(`[Analytics] Broken image tracked: ${imageUrl} in ${componentName ?? 'Unknown'}`);
  
  // Store broken image URL in localStorage for future reference
  const brokenImagesKey = 'fitfi-broken-images';
  const brokenImages = JSON.parse(localStorage.getItem(brokenImagesKey) || '[]');
  
  if (!brokenImages.includes(imageUrl)) {
    brokenImages.push(imageUrl);
    localStorage.setItem(brokenImagesKey, JSON.stringify(brokenImages));
  }
};

export default ImageWithFallback;