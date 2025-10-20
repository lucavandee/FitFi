import { useState, useEffect, useRef } from 'react';
import { getColorGradient, generateGradientCSS, getColorFromProductName } from '@/utils/colorGradients';
import { getCategoryIcon } from './CategoryIcons';

interface SmartFallbackImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  color?: string;
  productName?: string;
  className?: string;
  fallbackClassName?: string;
  aspectRatio?: '1/1' | '3/4' | '4/3' | '16/9';
}

export function SmartFallbackImage({
  src,
  alt,
  category = 'product',
  color,
  productName = '',
  className = '',
  fallbackClassName = '',
  aspectRatio = '3/4',
}: SmartFallbackImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const detectedColor = color || getColorFromProductName(productName || alt);
  const gradient = getColorGradient(detectedColor);
  const gradientCSS = generateGradientCSS(gradient);
  const CategoryIcon = getCategoryIcon(category);

  const shouldShowFallback = !src || hasError || !isInView;

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {shouldShowFallback && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 smart-fallback-gradient ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          } ${fallbackClassName}`}
          style={{
            background: gradientCSS,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/10" />

          <CategoryIcon
            className="w-20 h-20 sm:w-24 sm:h-24 text-white/40 drop-shadow-lg smart-fallback-icon"
            color="white"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {src && isInView && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100 smart-fallback-image-loaded' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {!isLoaded && src && isInView && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  );
}
