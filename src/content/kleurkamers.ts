import type { Bron, Zin } from "@/content/landingCopy";
import { OUTFIT_LIMIET } from "@/config/outfitLimiet";
import { KLEURKAMER_BEELDEN, KLEURKAMER_FILMS, type Beeldbron } from "@/content/kleurkamerBestanden";

/**
 * De kleurkamer: de homepage van 22 oktober 2026.
 *
 * Zes kamers uit vier echte FitFi-paletten, van koel naar warm. In elke kamer
 * staat dezelfde persoon in dezelfde houding: een antraciet jas en broek, met
 * één stuk in de kleur van de kamer vlak onder het gezicht (zij een top, hij een
 * trui). Dat is waar kleuradvies over gaat: de kleur bij je gezicht.
 *
 * Beeld: de persoon en de kleding komen uit GPT Image 2.5 (Higgsfield, cast c05
 * en c08). De kamerkleur is daarna in lineair licht op het papier en het ene
 * kledingstuk gezet (tools/kleurkamer.py), dus schaduw, stof, huid en houding
 * zijn in elke kamer pixel voor pixel gelijk. De clips (Kling 4.0) beginnen en
 * eindigen op de still. Herkomst per bestand:
 * ~/claude-artifacts/fitfi-beeld/2026-10-22-herontwerp/kleurkamer/herkomst.json.
 *
 * Kleuren: de staal is de hex uit COLOR_PALETTES (dezelfde naam, dus dezelfde
 * sleutel als in de engine). Het veld is de gemeten mediaan van de rand van de
 * still (links en boven, zonder vloer), zodat foto en veld naadloos op elkaar
 * aansluiten. Het contrast van de tekst is op die gemeten waarde gerekend;
 * __tests__/kleurkamers.test.ts bewaakt het.
 */

export type KamerSleutel = "softblauw" | "donkerblauw" | "dieprood" | "warmterracotta" | "olijfgroen" | "chocolade";
export type Wie = "dames" | "heren";
export type Seizoen = "winter" | "zomer" | "lente" | "herfst";

export interface Kamer {
  sleutel: KamerSleutel;
  /** De naam van de staal in COLOR_PALETTES; ook de naam die de bezoeker leest. */
  naam: string;
  seizoen: Seizoen;
  kant: "koel" | "warm";
  /** Staal: de hex uit het palet. */
  hex: string;
  /** Gemeten veldkleur aan de rand van de still, per persoon. */
  veld: Record<Wie, string>;
  /** Tekst op het veld: papier op donkere kamers, inkt op lichte. */
  tekst: "papier" | "inkt";
  /** Hoe het kledingstuk in de alt-tekst heet. */
  kleurWoord: string;
}

export const PAPIER = "#FAFAF8";
export const INKT = "#1A1A1A";

export const KAMERS: readonly Kamer[] = [
  {
    sleutel: "softblauw",
    naam: "Soft blauw",
    seizoen: "zomer",
    kant: "koel",
    hex: "#85C1E2",
    veld: { dames: "#80BBDB", heren: "#7CB4D3" },
    tekst: "inkt",
    kleurWoord: "lichtblauwe",
  },
  {
    sleutel: "donkerblauw",
    naam: "Donkerblauw",
    seizoen: "winter",
    kant: "koel",
    hex: "#34495E",
    veld: { dames: "#32465B", heren: "#304457" },
    tekst: "papier",
    kleurWoord: "blauwe",
  },
  {
    sleutel: "dieprood",
    naam: "Diep rood",
    seizoen: "winter",
    kant: "koel",
    hex: "#943126",
    veld: { dames: "#8E2F25", heren: "#8A2D23" },
    tekst: "papier",
    kleurWoord: "diep rode",
  },
  {
    sleutel: "warmterracotta",
    naam: "Warm terracotta",
    seizoen: "lente",
    kant: "warm",
    hex: "#E08E79",
    veld: { dames: "#D78975", heren: "#D18470" },
    tekst: "inkt",
    kleurWoord: "terracotta",
  },
  {
    sleutel: "olijfgroen",
    naam: "Olijfgroen",
    seizoen: "herfst",
    kant: "warm",
    hex: "#6E7A45",
    veld: { dames: "#6A7643", heren: "#667240" },
    tekst: "papier",
    kleurWoord: "olijfgroene",
  },
  {
    sleutel: "chocolade",
    naam: "Chocolade",
    seizoen: "herfst",
    kant: "warm",
    hex: "#4E342E",
    veld: { dames: "#4B322C", heren: "#48302A" },
    tekst: "papier",
    kleurWoord: "chocoladebruine",
  },
];

/** De eerste kamer, ook het beeld dat index.html vooraf laadt. */
export const START_KAMER: KamerSleutel = "dieprood";
/** De kamer waar de eenmalige hint naartoe wisselt. */
export const HINT_KAMER: KamerSleutel = "olijfgroen";

/** De grijze kamer van het slot: zelfde studio, papier op #9A9A97 gezet; veld gemeten. */
export const GRIJZE_KAMER = { veld: { dames: "#949593", heren: "#8F908D" } } as const;

