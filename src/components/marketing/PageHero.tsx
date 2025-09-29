import React from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: keyof JSX.IntrinsicElements; // h1/h2/...
  size?: "sm" | "md" | "lg";
  id?: string; // voor aria
  className?: string;
};

const PageHero: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h1",
  size = "lg",
  id,
  className = "",
}) => {
  const HeadingTag: any = as;

  // schaal & spacing als op de homepage
  const padY =
    size === "sm" ? "py-14 md:py-16" : size === "md" ? "py-16 md:py-20" : "py-20 md:py-24";
  const titleSize =
    size === "sm"
      ? "text-4xl md:text-5xl"
      : size === "md"
      ? "text-[2.75rem] md:text-[3.25rem]"
      : "text-4xl md:text-6xl";

  const alignCls = align === "center" ? "text-center" : "text-left";

  const headingId = id ? `${id}__heading` : undefined;
  const eyebrowId = id ? `${id}__eyebrow` : undefined;
  const subId = id ? `${id}__subtitle` : undefined;

  return (
    <section
      className={[padY, className].join(" ")}
      style={{
        background:
          "radial-gradient(120% 120% at 10% 0%, color-mix(in oklab, var(--color-surface) 92%, var(--ff-color-primary-700) 8%), var(--color-surface))",
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
        </header>
      </div>
    </section>
  );
};

export default PageHero;