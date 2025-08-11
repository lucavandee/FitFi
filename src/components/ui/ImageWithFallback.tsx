import React, { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  ratio?: number;    // bijv. 4/5
  fallback?: string; // '/img/placeholders/outfit.webp'
  componentName?: string;
};

export default function ImageWithFallback({
  src, 
  alt, 
  ratio = 4/5, 
  fallback = '/images/outfit-fallback.jpg', 
  componentName,
  onError,
  className = '',
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1; // Single retry only

  // Determine which source to use
  const getSafeSrc = () => {
    if (!src || error) return fallback;
    return src;
  };

  const safeSrc = getSafeSrc();

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    const failedSrc = target.src;
    
    if (componentName) {
      console.warn(`[${componentName}] Image failed to load: ${failedSrc}`);
    }
    
    // Call original onError if provided
    if (onError) {
      onError(event);
    }
    
    // Prevent infinite retry loops
    if (retryCount >= maxRetries) {
      console.warn(`[ImageWithFallback] Max retries reached for ${failedSrc}`);
      setError(true);
      setLoaded(true);
      return;
    }
    
    // Try fallback once
    if (retryCount === 0 && fallback && fallback !== failedSrc) {
      console.log(`[ImageWithFallback] Trying fallback: ${fallback}`);
      setRetryCount(1);
      return;
    }
    
    // Final fallback
    setError(true);
    setLoaded(true);
  };

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-neutral-100" 
      style={{ aspectRatio: ratio }}
    >
      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      
      {/* Image */}
      <img
        src={safeSrc}
        alt={alt || 'Outfit'}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...rest}
      />
      
      {/* Fallback text for broken images */}
      {(!src || error) && loaded && (
        <div className="absolute inset-0 grid place-items-center text-sm text-gray-500 bg-gray-100">
          Geen afbeelding
        </div>
      )}
    </div>
  );
}