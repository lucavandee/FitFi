/**
 * De kleurpiek (plan "Onder de hero", 4.2): over W2 licht om de beurt een lap op
 * (zacht licht op de rechthoek om de contour hieronder, zie lapMasker in
 * KleurPiek.tsx), en de naam van die kleur verschijnt op het hout eronder.
 *
 * Alleen de vorm en de plek staan hier. De vulling komt uit
 * getColorPalette(PALETSLEUTEL).doColors, zodat de landingscode geen hexwaarde
 * van een kleur kent en de piek altijd toont wat het rapport toont.
 * __tests__/kleurpiek.test.ts legt de volgorde vast.
 *
 * Gemeten op W2-NB2-23, versie v2 (claude-artifacts/fitfi-beeld/pagina/fase3/
 * web/w2-v2/kleurpiek.json; v1 in web/w2/, script maak-kleurpiek.py):
 * - pad: buitencontour na GrabCut per lap, Douglas-Peucker tot hoogstens 64
 *   punten, in de viewBox van 1000 x 1250 over de 4:5-uitsnede; dekt 99,55 tot
 *   99,91 procent van de lap en 0,04 tot 0,28 procent hout. Gelijk in v1 en v2.
 * - naam: per rij een y (510,0, 813,3 en 1115,5), het midden van de tekst
 *   onder de lap; in v1 stonden de namen in een rij tot 5,4 eenheden uit elkaar
 *   (beeldkritiek fase 4). Geen stof in het naamvak.
 * - hout: de p90-pixel van het hout in het naamvak (Plus Jakarta Sans 500,
 *   14 px, 20 px hoog) op 390, 560 en 597 px breed, op de nieuwe y. Wit haalt
 *   daarop 9,31 tot 17,09 op de bron en 9,26 of meer op de webbestanden.
 */

export const PALETSLEUTEL = "herfst";

/** Datum van de meting. Een nieuwe W2 of een nieuw palet vraagt een nieuwe meting. */
export const KLEURPIEK_GEMETEN = "2026-10-09";

export const KLEURPIEK_VIEWBOX = { breedte: 1000, hoogte: 1250 } as const;

export interface Lap {
  /** Naam van de staal in het rapport, ook de sleutel in colorPalettes.ts. */
  staal: string;
  /** SVG-pad in de viewBox van 1000 x 1250. */
  pad: string;
  /** Midden van de naam op het hout, in viewBox-eenheden. */
  naam: { x: number; y: number };
  /** p90 van het hout onder de naam, per getoonde beeldbreedte in px. */
  hout: Record<"390" | "560" | "597", string>;
}

