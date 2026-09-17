/**
 * JSON met gesorteerde sleutels op elk niveau. Twee objecten met dezelfde
 * inhoud geven dezelfde string, ongeacht de volgorde waarin de sleutels zijn
 * gezet. Basis voor de profile-hash (outfit_ratings) en de engine-seed.
 *
 * Arrays houden hun eigen volgorde: daar betekent volgorde iets (bijvoorbeeld
 * "eerste keuze" versus "tweede keuze" bij een quizantwoord).
 *
 * Bewuste keuzes voor waarden die JSON niet zuiver kan weergeven:
 *
 *   undefined   wordt overgeslagen als objectsleutel en wordt null in een
 *               array, precies zoals JSON.stringify dat al doet.
 *   functie     valt weg, ook net als JSON.stringify.
 *   Date        wordt zijn ISO-string. Zonder deze regel behandelt de
 *               sorteerstap een Date als een gewoon object, en omdat een
 *               Date geen eigen enumerable properties heeft levert dat een
 *               leeg object op: twee verschillende datums zouden dan
 *               allebei op "{}" uitkomen.
 *   NaN/Infinity  gooien een fout. JSON.stringify zet deze stilletjes om naar
 *               null, waardoor een profiel met NaN en een profiel met null
 *               dezelfde hash zouden krijgen. Een expliciete fout is hier
 *               beter dan die stille botsing.
 *   circulaire  gooien een fout met een duidelijke reden, in plaats van een
 *   verwijzing  stack overflow. Eenzelfde object dat op twee niet-circulaire
 *               plekken voorkomt (een gedeelde referentie, geen cirkel) mag
 *               wel: dat kan JSON.stringify ook gewoon aan.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sorteer(value, new Set<object>()));
}

function sorteer(value: unknown, pad: Set<object>): unknown {
  if (value === null) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        `stableStringify: niet-eindig getal (${value}) kan niet stabiel gehasht worden`
      );
    }
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (pad.has(value)) {
      throw new Error("stableStringify: circulaire verwijzing gevonden in een array");
    }
    pad.add(value);
    const uit = value.map((element) => sorteer(element, pad));
    pad.delete(value);
    return uit;
  }

  if (typeof value === "object") {
    if (pad.has(value)) {
      throw new Error("stableStringify: circulaire verwijzing gevonden in een object");
    }
    pad.add(value);
    const bron = value as Record<string, unknown>;
    const uit: Record<string, unknown> = {};
    for (const sleutel of Object.keys(bron).sort()) {
      if (bron[sleutel] === undefined) continue;
      uit[sleutel] = sorteer(bron[sleutel], pad);
    }
    pad.delete(value);
    return uit;
  }

  return value;
}
