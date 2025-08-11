import React, { useMemo, useState } from "react";
import { isValidImageUrl, getFallbackImage } from "@/utils/imageUtils";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
  onClick?: React.ImgHTMLAttributes<HTMLImageElement>["onClick"];
  style?: React.CSSProperties;
  componentName?: string;
  onError?: (originalSrc: string) => void;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  width,
  height,
  fallbackSrc,
  loading = "lazy",
  decoding = "async",
  onClick,
  style,
  componentName,
  onError,
}) => {
  const computedFallback = useMemo(
    () => fallbackSrc || getFallbackImage(width ?? 600, height ?? 800),
    [fallbackSrc, width, height]
  );

  const [currentSrc, setCurrentSrc] = useState<string>(
    isValidImageUrl(src) ? (src as string) : computedFallback
  );

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    if (currentSrc !== computedFallback) {
      if (onError && src) {
        onError(src);
      }
      setCurrentSrc(computedFallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      onClick={onClick}
      style={style}
    />
  );
};

export default ImageWithFallback;