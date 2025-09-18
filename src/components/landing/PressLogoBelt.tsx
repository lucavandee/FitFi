import React from "react";
import SmartImage from "@/components/media/SmartImage";

export type PressLogo = {
  id?: string;          // SmartImage id (optioneel; als ontbreekt -> text fallback)
  label: string;        // label / alt
  href?: string;        // optioneel: link naar artikel/medium
};

type Props = {
  items?: PressLogo[];
  className?: string;
};

const DEFAULT_ITEMS: PressLogo[] = [
  { id: "press-ad",    label: "AD" },
  { id: "press-linda", label: "LINDA." },
  { id: "press-rtl",   label: "RTL" },
  { id: "press-sprout",label: "Sprout" },
  { id: "press-bright",label: "Bright" },
];

const PressLogoBelt: React.FC<Props> = ({ items = DEFAULT_ITEMS, className }) => {
  return (
    <div className={`pressbelt ${className ?? ""}`}>
      <span className="pressbelt-lead text-[var(--color-muted)]">Gezien in</span>
      <ul className="pressbelt-list" aria-label="Media">
        {items.map((it) => {
          const content = it.id ? (
            <SmartImage
              id={it.id}
              kind="logo"
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