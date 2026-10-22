import type { CSSProperties } from "react";

/**
 * Vormtaal van de kleurkamer (homepage, 22 oktober 2026): één letterfamilie
 * (Archivo, met breedte-as), radius 0, geen schaduw, haarlijnen in plaats van
 * kaarten. Een cursieve serif naast een ronde sans is het handschrift van
 * gegenereerde landingspagina's; daarom hier niet.
 */
export const ARCHIVO = {
  /** de displaykop: smal en vet */
  display: { fontStretch: "82%", fontWeight: 680, lineHeight: 0.92, letterSpacing: "-0.035em" } satisfies CSSProperties,
  /** sectiekoppen */
  kop: { fontStretch: "92%", fontWeight: 650, lineHeight: 1, letterSpacing: "-0.025em" } satisfies CSSProperties,
  /** labels in kapitalen */
  label: { fontStretch: "100%", fontWeight: 600, letterSpacing: "0.06em" } satisfies CSSProperties,
} as const;

/** Labels in kapitalen: 14 px, de ondergrens voor tekst (CLAUDE.md deel 2 en 12). */
export const LABEL = "text-[14px] uppercase leading-none";

const KNOP = "inline-flex min-h-[52px] items-center justify-center px-7 text-base font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px]";

/** De primaire knop, afhankelijk van de grond: op een donkere grond licht, op een lichte grond donker. */
export const KNOP_OP = {
  donker: `${KNOP} bg-[#FAFAF8] text-[#1A1A1A] hover:bg-white focus-visible:outline-[#FAFAF8]`,
  licht: `${KNOP} bg-[#1A1A1A] text-[#FAFAF8] hover:bg-black focus-visible:outline-[#1A1A1A]`,
} as const;

/** Secundaire actie: een tekstlink, onderstreept op 4 px afstand. */
export const TEKSTLINK =
  "inline-flex min-h-[44px] items-center text-base underline decoration-1 underline-offset-4 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/** Dezelfde linkerrand als kop, held, slot en voet (--rand in index.css): tekst hooguit 1280 px breed. */
export const RASTER = "w-full px-[var(--rand)]";

/** Secties op papier: 128 px boven en onder op desktop, 80 px op mobiel. */
export const SECTIE = "py-20 lg:py-32";

export const HAARLIJN = "border-[rgba(26,26,26,0.14)]";

/*
 * De breekpunten van de homepage, gelijk aan Tailwinds lg (1024 px). Onder lg is
 * het exacte complement, geen (max-width: 1023px): bij browserzoom kan de breedte
 * 1023,6 px zijn, en dan klopt geen van die twee (gemeten 22 oktober 2026: beide
 * heldvarianten in beeld en beide foto's opgehaald).
 */
export const LG = "(min-width: 1024px)";
export const ONDER_LG = "not all and (min-width: 1024px)";
