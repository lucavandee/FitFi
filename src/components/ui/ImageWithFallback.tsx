import React, { useState } from "react";
import { cn } from "@/utils/cn";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
  ratio?: "square" | "portrait" | "landscape" | "wide" | boolean;
};

const ratios = {
  square: "aspect-[1/1]",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]"
};

function ImageWithFallback({ className, src, alt, fallback, ratio = false, ...rest }: Props) {
  const [error, setError] = useState(false);
  const showSrc = !error && src ? String(src) : fallback || "/fallback.jpg";
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-[#111527]", ratio ? ratios[String(ratio) as keyof typeof ratios] : null)}>
      <img
        src={showSrc}
        alt={alt ?? ""}
        className={cn("h-full w-full object-cover", className)}
        onError={() => setError(true)}
        loading="lazy"
        {...rest}
      />
    </div>
  );
}

export default ImageWithFallback;