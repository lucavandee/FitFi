import React, { useEffect, useRef, useState } from "react";

type SmartImageProps = {
  /** High-res url (mag 404-en; we vangen het op) */
  src: string;
  /** Blur/LQIP (lage resolutie, ± 10–40px breed) of data URI */
  placeholder?: string;
  /** Branded fallback (jpg/png/svg) – tonen we als src faalt */
  fallback?: string;
  /** Aspect ratio houdt layout stabiel (geen CLS) */
  aspectRatio?: number; // bv. 4/3, 3/4, 16/9
  alt: string;
  className?: string;
  /** Responsive sources (optioneel) */
  sources?: Array<{ type: string; srcSet: string }>;
  /** Prioriteit: bovenin pagina => "high" */
  fetchPriority?: "high" | "low" | "auto";
};

const defaultFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 1200'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#102a43'/>
      <stop offset='100%' stop-color='#0b1a32'/>
    </linearGradient>
  </defs>
  <rect width='1600' height='1200' fill='url(#g)'/>
</svg>`);

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  placeholder,
  fallback = defaultFallback,
  aspectRatio = 4 / 3,
  alt,
  className = "",
  sources,
  fetchPriority = "auto",
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paddingTop = `${100 / aspectRatio}%`;

  const showSrc = inView && !failed;

  return (
    <div
      ref={ref}
      className={`ff-image ${className}`}
      style={{ position: "relative", width: "100%" }}
      aria-busy={!loaded}
    >
      {/* Aspect-ratio fixer: houdt hoogte stabiel */}
      <div style={{ paddingTop }} />

      {/* Skeleton/blur layer */}
      <div
        className={`ff-image__ph ${loaded ? "is-loaded" : ""}`}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "1.25rem",
          background:
            placeholder
              ? `url(${placeholder}) center/cover no-repeat`
              : "var(--ff-skeleton)",
          filter: placeholder ? "blur(14px)" : "none",
          transition: "opacity 280ms ease",
          opacity: loaded ? 0 : 1,
        }}
      />

      {/* Picture voor AVIF/WebP + srcset */}
      {showSrc ? (
        <picture>
          {sources?.map((s) => (
            <source key={s.type} type={s.type} srcSet={s.srcSet} />
          ))}
          <img
            src={src}
            alt={alt}
            decoding="async"
            loading="lazy"
            fetchPriority={fetchPriority}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "1.25rem",
              boxShadow: "var(--ff-card-shadow-strong)",
              transition: "transform 220ms ease, box-shadow 220ms ease",
            }}
            className="ff-image__img"
          />
        </picture>
      ) : null}

      {/* Branded fallback als het echte beeld faalt */}
      {failed && (
        <img
          src={fallback}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "1.25rem",
            boxShadow: "var(--ff-card-shadow-strong)",
          }}
        />
      )}
    </div>
  );
};

export default SmartImage;