import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  containerClassName?: string;
};

const FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394949a" font-family="Arial" font-size="28">Geen afbeelding</text></svg>';

export default function ImageWithFallback({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc = '/images/placeholders/outfit-fallback.jpg',
  ...rest
}: Props) {
  const initial = (src && src.trim()) ? src : (fallbackSrc || FALLBACK_DATA_URI);
  const [current, setCurrent] = React.useState(initial);
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    const next = (src && src.trim()) ? src : (fallbackSrc || FALLBACK_DATA_URI);
    setCurrent(next);
    setLoaded(false);
    setErrored(false);
  }, [src, fallbackSrc]);

  const onError = () => {
    if (!errored) {
      setErrored(true);
      setCurrent(fallbackSrc || FALLBACK_DATA_URI);
    } else if (current !== FALLBACK_DATA_URI) {
      // stop infinite loops als fallback zelf faalt
      setCurrent(FALLBACK_DATA_URI);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${containerClassName ?? ''}`}>
      {/* skeleton: blijft zichtbaar tot de echte image loaded is */}
      <div className={`absolute inset-0 animate-pulse bg-gray-100 transition-opacity ${loaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={onError}
        className={`block w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
        {...rest}
      />
    </div>
  );
}