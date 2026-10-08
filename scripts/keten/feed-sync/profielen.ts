/**
 * Per retailer: hoe een databaserij en een feedregel als dezelfde rij herkend
 * worden als het feed-id veranderde.
 *
 * H&M gaf in de import van maart (88.043 rijen) andere Daisycon-ID's dan de
 * feed van 8 oktober 2026 (121.238 rijen): nul overlap, en ook de sku-reeks
 * is anders (18 tegen 24 cijfers). Het artikelnummer in de productpagina-URL
 * is gebleven. Een artikel is één kleur; de maat zit er als aparte rij onder.
 * Artikel en maat samen zijn dus de sleutel.
 */
import type { FeedProduct } from "../../../supabase/functions/_shared/daisyconRows";

export interface Profiel {
  naam: string;
  feedSleutel(p: FeedProduct): string | null;
  dbSleutel(r: { affiliate_url: string | null; sizes: string[] | null }): string | null;
}

const ARTIKEL = /productpage\.(\d+)\.html/;

/** Het H&M-artikelnummer uit een affiliate-link, waar de productpagina één of twee keer URL-gecodeerd in zit. */
export function artikelUitLink(link: string | null | undefined): string | null {
  if (!link) return null;
  let tekst = link;
  for (let poging = 0; poging < 3; poging++) {
    const m = tekst.match(ARTIKEL);
    if (m) return m[1];
    try {
      const gedecodeerd = decodeURIComponent(tekst);
      if (gedecodeerd === tekst) break;
      tekst = gedecodeerd;
    } catch {
      break;
    }
  }
  return null;
}

const maat = (m: string | null | undefined): string => (m ?? "").trim().toLowerCase();

export const HM_PROFIEL: Profiel = {
  naam: "H&M (NL)",
  feedSleutel(p) {
    const artikel = artikelUitLink(p.product_info?.link);
    return artikel ? `${artikel}|${maat(p.product_info?.size)}` : null;
  },
  dbSleutel(r) {
    const artikel = artikelUitLink(r.affiliate_url);
    return artikel ? `${artikel}|${maat(r.sizes?.[0])}` : null;
  },
};

export function profielVoor(retailer: string): Profiel | null {
  return retailer === HM_PROFIEL.naam ? HM_PROFIEL : null;
}
