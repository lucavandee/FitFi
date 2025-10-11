import React from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: keyof JSX.IntrinsicElements; // h1/h2/...
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SectionHeader: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h1",
  className = "",
  size = "lg",
}) => {
  const HeadingTag: any = as;

  // Compacte / middel / large varianten (tokens-first)
  const titleSize =
    size === "sm"
      ? "text-[clamp(1.5rem,3vw,2.25rem)]"
      : size === "md"
      ? "text-[clamp(1.75rem,3.5vw,2.75rem)]"
      : "text-[clamp(2rem,4vw,3.5rem)]";

  const padY =
    size === "sm"
      ? "py-8 md:py-10"
      : size === "md"
      ? "py-9 md:py-12"
      : "py-10 md:py-14";

  return (
    <header
      className={[
        "ff-section-header rounded-[var(--radius-lg)] px-6",
        padY,
        align === "center" ? "text-center" : "text-left",
        "bg-[var(--color-surface)]",
      ].join(" ") + (className ? " " + className : "")}
      style={{
        // Subtiele warme achtergrond (geen hex; tokens-first)
        background:
          "radial-gradient(120% 120% at 10% 0%, color-mix(in oklab, var(--color-surface) 92%, var(--ff-color-primary-700) 8%), var(--color-surface))",
      }}
    >
      {eyebrow && (
        <div
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur px-3 py-1 text-xs font-medium tracking-widest uppercase text-gray-600"
          aria-label={eyebrow}
        >
          {eyebrow}
        </div>
      )}

      <HeadingTag
        className={[
          "mt-4 font-montserrat leading-tight text-[var(--color-text)]",
          titleSize,
        ].join(" ")}
      >
        {title}
      </HeadingTag>

      <div
        className={
          "mt-3 h-px w-24 " +
          (align === "center" ? "mx-auto" : "mx-0") +
          " bg-[var(--color-border)]"
        }
      />

      {subtitle && (
        <p
          className={
            "mt-5 max-w-2xl text-gray-600 " +
            (align === "center" ? "mx-auto" : "mx-0")
          }
        >
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default SectionHeader;