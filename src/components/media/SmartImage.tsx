import { ImgHTMLAttributes, CSSProperties } from "react";
import clsx from "clsx";

type Props = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height" | "className"
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** true → container-fill; string (bv "16/9") → CSS aspect-ratio */
  aspect?: boolean | string;
  className?: string;
  style?: CSSProperties;
};

function SmartImage({ src, alt, width, height, aspect, className, style, ...rest }: Props) {
  const withAspectString = typeof aspect === "string" && aspect.trim().length > 0;
  const imgClass = clsx(
    "object-cover bg-surface",
    (aspect && !withAspectString) && "w-full h-full",
    className
  );
  const sizeProps = !aspect ? { width, height } : {};
  const styleProps: CSSProperties = { ...(style || {}) };
  if (withAspectString) styleProps.aspectRatio = aspect as string;

  return (
    <img
      src={src}
      alt={alt}
      className={imgClass}
      loading={rest.loading ?? "lazy"}
      style={styleProps}
      {...sizeProps}
      {...rest}
    />
  );
}

export default SmartImage;