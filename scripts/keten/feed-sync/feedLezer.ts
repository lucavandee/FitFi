/**
 * Leest een Daisycon-feed (standaard JSON) als stroom, één product tegelijk.
 *
 * Waarom geen JSON.parse op het geheel: de H&M-feed is 237 MB. Dat past niet in
 * de edge function, en op deze Mac (8 GB swap, bijna vol) wil je het ook niet als
 * objectboom in het geheugen. Deze lezer houdt hooguit een chunk plus één
 * half product vast.
 *
 * De kop van de feed (aantal producten, programma, tijdstip) staat vóór de
 * lijst met producten en wordt daaruit gehaald. Het aantal producten volgens
 * de kop is wat de bewaking later vergelijkt met wat er echt binnenkwam: een
 * afgekapte download levert minder producten dan de kop belooft.
 */
import type { FeedProduct } from "../../../supabase/functions/_shared/daisyconRows";

export interface FeedKop {
  /** Het aantal dat de feed zelf noemt (datafeed.info.product_count). */
  productAantal: number | null;
  programmaNaam: string | null;
  programmaId: number | null;
  /** Wanneer Daisycon deze feed samenstelde (datafeed.info.date_created). */
  gegenereerd: string | null;
}

const MAX_KOP_BYTES = 1 << 20;
const ACCOLADE_OPEN = 0x7b;
const ACCOLADE_SLUIT = 0x7d;
const HAAK_OPEN = 0x5b;
const HAAK_SLUIT = 0x5d;
const AANHALING = 0x22;
const BACKSLASH = 0x5c;
const SCHEIDING = new Set([0x20, 0x0a, 0x0d, 0x09, 0x2c]);

function leesKop(tekst: string): FeedKop {
  const aantal = tekst.match(/"product_count"\s*:\s*(\d+)/);
  const gegenereerd = tekst.match(/"date_created"\s*:\s*"([^"]+)"/);
  const id = tekst.match(/"program_info"\s*:\s*\{\s*"id"\s*:\s*(\d+)/);
  const naam = tekst.match(/"program_info"\s*:\s*\{[^}]*?"name"\s*:\s*("(?:[^"\\]|\\.)*")/);
  return {
    productAantal: aantal ? Number(aantal[1]) : null,
    programmaNaam: naam ? (JSON.parse(naam[1]) as string) : null,
    programmaId: id ? Number(id[1]) : null,
    gegenereerd: gegenereerd ? gegenereerd[1] : null,
  };
}

/** Index vlak na de sluitende } van het object dat op `start` begint, of -1 als het nog niet compleet is. */
function objectEinde(buf: Buffer, start: number): number {
  let diepte = 0;
  let inTekst = false;
  for (let i = start; i < buf.length; i++) {
    const c = buf[i];
    if (inTekst) {
      if (c === BACKSLASH) i++;
      else if (c === AANHALING) inTekst = false;
    } else if (c === AANHALING) {
      inTekst = true;
    } else if (c === ACCOLADE_OPEN || c === HAAK_OPEN) {
      diepte++;
    } else if (c === ACCOLADE_SLUIT || c === HAAK_SLUIT) {
      diepte--;
      if (diepte === 0) return i + 1;
    }
  }
  return -1;
}

export async function leesFeed(
  bron: AsyncIterable<Uint8Array>,
  perProduct: (p: FeedProduct) => void | Promise<void>
): Promise<{ kop: FeedKop; aantalGelezen: number }> {
  let buf: Buffer = Buffer.alloc(0);
  let pos = 0;
  let fase: "kop" | "lijst" | "klaar" = "kop";
  let kop: FeedKop = { productAantal: null, programmaNaam: null, programmaId: null, gegenereerd: null };
  let aantalGelezen = 0;

  for await (const chunk of bron) {
    buf = Buffer.concat([buf.subarray(pos), Buffer.from(chunk)]);
    pos = 0;

    if (fase === "kop") {
      const i = buf.indexOf('"products"');
      if (i < 0) {
        if (buf.length > MAX_KOP_BYTES) throw new Error('Geen "products" in de eerste megabyte: dit is geen Daisycon-feed');
        continue;
      }
      const haak = buf.indexOf(HAAK_OPEN, i);
      if (haak < 0) continue;
      kop = leesKop(buf.toString("utf8", 0, i));
      pos = haak + 1;
      fase = "lijst";
    }

    if (fase === "lijst") {
      for (;;) {
        while (pos < buf.length && SCHEIDING.has(buf[pos])) pos++;
        if (pos >= buf.length) break;
        if (buf[pos] === HAAK_SLUIT) {
          fase = "klaar";
          break;
        }
        if (buf[pos] !== ACCOLADE_OPEN) {
          throw new Error(`Onverwacht teken in de productenlijst (byte ${buf[pos]}): geen geldige Daisycon-feed`);
        }
        const einde = objectEinde(buf, pos);
        if (einde < 0) break; // product loopt door in de volgende chunk
        const product = JSON.parse(buf.toString("utf8", pos, einde)) as FeedProduct;
        pos = einde;
        aantalGelezen++;
        await perProduct(product);
      }
    }
    if (fase === "klaar") break;
  }

  if (fase === "kop") {
    throw new Error('Geen "products"-lijst gevonden in de feed (leeg antwoord, of geen Daisycon-feed)');
  }
  return { kop, aantalGelezen };
}
