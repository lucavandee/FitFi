import React, { useState, useEffect, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.png',
  blurDataURL,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(blurDataURL || fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(imgRef, { threshold: 0.1, rootMargin: '50px' });

  useEffect(() => {
    if (!isInView) return;
    if (!isLoading && imageSrc === src) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, fallback, onLoad, onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-500
          ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          ${hasError ? 'opacity-50' : 'opacity-100'}
        `}
        loading="lazy"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse" />
      )}
    </div>
  );
};
