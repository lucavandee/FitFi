import React from "react";
import { Link } from "react-router-dom";

type Cta = {
  label: string;
  to: string;                 // internal route (/results) of extern (https://, mailto:)
  variant?: "primary" | "secondary";
  target?: "_blank" | "_self";
  rel?: string;
  "data-event"?: string;      // analytics hook optioneel
};

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: keyof JSX.IntrinsicElements;       // h1/h2/...
  size?: "sm" | "md" | "lg";
  className?: string;
  ctas?: Cta[];                           // CTA-knoppen in de hero
};

const isExternal = (to: string) =>
  to.startsWith("http") || to.startsWith("mailto:") || to.startsWith("#");

const PageHero: React.FC<Props> = ({
  id,
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h1",
  size = "lg",
  className = "",
  ctas = [],
}) => {
  const HeadingTag: any = as;

  // Schaal & spacing exact als homepage-gevoel
  const padY =
    size === "sm" ? "py-14 md:py-16" : size === "md" ? "py-16 md:py-20" : "py-20 md:py-24";
  const titleSize =
    size === "sm"
      ? "text-4xl md:text-5xl"
      : size === "md"
      ? "text-[2.75rem] md:text-[3.25rem]"
      : "text-4xl md:text-6xl";

  const alignCls = align === "center" ? "text-center" : "text-left";

  // Mount-fade voor micro-animatie (respecteert reduced motion door alleen op opacity te animeren)
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const headingId = id ? `${id}__heading` : undefined;
  const eyebrowId = id ? `${id}__eyebrow` : undefined;
  const subId = id ? `${id}__subtitle` : undefined;

  return (
    <section
      className={[padY, className].join(" ")}
      style={{
        // Warme hero-gradient in tokens (geen hex)
        background:
          "radial-gradient(120% 120% at 10% 0%, color-mix(in oklab, var(--color-surface) 92%, var(--ff-color-primary-700) 8%), var(--color-surface))",
        opacity: ready ? 1 : 0,
        transition: "opacity 360ms ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header
          className={[alignCls, "rounded-[var(--radius-lg)]"].join(" ")}
          aria-labelledby={headingId}
          aria-describedby={subtitle ? subId : undefined}
        >
          {eyebrow && (
            <div
              id={eyebrowId}
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-[var(--color-text-muted)]"
            >
              {eyebrow}
            </div>
          )}

          <HeadingTag
            id={headingId}
            className={[
              "mt-5 font-montserrat font-bold leading-tight text-[var(--color-text)]",
              titleSize,
            ].join(" ")}
          >
            {title}
          </HeadingTag>

          <div
            className={[
              "mt-4 h-px w-24 bg-[var(--color-border)]",
              align === "center" ? "mx-auto" : "mx-0",
            ].join(" ")}
          />

          {subtitle && (
            <p id={subId} className="mt-5 max-w-3xl text-[var(--color-text)]/80">
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
                    ? "px-6 py-3 rounded-2xl border text-[var(--color-text)] border-[var(--color-border)] text-center hover:border-[var(--ff-color-primary-600)] transition-colors"
                    : "ff-cta px-6 py-3 rounded-2xl text-center";
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
                    target={cta.target}
                    rel={cta.rel}
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
        </header>
      </div>
    </section>
  );
};

export default PageHero;