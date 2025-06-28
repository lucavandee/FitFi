import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { isValidImageUrl, optimizeImageUrl } from '../../utils/imageUtils';

interface RetryableImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  maxRetries?: number;
  retryDelay?: number;
  onLoad?: () => void;
  onError?: (src: string) => void;
  componentName?: string;
}

/**
 * An image component with automatic retry logic and comprehensive error handling
 */
const RetryableImage: React.FC<RetryableImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.png',
  maxRetries = 2,
  retryDelay = 1000,
  onLoad,
  onError,
  componentName = 'RetryableImage'
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if URL is valid
    if (!isValidImageUrl(src)) {
      console.warn(`[${componentName}] Invalid image URL, using fallback: ${src}`);
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
      if (onError) onError(src);
      return;
    }
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn(`[${componentName}] Image loading timeout: ${src}`);
        setHasError(true);
        setIsLoading(false);
        if (onError) onError(src);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, fallbackSrc, componentName, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (onLoad) onLoad();
  };

  const handleError = () => {
    // Only retry if we haven't exceeded max retries and aren't already using fallback
    if (retryCount < maxRetries && currentSrc !== fallbackSrc) {
      setRetryCount(prev => prev + 1);
      
      // Add cache-busting parameter
      const cacheBuster = `?cb=${Date.now()}`;
      const srcWithCacheBuster = src.includes('?') 
        ? `${src}&cb=${Date.now()}` 
        : `${src}${cacheBuster}`;
      
      console.log(`[${componentName}] Retrying image load (${retryCount + 1}/${maxRetries}): ${srcWithCacheBuster}`);
      
      // Wait before retrying with exponential backoff
      setTimeout(() => {
        setCurrentSrc(srcWithCacheBuster);
      }, retryDelay * Math.pow(2, retryCount));
      
      return;
    }
    
    // All retries failed or already using fallback
    setIsLoading(false);
    setHasError(true);
    
    if (currentSrc !== fallbackSrc) {
      // Track broken image in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'broken_image', {
          event_category: 'error',
          event_label: src,
          component: componentName,
          non_interaction: true
        });
      }
      
      console.warn(`[${componentName}] Image failed after ${retryCount} retries: ${src}`);
      setCurrentSrc(fallbackSrc);
    } else {
      console.error(`[${componentName}] Critical: Fallback image also failed to load: ${fallbackSrc}`);
    }
    
    if (onError) onError(src);
  };

  const handleManualRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(optimizeImageUrl(src));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`${className} bg-[#1B263B] animate-pulse flex items-center justify-center`}>
        <div className="text-center text-white/50">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          <div className="text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div className={`${className} bg-[#1B263B] flex flex-col items-center justify-center text-white/50 p-4`}>
        <AlertCircle size={32} className="mb-2" />
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Image not available</div>
          <div className="text-xs mb-3">Failed to load image</div>
          <button
            onClick={handleManualRetry}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success state - show the actual image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
};

export default RetryableImage;