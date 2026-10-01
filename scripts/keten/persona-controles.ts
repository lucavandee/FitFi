/**
 * Pure controles van het persona-harnas (scripts/keten/persona-run.ts, spec
 * 5.7), los van het script zodat vitest ze kan toetsen. persona-run.ts leest
 * bij het laden .env, kan process.exit aanroepen en start onderaan main()
 * tegen de live database: een import in een test zou het hele harnas draaien.
 * Dezelfde scheiding als stylist-run.ts en stylist-controles.ts.
 */

const kleineLetters = (gelegenheid: unknown): string => String(gelegenheid ?? "").toLowerCase();

/**
 * Elke gevraagde gelegenheid komt in minstens een outfit voor.
 *
 * Keerzijde van gelegenheidGevraagd() in persona-run.ts: die toetst per outfit
 * of zijn gelegenheid WEL gevraagd was, deze functie of elke gevraagde
 * gelegenheid WEL een outfit heeft. Zonder deze kant meldt de poort een engine
 * die een gelegenheid laat vallen als "minder dan 6 outfits", een cijfer dat
 * de oorzaak verbergt, en laat hij zes outfits van een gelegenheid gewoon door
 * terwijl de persona er twee vroeg.
 *
 * Dezelfde regel en dezelfde randgevallen als controleerGelegenheidsdekking in
 * supabase/functions/_shared/valideer-set.ts (de stylist-route), zodat de twee
 * paden niet uit elkaar lopen. persona-controles.test.ts legt ze op dezelfde
 * invoer naast elkaar.
 * - Nul gevraagde gelegenheden: de regel vervalt, er is niets te dekken.
 * - Meer unieke gevraagde gelegenheden dan outfits (aantalOutfits, het getal
 *   dat het harnas aan de engine vraagt, niet het getal dat terugkwam: dat
 *   zou een tekort verbergen): volledige dekking kan niet, dus valt de eis
 *   terug op minstens aantalOutfits verschillende gelegenheden in de set.
 *
 * De melding noemt wat ontbreekt, wat gevraagd was en wat wel gedekt is, met
 * het aantal outfits per gelegenheid, zodat de oorzaak uit de uitvoer blijkt.
 * Gelegenheden worden zonder hoofdletters vergeleken, net als per outfit.
 */
export function controleerGelegenheidsdekking(
  outfits: ReadonlyArray<{ occasion: string }>,
  gevraagd: readonly string[],
  aantalOutfits: number
): string[] {
  const uniekGevraagd = Array.from(new Set(gevraagd.map(kleineLetters)));
  if (uniekGevraagd.length === 0) return [];

  // Outfits per gelegenheid, in de volgorde van eerste voorkomen.
  const perGelegenheid = new Map<string, number>();
  for (const outfit of outfits) {
    const gelegenheid = kleineLetters(outfit.occasion);
    perGelegenheid.set(gelegenheid, (perGelegenheid.get(gelegenheid) ?? 0) + 1);
  }

  if (uniekGevraagd.length > aantalOutfits) {
    if (perGelegenheid.size < aantalOutfits) {
      return [
        `persona vraagt ${uniekGevraagd.length} gelegenheden, meer dan de ${aantalOutfits} outfits kunnen dekken; ` +
          `verwacht daarom minstens ${aantalOutfits} verschillende gelegenheden in de set, kreeg er ${perGelegenheid.size} (${[...perGelegenheid.keys()].join(", ") || "geen"})`,
      ];
    }
    return [];
  }

  const ontbrekend = uniekGevraagd.filter((gelegenheid) => !perGelegenheid.has(gelegenheid));
  if (ontbrekend.length === 0) return [];

  const gedekt = [...perGelegenheid]
    .map(([gelegenheid, aantal]) => `${gelegenheid} (${aantal} ${aantal === 1 ? "outfit" : "outfits"})`)
    .join(", ");
  return [
    `gelegenheid(-heden) niet gedekt: ${ontbrekend.join(", ")}; gevraagd: ${uniekGevraagd.join(", ")}; wel gedekt: ${gedekt || "niets"}`,
  ];
}
