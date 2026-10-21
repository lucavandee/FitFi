/**
 * De kalibratie van de stijl-agent zoals de nacht keurt.
 *
 * Review van 21 oktober 2026: de kalibratie stuurde de id's uit de set
 * letterlijk mee ("goed-4", "fout-4", "luc-oud-1"), in porties op volgorde van
 * de set (een portie met alleen luc-oud, een met bijna alleen goed), en met
 * lichtheid en kleurtemperatuur in het profiel. De nacht stuurt korte id's in
 * gemengde porties, zonder die voorkeuren (stijlSets.ts, naarKeurOutfit). De
 * eerdere uitkomst (17 van 17 fout herkend, 9 van 10 goed) kan dus mede op het
 * label berusten. Vanaf nu ziet de agent in de kalibratie hetzelfde als in de
 * nacht.
 */
import { productVariantKey } from "@/services/outfits/dedupeProductVariants";
import type { KeurOutfit } from "./stijlAgent";
import { schud } from "./stijlSets";

/** Wat de nacht niet stuurt: een verwachting die hiervan afhangt, telt niet. */
const NIET_IN_DE_NACHT = ["lichtheid", "kleurtemperatuur", "spoor"];

export function zoalsDeNacht(o: KeurOutfit, kortId: string): KeurOutfit {
  return {
    id: kortId,
    profiel: { geslacht: o.profiel.geslacht, stijlen: o.profiel.stijlen, gelegenheid: o.profiel.gelegenheid },
    stukken: o.stukken.map((s) => ({
      categorie: s.categorie,
      naam: productVariantKey(s.naam),
      merk: s.merk ?? null,
      prijs: s.prijs ?? null,
      kleuren: s.kleuren ?? null,
    })),
  };
}

export function verwachtZoalsDeNacht(o: { verwacht: "goed" | "fout" | null; afhankelijk_van?: string[] }): "goed" | "fout" | null {
  return (o.afhankelijk_van ?? []).some((v) => NIET_IN_DE_NACHT.includes(v)) ? null : o.verwacht;
}

/** De hele set gehusseld met een vast zaad, in porties met per portie k1 tot en met kn. */
export function kalibratiePorties<T extends { id: string }>(outfits: T[], grootte: number, zaad: number): Array<Array<{ outfit: T; kort: string }>> {
  const geschud = schud(outfits, zaad);
  const uit: Array<Array<{ outfit: T; kort: string }>> = [];
  for (let i = 0; i < geschud.length; i += grootte) {
    uit.push(geschud.slice(i, i + grootte).map((outfit, j) => ({ outfit, kort: `k${j + 1}` })));
  }
  return uit;
}
