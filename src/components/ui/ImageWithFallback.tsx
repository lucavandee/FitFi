import React, { useMemo, useState } from "react";
import { isValidImageUrl, getFallbackImage } from "@/utils/imageUtils";
import { curatedImage } from "../../assets/curatedImages";

type ImageWithFallbackProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  fallbackKey?: string; // For curated fallback selection
  onClick?: React.ImgHTMLAttributes<HTMLImageElement>["onClick"];
  style?: React.CSSProperties;
  componentName?: string;
  onError?: (originalSrc: string) => void;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Outfit afbeelding",
  className,
  width,
  height,
  fallbackSrc,
  fallbackKey,
  onClick,
  style,
  componentName,
  onError,
}) => {
  const computedFallback = useMemo(
    () => {
      if (fallbackSrc) return fallbackSrc;
      
      // Use curated image if fallbackKey is provided
      if (fallbackKey) {
        try {
          // Parse fallbackKey format: "archetype-season" or use defaults
          const [archetype = 'casual_chic', season = 'herfst'] = fallbackKey.split('-');
          return curatedImage(archetype, season);
        } catch (error) {
          console.warn('Failed to get curated image, using generic fallback:', error);
        }
      }
      
      return getFallbackImage(width ?? 600, height ?? 800);
    },
    [fallbackSrc, fallbackKey, width, height]
  );

  const [currentSrc, setCurrentSrc] = useState<string>(
    isValidImageUrl(src) ? (src as string) : computedFallback
  );

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    if (currentSrc !== curatedImage('casual_chic', 'lente')) {
      if (onError && src) {
        onError(src);
      }
      setCurrentSrc(curatedImage('casual_chic', 'lente'));
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
      onClick={onClick}
      style={style}
    />
  );
};

export default ImageWithFallback;