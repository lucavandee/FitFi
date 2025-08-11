import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394949a" font-family="Arial" font-size="28">Geen afbeelding</text></svg>';

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholders/outfit-fallback.jpg',
  ...rest
}: Props) {
  const initial = (src && src.trim()) ? src : (fallbackSrc || FALLBACK_DATA_URI);
  const [current, setCurrent] = React.useState(initial);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    const next = (src && src.trim()) ? src : (fallbackSrc || FALLBACK_DATA_URI);
    setCurrent(next);
    setErrored(false);
  }, [src, fallbackSrc]);

  const onError = () => {
    if (!errored) {
      setErrored(true);
      setCurrent(fallbackSrc || FALLBACK_DATA_URI);
    } else if (current !== FALLBACK_DATA_URI) {
      setCurrent(FALLBACK_DATA_URI); // voorkom eindeloze loops
    }
  };

  return (
    <img
      src={current}
      alt={alt}
      onError={onError}
      {...rest}
    />
  );
}