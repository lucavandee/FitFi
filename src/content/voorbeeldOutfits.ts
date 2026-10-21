/**
 * Voorbeeldoutfits met echte producten, gedeeld door het voorbeeldrapport
 * (/results/preview) en het prototype van de nieuwe homepage (/nieuw).
 */
export interface VoorbeeldStuk {
  naam: string;
  merk: string;
  prijs: number;
  beeld: string;
}

export interface VoorbeeldOutfit {
  titel: string;
  gelegenheid: string;
  uitleg: string;
  stukken: VoorbeeldStuk[];
}

/**
 * Twee outfits zoals FitFi ze samenstelde voor het profiel "vrouw,
 * minimalistisch" op 21 oktober 2026, met de prijzen van die dag. Gekozen
 * omdat de stijlcontrole ze goedkeurde (stijl-eindtoets van 21 oktober, 18:11)
 * en omdat exact vaststaat welke producten het waren; van twee andere
 * goedgekeurde outfits bestonden meerdere producten met dezelfde naam.
 *
 * De productfoto's zijn de feedfoto's van H&M, ongewijzigd (Daisycon art.
 * 2.6): ze staan op hun eigen lichtgrijze ondergrond (#F9F9F9) in een kader
 * in gebroken wit uit het palet (#FAFAF8, een tint verschil, niet te zien)
 * met dezelfde verhouding (2:3), zonder bijsnijden. De
 * imwidth-parameter vraagt een kleinere versie bij H&M zelf op.
 */
export const VOORBEELD_OUTFITS: VoorbeeldOutfit[] = [
  {
    titel: "Lange wollen jurk met laarsjes",
    gelegenheid: "Werk",
    uitleg: "Zwart van boven tot onder. Wol en leer zorgen voor de variatie, de hak maakt het af.",
    stukken: [
      { naam: "H & M - Lange wollen jurk - Zwart", merk: "H&M", prijs: 69.99, beeld: "https://image.hm.com/assets/hm/d7/d2/d7d20cd854bdbfe9868aafcc03b6d51a0f001b33.jpg" },
      { naam: "H & M - Leren laarsjes met hak - Zwart", merk: "H&M", prijs: 99, beeld: "https://image.hm.com/assets/hm/e6/81/e68127752fd8a540a0f916acdef8239d14994ccb.jpg" },
    ],
  },
  {
    titel: "Bouclé jurk met blazer",
    gelegenheid: "Werk",
    uitleg: "Jurk en blazer in hetzelfde lichtbeige vormen één vlak. De zwarte enkellaarsjes geven het contrast.",
    stukken: [
      { naam: "H & M - Doorknoopjurk van geweven bouclégaren - Lichtbeige", merk: "H&M", prijs: 49.99, beeld: "https://image.hm.com/assets/hm/39/7c/397cb3984fee9142654b344cfaec21bfa91999d8.jpg" },
      { naam: "H & M - Dressed blazer - Lichtbeige", merk: "H&M", prijs: 49.99, beeld: "https://image.hm.com/assets/hm/82/92/8292c2be4c20739cd4f6af83a6af03bc13de3910.jpg" },
      { naam: "H & M - Leren enkellaarsjes - Zwart", merk: "H&M", prijs: 129, beeld: "https://image.hm.com/assets/hm/82/3a/823a35f35686a37324e466270f52608dc610a312.jpg" },
    ],
  },
];

export const euro = (bedrag: number) =>
  bedrag.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });

/** Een kleinere versie bij H&M zelf; de foto blijft dezelfde. */
export const formaat = (url: string, breedte: number) => `${url}${url.includes("?") ? "&" : "?"}imwidth=${breedte}`;

