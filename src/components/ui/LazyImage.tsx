import React, { useState, useRef, useEffect } from 'react';
import { isValidImageUrl, optimizeImageUrl } from '../../utils/imageUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  componentName?: string;
}

/**
 * A component for lazy-loading images with optimization and error handling
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  placeholder = '/placeholder.png',
  onLoad,
  onError,
  componentName = 'LazyImage'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Check if the image URL is valid
    if (!isValidImageUrl(src)) {
      console.warn(`[${componentName}] Invalid image URL: ${src}`);
      setHasError(true);
      if (onError) onError();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onError, componentName]);

  const optimizedSrc = optimizeImageUrl(src, { quality, width, height });

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.warn(`[${componentName}] Image failed to load: ${src}`);
    setHasError(true);
    if (onError) onError();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-orange-500 rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image failed to load</div>
          </div>
        </div>
      )}

      {/* Actual image - only load when in viewport */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;