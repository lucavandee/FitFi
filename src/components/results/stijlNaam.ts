/**
 * De stijlnaam en Stijl DNA-sleutel uit wat de bezoeker zelf koos. Zie de
 * test voor de aanleiding. Null betekent: geen keuze, val terug op het
 * opgeslagen archetype.
 */
import type { ArchetypeKey } from "@/config/archetypes";

const NAAM: Record<string, string> = {
  minimalist: "minimalistisch",
  classic: "klassiek",
  business: "zakelijk",
  streetwear: "streetwear",
  "smart-casual": "smart casual",
  casual: "casual",
  bohemian: "bohemien",
  romantic: "romantisch",
  edgy: "stoer",
  athletic: "sportief",
  rugged: "stoer",
  "avant-garde": "experimenteel",
  androgynous: "androgyn",
};

const SLEUTEL: Record<string, ArchetypeKey> = {
  minimalist: "MINIMALIST",
  classic: "CLASSIC",
  business: "CLASSIC",
  streetwear: "STREETWEAR",
  "smart-casual": "SMART_CASUAL",
  athletic: "ATHLETIC",
  "avant-garde": "AVANT_GARDE",
};

function keuze(prefs: unknown): string[] {
  return (Array.isArray(prefs) ? prefs : []).map((x) => String(x).toLowerCase().trim()).filter((x) => NAAM[x]);
}

export function stijlNaamUitKeuze(prefs: unknown): string | null {
  const namen = Array.from(new Set(keuze(prefs).map((x) => NAAM[x]))).slice(0, 2);
  if (namen.length === 0) return null;
  const tekst = namen.join(" en ");
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

export function archetypeKeyUitKeuze(prefs: unknown): ArchetypeKey | null {
  for (const x of keuze(prefs)) if (SLEUTEL[x]) return SLEUTEL[x];
  return null;
}
