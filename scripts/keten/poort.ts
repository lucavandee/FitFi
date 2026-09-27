/** Pure besluitlogica van de feed-poort (spec 5.7). Geen netwerk. */
export type Matrix = Record<string, Record<string, Record<string, number>>>;

export interface PersonaOutput {
  overgeslagen: boolean;
  exit_code?: number;
  stdout?: string;
  stderr?: string;
}

export const GENDERS = ["male", "female"] as const;
export const OCCASIONS = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;
export const POORT_BANDEN = ["tot50", "50tot100"] as const;

export function legeCellen(matrix: Matrix, banden: readonly string[] = POORT_BANDEN): string[] {
  const leeg: string[] = [];
  for (const g of GENDERS) {
    for (const o of OCCASIONS) {
      for (const b of banden) {
        const n = matrix?.[g]?.[o]?.[b] ?? 0;
        if (n <= 0) leeg.push(`${g}/${o}/${b}`);
      }
    }
  }
  return leeg;
}

export function isGroen(leeg: string[], persona: PersonaOutput): boolean {
  if (leeg.length > 0) return false;
  if (persona.overgeslagen) return false;
  return persona.exit_code === 0;
}
