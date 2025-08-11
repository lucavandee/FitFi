import React, { useState, useMemo } from 'react';
import { getSafeImageUrl, getFallbackImageForCategory } from '@/utils/imageUtils';

type Props = { 
  src?: string; 
  alt: string; 
  category?: string; 
  className?: string;
  onClick?: React.ImgHTMLAttributes<HTMLImageElement>["onClick"];
  style?: React.CSSProperties;
  componentName?: string;
  onError?: (originalSrc: string) => void;
  fallback?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  fallbackKey?: string;
};

const ImageWithFallback: React.FC<Props> = ({ 
  src, 
  alt, 
  category, 
  className,
  onClick,
  style,
  componentName,
  onError,
  fallback,
  width,
  height,
  fallbackSrc,
  fallbackKey
}) => {
  const initial = useMemo(() => {
    // Priority order: fallback prop > fallbackSrc > getSafeImageUrl > category fallback
    if (fallback) return fallback;
    if (fallbackSrc) return fallbackSrc;
    return getSafeImageUrl(src, category);
  }, [src, category, fallback, fallbackSrc]);
  
  const [current, setCurrent] = useState(initial);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      if (onError && src) {
        onError(src);
      }
      setCurrent(getFallbackImageForCategory(category));
    }
  };

  // Add Unsplash optimization if URL is from Unsplash
  const optimizedSrc = current.includes('images.unsplash.com') && !current.includes('?')
    ? `${current}?auto=format&fit=crop&w=960&q=75`
    : current;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={handleError}
      srcSet={`${optimizedSrc} 1x, ${optimizedSrc} 2x`}
      sizes="(max-width: 640px) 100vw, 512px"
      onClick={onClick}
      style={style}
      className={className}
    />
  );
};

export default ImageWithFallback;