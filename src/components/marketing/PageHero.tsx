import React from "react";
import { Link } from "react-router-dom";

type Cta = {
  label: string;
  to: string;                       // intern (/results) of extern (https://, mailto:)
  variant?: "primary" | "secondary";
  target?: "_blank" | "_self";
  rel?: string;
  "data-event"?: string;            // optioneel analytics hook
};

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  note?: string;                    // kleine vertrouwensregel onder CTA (optioneel)
  align?: "left" | "center";
  as?: keyof JSX.IntrinsicElements; // h1/h2/...
  size?: "sm" | "md" | "lg";
  className?: string;
  ctas?: Cta[];
};

const isExternal = (to: string) =>
  to.startsWith("http") || to.startsWith("mailto:") || to.startsWith("#");

const PageHero: React.FC<Props> = ({
  id,
  eyebrow,
  title,
  subtitle,
  note,
  align = "left",
  as = "h2",
  size = "md",
  className = "",
  ctas = [],
}) => {
  const HeadingTag = as as any;

  const padY =
    size === "sm" ? "py-14 md:py-16" : size === "md" ? "py-16 md:py-20" : "py-20 md:py-24";
  const titleSize =
    size === "sm"
      ? "text-4xl md:text-5xl"
      : size === "md"
      ? "text-[2.75rem] md:text-[3.25rem]"
      : "text-4xl md:text-6xl";

  const alignCls = align === "center" ? "text-center" : "text-left";

  // Micro-animatie (respecteert prefers-reduced-motion in CSS)
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const headingId = id ? `${id}__heading` : undefined;
  const eyebrowId = id ? `${id}__eyebrow` : undefined;
  const subId = id ? `${id}__subtitle` : undefined;
  const noteId = id ? `${id}__note` : undefined;

  return (
    <section
      className={[padY, className].join(" ")}
      style={{
        // Warme, premium tokens-gradient (geen hex)
        background:
          "radial-gradient(120% 120% at 10% 0%, color-mix(in oklab, #C2654A 10%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in oklab, white 98%, white) 0%, color-mix(in oklab, white 100%, white) 100%)",
        opacity: ready ? 1 : 0,
        transition: "opacity 360ms ease",
      }}
    >
      {/* BELANGRIJK: identieke container als elders → perfecte uitlijning met header/homepage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header
          className={[alignCls, "rounded-2xl ff-animate-fade-in"].join(" ")}
          aria-labelledby={headingId}
          aria-describedby={subtitle ? subId : undefined}
        >
          {eyebrow && (
            <div
              id={eyebrowId}
              className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-[#8A8A8A] text-[0.8rem] tracking-widest uppercase"
              aria-label="Eyebrow"
            >
              {eyebrow}
            </div>
          )}

          <HeadingTag
            id={headingId}
            className={[
              "font-heading font-semibold leading-[1.06] text-[#1A1A1A]",
              titleSize,
              "mt-3"
            ].join(" ")}
          >
            {title}
          </HeadingTag>

          <div
            aria-hidden
            className={[
              "mt-4 h-px w-24 bg-[#E5E5E5]",
              align === "center" ? "mx-auto" : "mx-0",
            ].join(" ")}
          />

          {subtitle && (
            <p id={subId} className="mt-5 max-w-3xl text-[#1A1A1A]/80">
              {subtitle}
            </p>
          )}

          {ctas.length > 0 && (
            <div
              className={[
                "mt-6 flex flex-col sm:flex-row gap-3",
                align === "center" ? "justify-center" : "justify-start",
              ].join(" ")}
            >
              {ctas.map((cta, i) => {
                const cls =
                  cta.variant === "secondary"
                    ? "bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl"
                    : "bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl";
                return isExternal(cta.to) ? (
                  <a
                    key={i}
                    href={cta.to}
                    target={cta.target || (cta.to.startsWith("http") ? "_blank" : "_self")}
                    rel={cta.rel || (cta.to.startsWith("http") ? "noopener noreferrer" : undefined)}
                    className={cls}
                    aria-label={cta.label}
                    data-event={cta["data-event"]}
                  >
                    {cta.label}
                  </a>
                ) : (
                  <Link
                    key={i}
                    to={cta.to}
                    className={cls}
                    aria-label={cta.label}
                    data-event={cta["data-event"]}
                  >
                    {cta.label}
                  </Link>
                );
              })}
            </div>
          )}

          {note && (
            <p
              id={noteId}
              className={[
                "mt-3 text-sm text-gray-600",
                align === "center" ? "mx-auto" : "mx-0",
              ].join(" ")}
            >
              {note}
            </p>
          )}
        </header>
      </div>
    </section>
  );
};

export default PageHero;