import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  componentName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'auto' | 'sync' | 'async';
};

const FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="100%" height="100%" fill="%23f4f4f5"/><circle cx="200" cy="280" r="40" fill="%2394a3b8"/><text x="200" y="350" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="16">Geen afbeelding</text></svg>';

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=1200',
  componentName,
  onError,
  className = '',
  loading,
  decoding,
  ...rest
}: Props) {
  const [currentSrc, setCurrentSrc] = React.useState<string>('');
  const [hasErrored, setHasErrored] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 1; // Single retry only

  // Initialize source
  React.useEffect(() => {
    const initialSrc = getSafeImageUrl(src);
    if (initialSrc) {
      setCurrentSrc(initialSrc);
      setHasErrored(false);
      setIsLoaded(false);
      setRetryCount(0);
    } else {
      // Invalid URL from start
      setCurrentSrc(FALLBACK_DATA_URI);
      setHasErrored(true);
      setIsLoaded(true);
    }
  }, [src]);

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
      console.warn(`[ImageWithFallback] Max retries reached for ${failedSrc}, using data URI`);
      setCurrentSrc(FALLBACK_DATA_URI);
      setHasErrored(true);
      setIsLoaded(true);
      return;
    }
    
    // Try fallback image once
    if (retryCount === 0 && fallbackSrc && fallbackSrc !== failedSrc) {
      const safeFallback = getSafeImageUrl(fallbackSrc);
      if (safeFallback) {
        console.log(`[ImageWithFallback] Trying fallback: ${safeFallback}`);
        setCurrentSrc(safeFallback);
        setRetryCount(1);
        return;
      }
    }
    
    // Final fallback to data URI
    setCurrentSrc(FALLBACK_DATA_URI);
    setHasErrored(true);
    setIsLoaded(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasErrored(false);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      onError={handleError}
      onLoad={handleLoad}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      {...rest}
    />
  );
}

// Helper function to validate and normalize image URLs
function getSafeImageUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  
  // Must be valid HTTP/HTTPS URL or relative path
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  
  return undefined;
}