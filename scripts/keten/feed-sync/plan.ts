/**
 * Het plan van een feed-sync: welke databaserij hoort bij welke feedregel, wat
 * is verdwenen en wat is nieuw. Zuivere logica, zonder database of netwerk, zodat
 * ze op echte feeds droog gedraaid en onafhankelijk getest kan worden.
 *
 * Koppelen gaat in twee ronden. Eerst op external_id: zolang de feed stabiel is
 * hoeft er niets meer. Wat dan overblijft wordt op de natuurlijke sleutel van
 * het profiel gekoppeld (zie profielen.ts). Elke databaserij en elke feedregel
 * hoort daarbij hooguit één keer in een koppeling.
 */
import {
  getAllImages,
  getDefaultImage,
  type FeedProduct,
} from "../../../supabase/functions/_shared/daisyconRows";
import type { Profiel } from "./profielen";

export interface FeedRij {
  id: string;
  sleutel: string | null;
  price: number;
  priceOld: number | null;
  link: string;
  image: string;
  images: string[];
  inStock: boolean;
}

export interface DbRij {
  id: string;
  external_id: string;
  price: number | null;
  original_price: number | null;
  in_stock: boolean;
  affiliate_url: string | null;
  image_url: string | null;
  sleutel: string | null;
}

export interface Wijzigingen {
  externalId: boolean;
  prijs: boolean;
  oudePrijs: boolean;
  link: boolean;
  beeld: boolean;
  voorraad: boolean;
}

export interface Koppeling {
  db: DbRij;
  feed: FeedRij;
  via: "id" | "sleutel";
  wijzigt: Wijzigingen;
}

export interface Plan {
  koppelingen: Koppeling[];
  /** Op voorraad in de database, niet meer in de feed. */
  verdwenen: DbRij[];
  /** Niet in de feed, maar stond al uit voorraad: er verandert niets. */
  reedsUit: number;
  nieuw: FeedRij[];
  /** Feedregels met een id dat al eerder in dezelfde feed stond; alleen de eerste telt. */
  dubbeleFeedIds: number;
}

/** Bedrag in hele centen; leeg en nul zijn allebei "geen bedrag". */
const cent = (n: number | null | undefined): number | null => (n ? Math.round(n * 100) : null);

export function naarFeedRij(p: FeedProduct, profiel: Profiel | null): FeedRij | null {
  const id = p.update_info?.daisycon_unique_id || "";
  if (!id) return null;
  const info = p.product_info ?? {};
  const status = p.update_info?.status;
  const voorraad = String(info.in_stock ?? "true");
  const prijsOud = Number(info.price_old);
  return {
    id,
    sleutel: profiel ? profiel.feedSleutel(p) : null,
    price: Number(info.price) || 0,
    priceOld: Number.isFinite(prijsOud) && prijsOud > 0 ? prijsOud : null,
    link: info.link || "",
    image: getDefaultImage(info.images ?? []),
    images: getAllImages(info.images ?? []),
    inStock:
      status !== "inactive" && status !== "deleted" && voorraad !== "false" && voorraad !== "0" && voorraad !== "out_of_stock",
  };
}

function wijzigingen(db: DbRij, feed: FeedRij): Wijzigingen {
  return {
    externalId: db.external_id !== feed.id,
    prijs: cent(db.price) !== cent(feed.price),
    oudePrijs: cent(db.original_price) !== cent(feed.priceOld),
    link: (db.affiliate_url ?? "") !== feed.link,
    beeld: (db.image_url ?? "") !== feed.image,
    voorraad: db.in_stock !== feed.inStock,
  };
}

export function maakPlan(feed: FeedRij[], db: DbRij[]): Plan {
  const perId = new Map<string, FeedRij>();
  const uniek: FeedRij[] = [];
  let dubbeleFeedIds = 0;
  for (const f of feed) {
    if (perId.has(f.id)) {
      dubbeleFeedIds++;
      continue;
    }
    perId.set(f.id, f);
    uniek.push(f);
  }

  const gebruikt = new Set<FeedRij>();
  const koppelingen: Koppeling[] = [];
  const nietGekoppeld: DbRij[] = [];

  // Ronde 1: zelfde external_id.
  for (const r of db) {
    const f = perId.get(r.external_id);
    if (f && !gebruikt.has(f)) {
      gebruikt.add(f);
      koppelingen.push({ db: r, feed: f, via: "id", wijzigt: wijzigingen(r, f) });
    } else {
      nietGekoppeld.push(r);
    }
  }

  // Ronde 2: dezelfde natuurlijke sleutel. Gesorteerd, zodat de uitkomst niet
  // afhangt van de volgorde waarin de database of de feed de rijen leverde.
  const perSleutel = new Map<string, FeedRij[]>();
  for (const f of [...uniek].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    if (gebruikt.has(f) || !f.sleutel) continue;
    const rij = perSleutel.get(f.sleutel);
    if (rij) rij.push(f);
    else perSleutel.set(f.sleutel, [f]);
  }
  const rest: DbRij[] = [];
  for (const r of [...nietGekoppeld].sort((a, b) => (a.external_id < b.external_id ? -1 : a.external_id > b.external_id ? 1 : 0))) {
    const wachtrij = r.sleutel ? perSleutel.get(r.sleutel) : undefined;
    const f = wachtrij?.shift();
    if (f) {
      gebruikt.add(f);
      koppelingen.push({ db: r, feed: f, via: "sleutel", wijzigt: wijzigingen(r, f) });
    } else {
      rest.push(r);
    }
  }

  return {
    koppelingen,
    verdwenen: rest.filter((r) => r.in_stock),
    reedsUit: rest.filter((r) => !r.in_stock).length,
    nieuw: uniek.filter((f) => !gebruikt.has(f)),
    dubbeleFeedIds,
  };
}
