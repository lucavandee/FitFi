import type { ArchetypeKey } from "./archetypes";

export interface PersonalizedBenefit {
  value: string;
  label: string;
}

export const PREMIUM_BENEFITS_BY_ARCHETYPE: Record<ArchetypeKey, PersonalizedBenefit[]> = {
  MINIMALIST: [
    { value: "50+", label: "Tijdloze & clean outfits" },
    { value: "AI", label: "Minimalistische styling" },
    { value: "∞", label: "Opgeslagen capsules" },
  ],
  CLASSIC: [
    { value: "50+", label: "Preppy & verzorgde looks" },
    { value: "AI", label: "Klassieke advies" },
    { value: "∞", label: "Opgeslagen outfits" },
  ],
  SMART_CASUAL: [
    { value: "50+", label: "Office & casual combos" },
    { value: "AI", label: "Smart casual expert" },
    { value: "∞", label: "Opgeslagen looks" },
  ],
  STREETWEAR: [
    { value: "50+", label: "Streetwear & sneaker fits" },
    { value: "AI", label: "Urban styling tips" },
    { value: "∞", label: "Opgeslagen drip" },
  ],
  ATHLETIC: [
    { value: "50+", label: "Athleisure & sport looks" },
    { value: "AI", label: "Performance styling" },
    { value: "∞", label: "Opgeslagen fits" },
  ],
  AVANT_GARDE: [
    { value: "50+", label: "Avant-garde & conceptual fits" },
    { value: "AI", label: "Statement styling" },
    { value: "∞", label: "Opgeslagen looks" },
  ],
};

export function getBenefitsForArchetype(archetype: string | null): PersonalizedBenefit[] {
  if (!archetype) {
    return [
      { value: "50+", label: "Outfits per seizoen" },
      { value: "AI", label: "Styling assistent" },
      { value: "∞", label: "Opgeslagen outfits" },
    ];
  }

  const normalizedArchetype = archetype.toUpperCase().replace(/[-\s]/g, "_") as ArchetypeKey;

  return PREMIUM_BENEFITS_BY_ARCHETYPE[normalizedArchetype] || [
    { value: "50+", label: "Outfits per seizoen" },
    { value: "AI", label: "Styling assistent" },
    { value: "∞", label: "Opgeslagen outfits" },
  ];
}
