import { classificeerRij, type ClassificatieRij, type ProductBron } from "./classificatie";

export type VeegrondeRij = ProductBron;

export interface VeegrondeResultaat {
  gevonden: number;
  geschreven: number;
}

interface Uitkomst<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface VeegrondeAfhankelijkheden {
  /** Haalt tot `limiet` rijen op waarvan classifier_version null is. */
  haalOnbewerkt: (limiet: number) => Promise<Uitkomst<VeegrondeRij[]>>;
  /** Schrijft een geclassificeerde portie weg; geeft het aantal geschreven rijen terug. */
  schrijf: (batch: ClassificatieRij[]) => Promise<Uitkomst<number>>;
  log?: (...args: unknown[]) => void;
}

/**
 * Vangt op wat de paginering op id in scripts/keten/classificeer-attributes.ts
 * kan missen: products.id is een willekeurige uuid (geen verband met
 * invoegvolgorde), dus een cursor op de laatst verwerkte id kan een rij
 * overslaan die daarna is toegevoegd met een uuid die lexicografisch vóór
 * die cursor valt. Hetzelfde geldt voor rijen die plan 2's
 * keten_vul_nieuwe_producten() na een feed-import met classifier_version
 * null aanmaakt.
 *
 * Vraagt herhaaldelijk alle rijen met classifier_version is null op (met
 * steun van de partiële index idx_product_attributes_onbewerkt, die per
 * definitie klein blijft), classificeert en schrijft ze, tot een ronde
 * niets meer teruggeeft. Bij een schone catalogus is dat één lege ronde.
 */
export async function veegronde(
  limiet: number,
  afhankelijkheden: VeegrondeAfhankelijkheden
): Promise<VeegrondeResultaat> {
  const log = afhankelijkheden.log ?? (() => {});
  let gevonden = 0;
  let geschreven = 0;

  for (;;) {
    const { data, error } = await afhankelijkheden.haalOnbewerkt(limiet);
    if (error) throw new Error(`veegronde faalde bij lezen: ${error.message}`);
    const rijen = data ?? [];
    if (rijen.length === 0) break;

    const batch: ClassificatieRij[] = rijen.map((r) => classificeerRij(r));
    const { data: aantal, error: schrijfFout } = await afhankelijkheden.schrijf(batch);
    if (schrijfFout) throw new Error(`veegronde faalde bij schrijven: ${schrijfFout.message}`);

    gevonden += rijen.length;
    geschreven += Number(aantal ?? 0);
    log(`  veegronde: ${rijen.length} onbewerkte rijen gevonden en geclassificeerd (totaal ${gevonden})`);
  }

  return { gevonden, geschreven };
}
