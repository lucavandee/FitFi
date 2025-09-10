import React, { useMemo, useState } from "react";
import { cn } from "@/utils/cn";

type RatioKey = "square" | "portrait" | "landscape" | "wide";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string;
  fallback?: string;
  ratio?: RatioKey | boolean;
  componentName?: string; // alleen logging; niet naar DOM
  containerClassName?: string;
  imgClassName?: string;
};

const RATIOS: Record<RatioKey, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

function ImageWithFallback({
  className,
  containerClassName,
  imgClassName,
  src,
  alt,
  fallback = "/placeholder.png",
  ratio = false,
  componentName, // eslint-disable-line @typescript-eslint/no-unused-vars
  onError,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const showSrc = failed ? fallback : (src || fallback);

  const wrapperRatioClass = useMemo(() => {
    if (!ratio) return null;
    if (ratio === true) return RATIOS.square;
    return RATIOS[String(ratio) as RatioKey] ?? null;
  }, [ratio]);

  const imgEl = (
    <img
      src={showSrc}
      alt={alt ?? ""}
      className={cn("h-full w-full object-cover", imgClassName || className)}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      loading="lazy"
      {...rest}
    />
  );

  if (!wrapperRatioClass) return imgEl;

  return (
    <div className={cn("relative overflow-hidden rounded-md bg-gray-100", wrapperRatioClass, containerClassName)}>
      {imgEl}
    </div>
  );
}

export default ImageWithFallback;