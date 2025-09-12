import React, { useState } from "react";
import { cn } from "@/utils/cn";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
  ratio?: "square" | "portrait" | "landscape" | "wide" | boolean;
};

const ratios: Record<string, string> = {
  square: "aspect-[1/1]",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

export default function ImageWithFallback({
  className,
  src,
  alt,
  fallback,
  ratio = false,
  ...rest
}: Props) {
  const [error, setError] = useState(false);
  const showSrc = !error && src ? String(src) : (fallback || "/images/placeholder.jpg");
  const ratioClass =
    ratio === false ? "" : typeof ratio === "string" ? ratios[ratio] || "" : "aspect-[1/1]";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-50",
        ratioClass,
        className
      )}
    >
      <img
        src={showSrc}
        alt={alt ?? ""}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
        loading="lazy"
        decoding="async"
        {...rest}
      />
    </div>
  );
}