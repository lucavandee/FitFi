import React from 'react';

type Loading = 'lazy' | 'eager';
type Decoding = 'auto' | 'sync' | 'async';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'decoding'> & {
  src: string;
  alt: string;
  /** Optionele fallbackafbeelding als de hoofdbron faalt */
  fallbackSrc?: string;
  /** Responsive images (optioneel) */
  sizes?: string;
  srcSet?: string;
  /** Defaults: loading='lazy', decoding='async' */
  loading?: Loading;
  decoding?: Decoding;
};

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  sizes,
  srcSet,
  // ⚠️ Let op: we hernoemen props lokaal om dubbele bindingen te voorkomen
  loading: loadingProp,
  decoding: decodingProp,
  ...rest
}: Props) {
  const [imgSrc, setImgSrc] = React.useState(src);

  const onError = React.useCallback(() => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  }, [fallbackSrc, imgSrc]);

  const loading: Loading = loadingProp ?? 'lazy';
  const decoding: Decoding = decodingProp ?? 'async';

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      srcSet={srcSet}
      onError={onError}
      {...rest}
    />
  );
}