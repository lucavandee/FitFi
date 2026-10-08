import { quizSteps } from "@/data/quizSteps";
import type { BoltProduct } from "@/services/data/types";
import { bereidKandidatenVoorMetDiagnose, type KandidaatRij } from "@/services/outfits/kandidaten";

/**
 * De shop vraagt het maximum dat get_kandidaten per categorie levert (60), en
 * toont ze per pagina van zoveel stuks.
 */
export const SHOP_PER_CATEGORIE = 60;
export const SHOP_PAGINA = 48;

/** Vaste volgorde waarin de categorieen elkaar afwisselen. */
const CATEGORIE_VOLGORDE = ["top", "bottom", "dress", "outerwear", "footwear", "accessory"] as const;
const OVERIG = "overig";

/**
 * get_kandidaten geeft de rijen per categorie achter elkaar. In de shop zou
 * "Alle" dan eerst zestig accessoires tonen en pas daarna een top. Dit wisselt
 * de categorieen af (ronde na ronde het eerstvolgende item van elke categorie)
 * en laat de volgorde binnen een categorie, de rangorde van de RPC, intact.
 * Items zonder bekende categorie komen als laatste in elke ronde.
 */
export function mixCategorieen<T extends { category?: string }>(items: T[]): T[] {
  const emmers = new Map<string, T[]>(
    [...CATEGORIE_VOLGORDE, OVERIG].map((categorie) => [categorie, [] as T[]])
  );
  for (const item of items) {
    const categorie = item.category && emmers.has(item.category) && item.category !== OVERIG ? item.category : OVERIG;
    emmers.get(categorie)!.push(item);
  }
  const uit: T[] = [];
  const volgorde = [...emmers.values()];
  for (let ronde = 0; uit.length < items.length; ronde++) {
    for (const emmer of volgorde) {
      if (ronde < emmer.length) uit.push(emmer[ronde]);
    }
  }
  return uit;
}

/** De Nederlandse naam van elke gelegenheid, uit dezelfde bron als de quiz. */
const GELEGENHEID_LABELS: Record<string, string> = Object.fromEntries(
  (
    (quizSteps.find((stap) => (stap as { field?: string }).field === "occasions") as
      | { options?: Array<{ value: string; label: string }> }
      | undefined)?.options ?? []
  ).map((optie) => [String(optie.value), String(optie.label).toLowerCase()])
);

/**
 * "Past bij werk en casual." voor de gelegenheden waarvoor dit item getagd is
 * en die de bezoeker koos. Zonder overlap of zonder gekozen gelegenheden geen
 * tekst: een kaart belooft alleen afstemming als die er is.
 */
export function gelegenheidsTekst(gelegenheden: string[]): string | undefined {
  const namen = [...new Set(gelegenheden)].map((g) => GELEGENHEID_LABELS[g]).filter(Boolean);
  if (namen.length === 0) return undefined;
  const lijst = namen.length === 1 ? namen[0] : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
  return `Past bij ${lijst}.`;
}

/**
 * Van de rijen van get_kandidaten naar wat de shop toont: dezelfde classifier
 * en hetzelfde veiligheidsnet als de outfits (kandidaten.ts), de categorie van
 * product_attributes in plaats van die van de feed, en de categorieen
 * afgewisseld.
 */
export function bouwShopItems(rijen: KandidaatRij[], gevraagdeGelegenheden: string[]): BoltProduct[] {
  const { pool } = bereidKandidatenVoorMetDiagnose(rijen);
  const gelegenhedenPerId = new Map(
    rijen.map((rij) => [String(rij.product_id), (rij.attrs?.occasions as string[] | undefined) ?? []])
  );

  const items: BoltProduct[] = pool.map((product) => {
    // In de volgorde waarin de bezoeker ze koos, niet die van het item.
    const vanItem = gelegenhedenPerId.get(String(product.id)) ?? [];
    const passend = gevraagdeGelegenheden.filter((g) => vanItem.includes(g));
    return {
      id: product.id,
      title: product.name,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      image: product.imageUrl,
      retailer: product.retailer,
      url: product.affiliateUrl || product.productUrl,
      category: product.category,
      description: product.description,
      sizes: product.sizes,
      colors: product.colors,
      gender: product.gender as BoltProduct["gender"],
      in_stock: product.inStock,
      tags: product.tags,
      itemReason: gelegenheidsTekst(passend),
    };
  });

  return mixCategorieen(items);
}

/** De eerste `aantal` items, en hoeveel er daarna nog overblijven. */
export function zichtbareItems<T>(items: T[], aantal: number): { zichtbaar: T[]; resterend: number } {
  const zichtbaar = items.slice(0, Math.max(0, aantal));
  return { zichtbaar, resterend: items.length - zichtbaar.length };
}
