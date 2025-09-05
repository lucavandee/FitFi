import { ImgHTMLAttributes } from "react";
import clsx from "clsx";

type Props = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height" | "className"
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspect?: boolean;
  className?: string;
};

function SmartImage({ src, alt, width, height, aspect, className, ...rest }: Props) {
  const imgClass = clsx("object-cover bg-surface", aspect && "w-full h-full", className);
  const sizeProps = !aspect ? { width, height } : {};
  return <img src={src} alt={alt} className={imgClass} loading="lazy" {...sizeProps} {...rest} />;
}

export default SmartImage;