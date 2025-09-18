import React from "react";
import SmartImage from "@/components/media/SmartImage";

export type PressLogo = {
  /** Alleen invullen als er echt een asset bestaat in SmartImage */
  id?: string;
  label: string;
  href?: string;
};

type Props = {
  items?: PressLogo[];
  className?: string;
  /** Zet op true als de logo-assets daadwerkelijk aanwezig zijn */
  useLogos?: boolean;
};

/**
 * Standaard: chip-fallback (geen SmartImage) zodat er nooit grote placeholders verschijnen.
 * Zodra assets klaarstaan, zet je useLogos={true} of geef je items mét id mee.
 */
const DEFAULT_ITEMS: PressLogo[] = [
  { label: "AD" },
  { label: "LINDA." },
  { label: "RTL" },
  { label: "Sprout" },
  { label: "Bright" },
];

const PressLogoBelt: React.FC<Props> = ({ items = DEFAULT_ITEMS, className, useLogos = false }) => {
  return (
    <div className={`pressbelt ${className ?? ""}`}>
      <span className="pressbelt-lead text-[var(--color-muted)]">Gezien in</span>
      <ul className="pressbelt-list" aria-label="Media">
        {items.map((it) => {
          const hasAsset = useLogos && Boolean(it.id);
          const content = hasAsset ? (
            // Let op: deze rendert alleen als er bewezen assets zijn.
            <SmartImage
              id={it.id as string}
              kind="generic"
              alt={it.label}
              className="presslogo-img"
            />
          ) : (
            <span className="presslogo-chip">{it.label}</span>
          );

          return (
            <li key={it.label} className="presslogo-wrap" aria-label={it.label}>
              {it.href ? (
                <a href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.label}>
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PressLogoBelt;