/**
 * Welke gevraagde gelegenheden geen outfit kregen, en de zin die de
 * resultatenpagina daarover laat zien. Zie de test voor de aanleiding.
 */
export function ontbrekendeGelegenheden(
  gevraagd: readonly string[],
  outfits: ReadonlyArray<{ occasion?: string | null }>
): string[] {
  if (outfits.length === 0) return [];
  const gedekt = new Set(outfits.map((o) => String(o.occasion ?? "").toLowerCase()));
  const uniek = Array.from(new Set(gevraagd.map((g) => String(g).toLowerCase()).filter(Boolean)));
  return uniek.filter((g) => !gedekt.has(g));
}

export function meldingOntbrekend(labels: readonly string[]): string {
  if (labels.length === 0) return "";
  const klein = labels.map((l) => l.charAt(0).toLowerCase() + l.slice(1));
  const lijst = klein.length === 1 ? klein[0] : `${klein.slice(0, -1).join(", ")} en ${klein[klein.length - 1]}`;
  return `Voor ${lijst} vonden we nu geen outfits die bij je keuzes passen.`;
}
