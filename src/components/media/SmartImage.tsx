import { ImgHTMLAttributes } from "react";
import clsx from "clsx";

type Props = {
  /** Afbeeldingsbron (vereist) */
  src: string;
  /** Alt-tekst (vereist voor a11y) */
  alt: string;
  /** Breedte alleen meegeven als er géén aspect container is */
  width?: number;
  /** Hoogte alleen meegeven als er géén aspect container is */
  height?: number;
  /** Wanneer true, neemt het beeld de container (met aspect via wrapper) volledig in */
  aspect?: boolean;
  /** Extra CSS classes */
  className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "className">;

/**
 * SmartImage – eenvoudige afbeelding met optionele aspect-container ondersteuning.
 * 
 * Als aspect true is: vullen we de container (w-full h-full) en geven we géén width/height props door.
 * Als aspect falsey is: geven we (optioneel) width en height door voor betere layout-shifts.
 */
function SmartImage({ src, alt, width, height, aspect, className, ...rest }: Props) {
  const imgClass = clsx("object-cover bg-surface", aspect && "w-full h-full", className);
  const sizeProps = !aspect ? { width, height } : {};
  
  return <img src={src} alt={alt} className={imgClass} loading="lazy" {...sizeProps} {...rest} />;
}

export default SmartImage;