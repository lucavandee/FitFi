import { ImgHTMLAttributes, useState } from "react";

type SmartImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  aspect?: string; // bv. "16/9" of "1/1" – als meegegeven, gebruiken we een aspect container
  className?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  sizes?: string;
  srcSet?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
};

export default function SmartImage({
  src,
  alt = "",
  width,
  height,
  aspect,
  className = "",
  loading = "lazy",
  decoding = "async",
  sizes,
  srcSet,
  onClick,
  onLoad,
  onError,
}: SmartImageProps) {
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
      onError={(e) => {
        setOk(false);
        onError?.();
      }}
      className={[
        "object-cover bg-surface",
        aspect ? "w-full h-full" : "",
        className,
      ].join(" ")}
      /* width/height alleen meegeven als er géén aspect container is */
      {...(!aspect ? { width, height } : {})}
    />
  );

  if (!aspect) return img;

  // aspect container
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: aspect }}>
      <div className="absolute inset-0">{img}</div>
    </div>
  );
}