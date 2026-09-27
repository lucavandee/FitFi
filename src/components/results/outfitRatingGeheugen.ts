import type { OutfitRating } from "@/services/ratings/outfitRatings";

/**
 * Onthouden van een beoordeling per profiel en outfit, los van React zodat
 * het in node te testen is. De opslag is injecteerbaar; standaard
 * localStorage, en null als die er niet is (SSR, tests, private modus).
 */
export type Opslag = Pick<Storage, "getItem" | "setItem">;

export const OPSLAG_SLEUTEL = "ff_outfit_ratings";

const RATINGS: readonly OutfitRating[] = ["zou_dragen", "nooit"];

export function onthoudSleutel(profileHash: string | null, outfitId: string): string | null {
  return profileHash ? `${profileHash}:${outfitId}` : null;
}

function standaardOpslag(): Opslag | null {
  try {
    const ls = (globalThis as { localStorage?: Opslag }).localStorage;
    return ls && typeof ls.getItem === "function" ? ls : null;
  } catch {
    return null;
  }
}

function leesAlles(opslag: Opslag | null): Record<string, OutfitRating> {
  if (!opslag) return {};
  try {
    const raw = opslag.getItem(OPSLAG_SLEUTEL);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as Record<string, OutfitRating>) : {};
  } catch {
    return {};
  }
}

export function leesKeuze(sleutel: string, opslag: Opslag | null = standaardOpslag()): OutfitRating | null {
  const waarde = leesAlles(opslag)[sleutel];
  return RATINGS.includes(waarde) ? waarde : null;
}

type Luisteraar = (rating: OutfitRating) => void;
const luisteraars = new Map<string, Set<Luisteraar>>();

/** Meerdere instanties van dezelfde outfit op een pagina volgen elkaar zonder herlaad. */
export function abonneer(sleutel: string, cb: Luisteraar): () => void {
  const set = luisteraars.get(sleutel) ?? new Set<Luisteraar>();
  set.add(cb);
  luisteraars.set(sleutel, set);
  return () => {
    set.delete(cb);
    if (set.size === 0) luisteraars.delete(sleutel);
  };
}

export function bewaarKeuze(sleutel: string, rating: OutfitRating, opslag: Opslag | null = standaardOpslag()): void {
  try {
    if (opslag) {
      const alles = leesAlles(opslag);
      alles[sleutel] = rating;
      opslag.setItem(OPSLAG_SLEUTEL, JSON.stringify(alles));
    }
  } catch {
    // Niet kunnen onthouden is niet erg; de rij staat al in de database.
  }
  luisteraars.get(sleutel)?.forEach((cb) => cb(rating));
}

/**
 * De beslisregel van de knoppen: niet zonder hash, niet terwijl een
 * schrijfactie loopt, en niet als dit al de gekozen rating is. Dat laatste
 * is wat een herlaad gevolgd door dezelfde klik tegenhoudt.
 */
export function magSchrijven(
  stand: { profileHash: string | null; gekozen: OutfitRating | null; bezig: boolean },
  rating: OutfitRating
): boolean {
  if (!stand.profileHash) return false;
  if (stand.bezig) return false;
  if (stand.gekozen === rating) return false;
  return true;
}
