import React from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: keyof JSX.IntrinsicElements; // h1/h2/...
  className?: string;
};

const SectionHeader: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h1",
  className = ""
}) => {
  const HeadingTag: any = as;

  return (
    <header
      className={[
        "ff-section-header rounded-[var(--radius-lg)] px-6 py-10 md:py-14",
        align === "center" ? "text-center" : "text-left",
        "bg-[var(--color-surface)]"
      ].join(" ") + (className ? " " + className : "")}
      style={{
        // Subtiele warme achtergrond (tokens-first; geen hex)
        background:
          "radial-gradient(120% 120% at 10% 0%, color-mix(in oklab, var(--color-surface) 92%, var(--ff-color-primary-700) 8%), var(--color-surface))"
      }}
    >
      {eyebrow && (
        <div
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur px-3 py-1 text-xs font-medium tracking-widest uppercase text-[var(--color-text-muted)]"
          aria-label={eyebrow}
        >
          {eyebrow}
        </div>
      )}

      <HeadingTag className="mt-4 font-montserrat text-[clamp(2rem,4vw,3.5rem)] leading-tight text-[var(--color-text)]">
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
            "mt-5 max-w-2xl text-[var(--color-text-muted)] " +
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