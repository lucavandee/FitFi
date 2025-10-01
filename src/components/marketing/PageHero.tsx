import React from "react";
import { NavLink } from "react-router-dom";
import Button from "@/components/ui/Button";

type CTA = {
  label: string;
  to?: string;
  variant?: "primary" | "secondary";
  onClick?: (e: React.MouseEvent) => void;
};

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Tekstuitlijning */
  align?: "left" | "center";
  /** Heading tag */
  as?: "h1" | "h2";
  /** Typo-schaal */
  size?: "xs" | "sm" | "md" | "lg";
  /** CTA-knoppen (max 2 aanbevolen) */
  ctas?: CTA[];
  /** Discrete notitie rechts van de CTA's (bijv. deelknop) */
  note?: React.ReactNode;
  /** Densiteit van verticale ruimte */
  density?: "default" | "comfortable" | "airy";
  /** Extra inhoud (chips/labels) onder de CTA's */
  children?: React.ReactNode;
  /** Wordt (indien meegegeven) aangeroepen bij de 1e CTA-click */
  onPrimaryClick?: (e: React.MouseEvent) => void;
};

export default function PageHero({
  id,
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h1",
  size = "md",
  ctas = [],
  note,
  density = "default",
  children,
  onPrimaryClick,
}: Props) {
  const Heading = as;

  const alignCls =
    align === "center"
      ? "text-center items-center"
      : "text-left items-start";

  const sizeCls =
    size === "xs"
      ? "text-3xl md:text-4xl"
      : size === "sm"
      ? "text-4xl md:text-5xl"
      : size === "lg"
      ? "text-6xl md:text-7xl"
      : "text-5xl md:text-6xl";

  // Verticale spacing presets (royale ademruimte bij 'airy')
  const spaceTop =
    density === "airy"
      ? "pt-20 md:pt-24 lg:pt-28"
      : density === "comfortable"
      ? "pt-14 md:pt-18 lg:pt-20"
      : "pt-10 md:pt-14 lg:pt-16";

  const spaceBottom =
    density === "airy"
      ? "pb-14 md:pb-16"
      : density === "comfortable"
      ? "pb-10 md:pb-12"
      : "pb-8 md:pb-10";

  return (
    <section
      id={id}
      className={[
        "bg-[var(--color-bg)] text-[var(--color-text)]",
        spaceTop,
        spaceBottom,
      ].join(" ")}
    >
      <div className="ff-container">
        <div className={["flex flex-col gap-5 md:gap-6", alignCls].join(" ")}>
          {eyebrow ? (
            <div className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm tracking-wide">
              {eyebrow}
            </div>
          ) : null}

          <Heading
            className={[
              "font-semibold leading-[1.08]",
              sizeCls,
              // beperk regelbreedte voor rust
              align === "center"
                ? "mx-auto max-w-[22ch]"
                : "max-w-[22ch]",
            ].join(" ")}
          >
            {title}
          </Heading>

          {subtitle ? (
            <p
              className={[
                "text-lg md:text-xl text-[var(--color-text)]/80",
                align === "center" ? "mx-auto max-w-[56ch]" : "max-w-[56ch]",
                "mt-1",
              ].join(" ")}
            >
              {subtitle}
            </p>
          ) : null}

          {/* CTA's + note */}
          {(ctas.length > 0 || note) && (
            <div
              className={[
                "mt-6 md:mt-8",
                "flex flex-wrap items-center gap-3",
                align === "center" ? "justify-center" : "",
              ].join(" ")}
            >
              {ctas.map((cta, i) => {
                const btn = (
                  <Button
                    key={cta.label}
                    as={cta.to ? NavLink : ("button" as any)}
                    to={cta.to as any}
                    onClick={(e: any) => {
                      if (i === 0 && onPrimaryClick) onPrimaryClick(e);
                      if (cta.onClick) cta.onClick(e);
                    }}
                    variant={cta.variant || (i === 0 ? "primary" : "secondary")}
                    size="lg"
                  >
                    {cta.label}
                  </Button>
                );
                return btn;
              })}
              {note ? <div className="ml-1">{note}</div> : null}
            </div>
          )}

          {/* Extra (chips/labels) */}
          {children ? (
            <div className={["mt-6 md:mt-7", align === "center" ? "mx-auto" : ""].join(" ")}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}