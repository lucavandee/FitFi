/**
 * Kandidaat-outfits per combinatie (geslacht, stijl, gelegenheid), om vooraf
 * te laten keuren door de stijl-agent. Zie docs/keten/vooraf-keuren.md.
 *
 * Puur: de aanroeper haalt de pool op (get_kandidaten en get_stijl_kandidaten)
 * en draait de engine; deze module bepaalt de antwoorden per combinatie en
 * kiest uit de runs een gevarieerde set zonder dubbele outfits.
 */

export interface Combinatie {
  geslacht: "female" | "male";
  stijl: string;
  gelegenheid: string;
}

/** Een vaste sleutel per combinatie, voor opslag en hervatten. */
export function combinatieSleutel(c: Combinatie): string {
  return `${c.geslacht}|${c.stijl}|${c.gelegenheid}`;
}

/**
 * Quizantwoorden waarmee de keten kandidaten voor een combinatie maakt. Breed:
 * geen lichtheid, print of kleur, zodat de bibliotheek per bezoeker nog te
 * filteren is; het budget tot 250 euro per stuk sluit de duurste stukken uit.
 */
export function antwoordenVoor(c: Combinatie, budgetMax = 250): Record<string, unknown> {
  return {
    gender: c.geslacht,
    stylePreferences: [c.stijl],
    occasions: [c.gelegenheid],
    budget: { min: 0, max: budgetMax },
    fit: "regular",
  };
}

/** Alles met producten die een id hebben: een engine-outfit of een eigen record. */
type MetProducten = { products: ReadonlyArray<{ id: unknown }> };

/** Een outfit is zijn set producten, ongeacht de volgorde. */
export function outfitSleutel(o: MetProducten): string {
  return o.products
    .map((p) => String(p.id))
    .sort()
    .join("|");
}

/**
 * Kiest uit meerdere engine-runs hooguit `max` outfits: geen dubbele sets, geen
 * set die al gekeurd is, en geen product dat al `maxPerProduct` keer voorkomt
 * (anders is de halve bibliotheek dezelfde jas).
 */
export function kiesKandidaten<T extends MetProducten>(
  runs: T[][],
  opties: { max: number; maxPerProduct?: number; alGekeurd?: Set<string> }
): T[] {
  const maxPerProduct = opties.maxPerProduct ?? 3;
  const gezien = new Set(opties.alGekeurd ?? []);
  const perProduct = new Map<string, number>();
  const uit: T[] = [];
  // Om en om uit de runs, zodat elke run (elk zaad) meedoet.
  const langste = Math.max(0, ...runs.map((r) => r.length));
  for (let i = 0; i < langste && uit.length < opties.max; i++) {
    for (const run of runs) {
      const o = run[i];
      if (!o || uit.length >= opties.max) continue;
      const sleutel = outfitSleutel(o);
      if (gezien.has(sleutel)) continue;
      if (o.products.some((p) => (perProduct.get(String(p.id)) ?? 0) >= maxPerProduct)) continue;
      gezien.add(sleutel);
      for (const p of o.products) perProduct.set(String(p.id), (perProduct.get(String(p.id)) ?? 0) + 1);
      uit.push(o);
    }
  }
  return uit;
}
