import { ImgHTMLAttributes, useState } from "react";
import { cn } from "@/utils/cn";

  /** Alt-tekst (vereist voor a11y) */
  src: string;
  /** Breedte alleen meegeven als er géén aspect container is */
  /** Hoogte alleen meegeven als er géén aspect container is */
  /** Wanneer true, neemt het beeld de container (met aspect via wrapper) volledig in */
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
 * SmartImage – eenvoudige afbeelding met optionele aspect-container ondersteuning.
 * 
 * Als aspect true is, vullen we de container (w-full h-full) en geven we geen width/height props door.
 * 
 * Als aspect falsey is, geven we (optioneel) width en height door voor betere layout-shifts.

  if (!aspect) return img;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: aspect }}>
      <div className="absolute inset-0">{img}</div>
    </div>
  return (
    <img 
      src={src} 
      alt={alt} 
      className={imgClass} 
      loading="lazy" 
      {...sizeProps} 
      {...rest} 
    />
  );
}