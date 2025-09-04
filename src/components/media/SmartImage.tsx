import { ImgHTMLAttributes, useState } from "react";
import { cn } from "@/utils/cn";

type SmartImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  aspect?: string;
  className?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  sizes?: string;
  srcSet?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
};

export default function SmartImage(props: SmartImageProps) {
  const {
    src, alt = "",
    width, height, aspect,
    className = "",
    loading = "lazy", decoding = "async",
    sizes, srcSet,
    onClick, onLoad, onError,
  } = props;

  const [ok, setOk] = useState(true);

  const img = (
    <img
      src={ok ? src : "/fallback.jpg"}
      alt={alt}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      srcSet={srcSet}
      onClick={onClick}
      onLoad={onLoad}
      onError={() => { setOk(false); onError?.(); }}
      className={cn("object-cover bg-surface", aspect && "w-full h-full", className)}
      /* width/height alleen meegeven als er géén aspect container is */
      {...(!aspect ? { width, height } : {})}
    />
  );

  if (!aspect) return img;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: aspect }}>
      <div className="absolute inset-0">{img}</div>
    </div>
  );
}