export const LAPPEN: readonly Lap[] = [
  {
    staal: "Camel",
    pad: "M78.9 270.5 L77.3 275.3 L76.8 280.8 L76.8 296.5 L80.6 343.2 L80.6 365.9 L79.5 403.9 L77.3 415.3 L76.8 444.6 L77.9 452.2 L79.5 454.4 L84.9 454.4 L89.3 457.1 L93.6 457.1 L96.3 462.5 L98.5 463.6 L311.7 462.5 L379 464.1 L438.1 464.1 L441.9 460.9 L440.9 439.2 L441.4 362.1 L442.5 314.4 L444.1 298.7 L444.1 288.9 L443 285.6 L443.6 265.6 L440.9 261.8 L409.9 261.8 L399.1 260.7 L303.6 261.2 L291.1 260.1 L240.1 260.1 L188 258 L125.6 258.5 L101.7 257.4 L98.5 259.6 L95.8 265 L89.8 265.6 L87.1 269.9 Z",
    naam: { x: 260.4, y: 510.0 },
    hout: { "390": "#50311C", "560": "#4B2D18", "597": "#492C1B" },
  },
  {
    staal: "Cognac",
    pad: "M557 268.8 L557 290 L553.7 293.2 L554.3 352.9 L552.1 434.3 L550.5 456.5 L553.2 458.7 L563.5 458.7 L566.2 461.4 L566.2 465.8 L567.3 467.4 L603.6 466.3 L610.7 467.4 L757.7 469 L780.5 467.9 L838.6 467.9 L866.8 466.9 L916.7 467.4 L918.9 465.8 L920 463.1 L921.6 450 L921.6 434.3 L920.5 428.9 L918.9 394.7 L918.9 320.4 L920 299.8 L921.1 295.4 L921.1 280.2 L920 275.9 L919.4 266.7 L916.7 263.4 L608 262.9 L586.8 262.3 L569.5 260.7 L568.4 261.2 L567.8 268.8 Z",
    naam: { x: 736.0, y: 510.0 },
    hout: { "390": "#623F2C", "560": "#5F3A26", "597": "#5E3926" },
  },
  {
    staal: "Olijfgroen",
    pad: "M80.6 567.2 L78.9 571.6 L78.4 578.6 L76.8 583.5 L76.8 593.3 L77.9 597.6 L77.9 609.5 L78.9 620.4 L78.9 665.4 L77.3 684.4 L76.8 726.2 L74.6 751.1 L75.1 759.8 L76.2 762 L80 765.2 L85.5 765.2 L90.3 771.8 L228.2 771.2 L272.1 772.3 L424 772.3 L437.6 773.9 L440.3 771.2 L441.4 766.9 L439.2 759.3 L439.2 753.3 L440.3 745.7 L441.4 613.3 L443 592.2 L442.5 572.1 L443.6 568.3 L443.6 566.1 L440.9 561.8 L341.6 561.3 L242.3 558.5 L143.5 558.5 L95.2 557.5 L90.3 565 L82.7 565.6 Z",
    naam: { x: 259.1, y: 813.3 },
    hout: { "390": "#482814", "560": "#3F2515", "597": "#3E2514" },
  },
  {
    staal: "Terracotta",
    pad: "M917.3 562.9 L913.5 560.2 L905.9 560.2 L899.9 561.8 L870.6 562.3 L616.1 562.3 L606.3 563.4 L584.6 563.4 L574.3 561.8 L565.1 562.3 L562.9 564.5 L562.9 572.1 L559.1 575.9 L560.2 617.1 L559.7 678.4 L557.5 714.2 L557.5 730.5 L556.4 732.2 L555.3 739.7 L555.3 749.5 L557.5 752.2 L561.3 753.3 L563.5 755.5 L564 769 L566.2 771.2 L570 772.3 L578.1 770.7 L587.4 770.1 L646.5 771.8 L676.9 771.8 L707.8 770.7 L890.1 769.6 L906.9 770.7 L908 771.8 L915.6 772.3 L918.9 770.7 L922.1 765.8 L923.8 756 L923.8 735.9 L926.5 733.2 L927 730.5 L923.8 698.5 L922.7 649.7 L923.8 632.3 L924.9 630.2 L924.9 619.3 L925.9 618.2 L926.5 608.5 L927.6 606.8 L928.1 588.9 L927.6 582.4 L924.9 579.2 L921.6 577.5 L921.1 571.6 L917.8 565.6 Z",
    naam: { x: 741.7, y: 813.3 },
    hout: { "390": "#4F2E1A", "560": "#4A2E20", "597": "#4B2E1F" },
  },
  {
    staal: "Ivory",
    pad: "M86.5 864 L86.5 879.2 L78.9 888.4 L76.8 912.3 L80.6 916.6 L81.7 925.3 L80 944.8 L82.7 968.7 L82.2 1020.2 L78.9 1041.4 L81.1 1051.7 L77.9 1059.3 L84.9 1071.2 L94.1 1073.4 L100.1 1071.2 L131 1071.2 L140.8 1073.9 L178.8 1070.7 L192.9 1073.4 L237.4 1071.2 L239 1073.4 L247.7 1071.8 L248.2 1074.5 L262.3 1071.2 L297.6 1072.3 L298.7 1074.5 L305.2 1072.3 L375.2 1072.3 L383.3 1074.5 L387.1 1072.3 L412.6 1073.4 L419.7 1071.2 L436.5 1074.5 L443 1071.2 L442.5 1047.9 L455.5 1042.5 L456.6 1032.2 L454.4 1024.6 L454.4 990.9 L452.3 989.9 L452.3 966.5 L455.5 962.2 L451.7 947.5 L453.3 937.2 L450.6 932.3 L450.6 909.6 L453.3 907.4 L452.8 888.4 L455.5 884.6 L449.5 874.8 L449.5 867.2 L442.5 857.5 L404 859.1 L374.7 856.4 L346.4 858.6 L255.8 855.3 L253.1 857.5 L181.5 858 L146.2 855.8 L127.8 858.6 L97.4 856.4 Z",
    naam: { x: 266.7, y: 1115.5 },
    hout: { "390": "#2A190D", "560": "#281910", "597": "#26190E" },
  },
  {
    staal: "Greige",
    pad: "M923.2 855.8 L919.4 853.7 L911.3 853.1 L898.8 854.2 L859.7 853.7 L838.6 855.8 L821.8 854.8 L820.7 855.8 L807.7 856.9 L775.1 856.4 L771.3 858 L766.4 858 L765.3 856.9 L732.2 858 L729 856.9 L727.3 858 L607.4 858 L599.3 859.6 L587.4 859.1 L583 860.2 L568.9 858.6 L564 859.1 L560.8 864.5 L561.3 873.8 L560.8 877 L557.5 880.8 L556.4 891.1 L559.1 904.7 L558.6 993.1 L560.8 1024 L559.7 1056 L564 1060.4 L563.5 1069.1 L564.6 1072.3 L568.4 1075 L572.7 1075 L576.5 1072.9 L616.7 1073.4 L672 1069.6 L759.9 1069.1 L869 1071.8 L898.8 1070.7 L900.4 1071.8 L924.9 1073.4 L928.6 1070.7 L930.3 1066.4 L931.4 1037.1 L929.2 1020.8 L928.6 995.8 L929.7 992.6 L928.6 992 L927.6 983.3 L927.6 954 L929.2 911.2 L931.9 889.5 L927.6 881.3 L925.4 861.8 L923.2 858.6 Z",
    naam: { x: 744.2, y: 1115.5 },
    hout: { "390": "#2D1D14", "560": "#2A1D14", "597": "#291D13" },
  },
];
