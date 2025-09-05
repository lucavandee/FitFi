import React from "react";
import cn from "@/utils/cn";

type Props = {
  src?: string;
  alt?: string;
  ratio?: boolean | "1:1" | "3:4" | "4:3" | "16:9";
  className?: string;
  onErrorSrc?: string;
};

function ratioToClass(r: Props["ratio"]) {
  if (r === true || r === "1:1") return "aspect-square";
  if (r === "3:4") return "aspect-[3/4]";
  if (r === "4:3") return "aspect-[4/3]";
  if (r === "16:9") return "aspect-video";
  return "";
}

export default function SmartImage({
  src,
  alt = "",
  ratio,
  className,
  onErrorSrc,
}: Props) {
  const [broken, setBroken] = React.useState(false);
  const finalSrc = !broken && src ? src : onErrorSrc || src;

  return (
    <div className={cn("overflow-hidden rounded-xl bg-gray-100", ratioToClass(ratio), className)}>
      {finalSrc ? (
        <img
          src={finalSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-gray-500">
          No image
        </div>
      )}
    </div>
  );
}