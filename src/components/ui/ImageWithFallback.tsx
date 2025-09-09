import React, { useState, useCallback } from "react";
import { cn } from "@/utils/cn";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  loading?: "lazy" | "eager";
}

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video", 
  portrait: "aspect-[3/4]",
  auto: ""
};

export default function ImageWithFallback({
  src,
  alt = "",
  fallbackSrc = "/images/fallbacks/default.jpg",
  fallbackText,
  aspectRatio = "auto",
  className,
  loading = "lazy",
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.(e);
  }, [hasError, currentSrc, fallbackSrc, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (!currentSrc && fallbackText) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-surface text-muted text-sm border border-border rounded-md",
          aspectRatios[aspectRatio],
          className
        )}
        role="img"
        aria-label={alt}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatios[aspectRatio], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface animate-pulse rounded-md" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
    </div>
  );
}