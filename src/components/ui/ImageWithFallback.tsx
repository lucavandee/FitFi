import React from 'react';
import { getFallbackImageForCategory } from '@/utils/imageUtils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  category?: string;
  componentName?: string;
  onError?: (originalSrc: string) => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  category,
  componentName,
  onError,
  style,
  className,
  ...rest 
}) => {
  const [currentSrc, setCurrentSrc] = React.useState(src || '');
  const [hasErrored, setHasErrored] = React.useState(false);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      
      // Call onError callback if provided
      if (onError && src) {
        onError(src);
      }
      
      // Set fallback image
      const fallbackUrl = getFallbackImageForCategory(category);
      setCurrentSrc(fallbackUrl);
      
      if (componentName) {
        console.warn(`[${componentName}] Image failed, using fallback: ${src} → ${fallbackUrl}`);
      }
    }
  };

  // Reset error state when src changes
  React.useEffect(() => {
    if (src !== currentSrc && !hasErrored) {
      setCurrentSrc(src || '');
      setHasErrored(false);
    }
  }, [src]);

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      style={{ objectFit: 'cover', ...style }}
      className={className}
    />
  );
};

export default ImageWithFallback;