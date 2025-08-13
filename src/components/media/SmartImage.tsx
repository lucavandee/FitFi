import React, { useMemo, useState, useRef, useEffect } from 'react';
import { buildSrcSet, fallbackDataUrl, normalizeUrl, toCdn, ImageKind } from '@/utils/image';

type SmartImageProps = {
  src?: string | null;
  alt: string;
  id?: string | number | null;
  kind?: ImageKind;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  eager?: boolean;
  priority?: boolean;
  aspect?: `${number}/${number}` | number; // e.g. "4/5" of 1.25
  onLoad?: () => void;
  onError?: () => void;
};

export default function SmartImage({
  src, alt, id, kind = 'generic', width, height, sizes,
  className, eager = false, priority = false, aspect, onLoad, onError
}: SmartImageProps) {
  const stableId = String(id ?? alt ?? 'x');
  const normalized = normalizeUrl(src);
  const seeded = useMemo(() => fallbackDataUrl(stableId, kind, width ?? 480, height ?? 640), [stableId, kind, width, height]);
  const initial = kind === 'nova' ? '/images/nova.svg' : (normalized ?? seeded);

  const [current, setCurrent] = useState<string>(initial);
  const [loaded, setLoaded] = useState(false);
  const errorCount = useRef(0);

  const srcSet = useMemo(() => buildSrcSet(normalized), [normalized]);
  const cdnPrimary = useMemo(() => toCdn(normalized, width), [normalized, width]);

  useEffect(() => { setCurrent(initial); setLoaded(false); }, [initial]);

  const handleError = () => {
    errorCount.current += 1;
    if (errorCount.current <= 1) setCurrent(kind === 'nova' ? '/images/nova.svg' : seeded);
    onError?.();
  };

  const handleLoad = () => { setLoaded(true); onLoad?.(); };

  const img = (
    <img
      src={cdnPrimary ?? current}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : 'auto'}
      className={`img-fade ${loaded ? 'img-loaded' : ''} ${className ?? ''}`}
      onLoad={handleLoad}
      onError={handleError}
    />
  );

  // Aspect guard to avoid layout shift
  if (aspect) {
    const style = typeof aspect === 'number'
      ? { aspectRatio: String(aspect) }
      : { aspectRatio: aspect };
    return <div className={`img-skeleton ${loaded ? '' : ''}`} style={style}>{img}</div>;
  }
  return <div className="img-skeleton">{img}</div>;
}