import { COLOR_PALETTES } from "@/data/colorPalettes";
import type { KleurcodeKleur } from "./Kleurcode";

/** De kleurcode van het voorbeeldprofiel (minimalistisch, winterpalet). */
export const VOORBEELD_KLEURCODE: KleurcodeKleur[] = COLOR_PALETTES.winter.doColors.map((k) => ({ hex: k.hex, naam: k.name }));

export const PAGINA = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
export const KNOP_PRIMAIR =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#A85740] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#9A503B]";