export function kamer(sleutel: KamerSleutel): Kamer {
  return KAMERS.find((k) => k.sleutel === sleutel) ?? KAMERS[2];
}

export function isKamer(x: unknown): x is KamerSleutel {
  return typeof x === "string" && KAMERS.some((k) => k.sleutel === x);
}

export function tekstKleur(k: Kamer): string {
  return k.tekst === "papier" ? PAPIER : INKT;
}

const LETTER: Record<Wie, string> = { dames: "h", heren: "m" };

/** De still van een kamer: liggend (16:9) of staand (4:5, mobiel). */
export function kamerBeeld(sleutel: KamerSleutel | "grijs", wie: Wie, staand: boolean): Beeldbron {
  const naam = `kk-${LETTER[wie]}-${sleutel}${staand ? "-45" : ""}`;
  const bron = KLEURKAMER_BEELDEN[naam];
  if (!bron) throw new Error(`Kleurkamerbeeld ontbreekt: ${naam}`);
  return bron;
}

/** De clip van een kamer (start en eind zijn de still), liggend of staand. */
export function kamerFilm(sleutel: KamerSleutel, wie: Wie, staand: boolean): string | undefined {
  return KLEURKAMER_FILMS[`kk-${LETTER[wie]}-${sleutel}${staand ? "-45" : ""}`];
}

export function srcSet(paden: Record<number, string>): string {
  return Object.entries(paden)
    .map(([b, p]) => `${p} ${b}w`)
    .join(", ");
}

/** De alt-tekst beschrijft wat je ziet, niet wie het is. */
export function altTekst(k: Kamer, wie: Wie): string {
  return wie === "dames"
    ? `Vrouw met donker haar in een lange antraciet jas en broek met een ${k.kleurWoord} top, in een studio die helemaal ${k.naam.toLowerCase()} is.`
    : `Man met kort haar in een antraciet overjas en broek met een ${k.kleurWoord} trui, in een studio die helemaal ${k.naam.toLowerCase()} is.`;
}

// ---------------------------------------------------------------------------
// Teksten, met waar elke bewering op rust (zelfde vorm als landingCopy.ts).

const zin = (tekst: string, ...bronnen: Bron[]): Zin => ({ tekst, bronnen });
const VEERTIEN: Bron = { data: "aantalStappen", waarde: 14, inTekst: "veertien" };

export const KLEURKAMER_COPY = {
  held: {
    kop: ["Welke kleur", "staat jou?"] as const,
    onderregel: zin(
      "Na veertien vragen weet je welke kleuren bij je passen. Je krijgt ook je stijl en outfits met links naar de winkel.",
      VEERTIEN,
      { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "<ColorPaletteSection" },
      { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "StyleProfileGenerator.generateStyleProfile(" },
      { bestand: "src/components/results/OutfitDetailModal.tsx", zoek: "const opened = await openProductLink({" },
    ),
    knop: "Begin gratis",
    knopIngelogd: "Bekijk je resultaten",
    voorbeeld: "Bekijk voorbeeld",
    aiLabel: "Beeld gemaakt met AI. De persoon is een model.",
    kleurGroep: "Kleur van de kamer",
    wieGroep: "Kleding voor",
    koel: "Koel",
    warm: "Warm",
    bewegingUit: "Beweging uit",
    bewegingAan: "Beweging aan",
  },
  winkel: {
    tekst: "Het model en de kleding hierboven zijn gemaakt met AI. Deze stukken kun je bestellen.",
    knop: "Bekijk bij partner",
  },
  rapport: {
    label: "Voorbeeld",
    kop: "Je rapport.",
    tekst: zin(
      "Je kleuren, je stijl en outfits met echte stukken. Bij elk stuk staat een link naar de winkel.",
      { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "<ColorPaletteSection" },
      { bestand: "src/components/results/OutfitDetailModal.tsx", zoek: "const opened = await openProductLink({" },
    ),
    kleurcode: "Je kleurcode",
    samen: "Samen",
  },
  slot: {
    vraagZonderKeuze: "Welke kleuren passen bij jou?",
    tekst: zin("Na veertien vragen weet je het.", VEERTIEN),
    plannen: zin(
      `Gratis: tot ${OUTFIT_LIMIET.gratis} outfits met links naar de winkel, en dat blijft zo. Premium: tot ${OUTFIT_LIMIET.premium} outfits en een kleuranalyse op basis van je foto.`,
      { bestand: "src/pages/PricingPage.tsx", zoek: "Free is geen proefperiode, het blijft altijd beschikbaar." },
      { bestand: "src/pages/PricingPage.tsx", zoek: "en kleuranalyse op basis van je foto." },
    ),
    aiLabel: "Beeld gemaakt met AI. De persoon is een model.",
  },
} as const;

/** "Diep rood, uit het winterpalet": de naam van een staal voor een schermlezer. */
export function staalNaam(k: Kamer): string {
  return `${k.naam}, uit het ${k.seizoen}palet`;
}

/** "Past diep rood bij jou?" */
export function slotVraag(k: Kamer | null): string {
  return k ? `Past ${k.naam.toLowerCase()} bij jou?` : KLEURKAMER_COPY.slot.vraagZonderKeuze;
}

