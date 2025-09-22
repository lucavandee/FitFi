import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';
import { fallbackDataUrl, normalizeUrl, toCdn, buildSrcSet, ImageKind } from '@/utils/image';

type SmartImageProps = {
  src?: string | null;
  alt: string;
  id?: string | number | null;
  kind?: ImageKind;
  width?: number;
  height?: number;
  sizes?: string;
  /**
   * CSS aspect ratio voor de CONTAINER (bijv. "4/5" of 1.25).
   * Als gezet, vullen we het frame met absolute positioned img.
   */
  aspect?: `${number}/${number}` | number;
  /** extra classes voor container (hier hoort je rounded/overflow-hidden) */
  containerClassName?: string;
  /** extra classes voor het <img> element (optioneel) */
  imgClassName?: string;
  eager?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string; // backward compatibility
  onClick?: () => void;
};

export default function SmartImage({
  src, alt, id, kind = 'generic', width, height, sizes, aspect,
  containerClassName, imgClassName, eager = false, priority = false, onLoad, onError,
  className, onClick
}: SmartImageProps) {
  const stableId = String(id ?? alt ?? 'x');
  const normalized = normalizeUrl(src);
  const seeded = useMemo(() => fallbackDataUrl(stableId, kind, width ?? 480, height ?? 640), [stableId, kind, width, height]);
  const initial = kind === 'nova' ? '/images/nova.svg' : (normalized ?? seeded);

  const [current, setCurrent] = useState<string>(initial);
  const [loaded, setLoaded] = useState(false);
  const errorCount = useRef(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => { setCurrent(initial); setLoaded(false); }, [initial]);

  const srcSet = useMemo(() => buildSrcSet(normalized), [normalized]);
  const cdnPrimary = useMemo(() => toCdn(normalized, width), [normalized, width]);

  const handleError = () => {
    errorCount.current += 1;
    if (errorCount.current <= 1) setCurrent(kind === 'nova' ? '/images/nova.svg' : seeded);
    onError?.();
  };
  const handleLoad = () => { setLoaded(true); onLoad?.(); };

  const imgEl = (
    <img
      src={cdnPrimary ?? current}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      className={[
        // VOL frame vullen (lost "halve afbeelding" op)
        aspect ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-auto object-cover',
        'block img-fade', loaded ? 'img-loaded' : '',
        imgClassName ?? '',
        className ?? '' // backward compatibility
      ].join(' ')}
      // width/height attributen alleen meegeven wanneer géén aspect container gebruikt wordt
      {...(!aspect ? { width, height } : {})}
    />
  );

  // Container met skeleton & optional aspect
  const style = aspect ? (typeof aspect === 'number'
    ? { aspectRatio: String(aspect) }
    : { aspectRatio: aspect }) : undefined;

  return (
    <div
      ref={ref}
      className={['relative overflow-hidden img-skeleton', containerClassName ?? '', inView ? 'in' : ''].join(' ')}
      style={style}
    >
      {imgEl}
    </div>
  );
}