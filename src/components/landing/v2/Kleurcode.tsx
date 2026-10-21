import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface KleurcodeKleur {
  hex: string;
  naam: string;
}

interface KleurcodeProps {
  kleuren: KleurcodeKleur[];
  /** Hoogte van de strook in px. */
  hoogte?: number;
  /** Bouwt de strook op bij het laden, balk voor balk. */
  opbouwen?: boolean;
  /** Vertraging voor de eerste balk, in seconden. */
  vertraging?: number;
  /**
   * Een dunne rand, zodat een witte of zwarte balk niet in de ondergrond
   * verdwijnt: "licht" op een lichte ondergrond, "donker" op een donkere.
   */
  rand?: "licht" | "donker";
  className?: string;
}

/**
 * De FitFi-kleurcode: een strook van vijf tot zeven balken uit iemands eigen
 * palet. Elk rapport heeft zijn eigen code, want hij komt uit de antwoorden.
 * Het merkteken dat geen beeldmodel kan namaken (plan van 21 oktober 2026).
 *
 * De eerste twee kleuren zijn de basis en krijgen meer breedte; de rest is
 * accent. Opbouwen gebeurt per balk in 400 ms, nooit verend (CLAUDE.md deel 8),
 * en valt weg bij prefers-reduced-motion.
 */
export function Kleurcode({ kleuren, hoogte = 40, opbouwen = false, vertraging = 0, rand = "licht", className = "" }: KleurcodeProps) {
  const rustig = useReducedMotion();
  const beweeg = opbouwen && !rustig;
  const label = `Kleurcode: ${kleuren.map((k) => k.naam.toLowerCase()).join(", ")}`;

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex w-full overflow-hidden rounded-xl border ${rand === "licht" ? "border-[#E5E5E5]" : "border-[#4A4A4A]"} ${className}`}
      style={{ height: hoogte }}
    >
      {kleuren.map((kleur, i) => (
        <motion.div
          key={kleur.hex + i}
          className="h-full origin-left"
          style={{ backgroundColor: kleur.hex, flexGrow: i < 2 ? 3 : 2, flexBasis: 0 }}
          initial={beweeg ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: vertraging + i * 0.08 }}
        />
      ))}
    </div>
  );
}
