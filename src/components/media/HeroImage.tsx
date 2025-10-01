import React from "react";

type Props = {
  className?: string;
  alt?: string;
  src?: string;                // primaire bron (bijv. vanuit CMS)
  fallbacks?: string[];        // alternatieven als primaire 404 geeft
  width?: number;
  height?: number;
  eager?: boolean;
};

export default function HeroImage({
  className,
  alt = "Voorbeeld van het FitFi Style Report op mobiel",
  src = "/uploads/hero-highres.png",
  fallbacks = ["/hero/hero-highres.webp", "/hero/hero-highres.png", "/hero/style-report.webp", "/hero/style-report.png"],
  width = 900,
  height = 1200,
  eager = true,
}: Props) {
  const [i, setI] = React.useState(-1);
  const current = i < 0 ? src : fallbacks[i];

  function onError() {
    setI((prev) => (prev < fallbacks.length - 1 ? prev + 1 : prev));
  }

  return (
    <img
      src={current}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      onError={onError}
      className={className}
    />
  );
}