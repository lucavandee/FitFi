import React from "react";

type Props = {
  className?: string;
  alt?: string;
  // Volgorde van proberen; we zetten de meest waarschijnlijke eerst.
  sources?: string[];
  width?: number;
  height?: number;
  eager?: boolean;
};

export default function HeroImage({
  className,
  alt = "Voorbeeld van het FitFi Style Report",
  sources = [
    "/hero/style-report.webp",
  ],
  width = 900,
  height = 1200,
  eager = true,
}: Props) {
  const [idx, setIdx] = React.useState(0);
  const src = sources[idx] ?? sources[sources.length - 1];

  function onError() {
    setIdx((i) => (i < sources.length - 1 ? i + 1 : i));
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      onError={onError}
      className={className}
    />
  );
}