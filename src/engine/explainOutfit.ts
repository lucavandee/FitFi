export default function explainOutfit(outfit: Outfit): string {
  const items = outfit.items?.map(i => i.title).filter(Boolean).slice(0, 3).join(", ");
  return outfit.explanation || `Deze outfit is gebalanceerd qua kleur en silhouet. Items: ${items || "basisstukken"}.`;
}