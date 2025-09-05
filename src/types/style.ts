export type Archetype =
  | "smart_casual"
  | "minimal_chic"
  | "street_classic"
  | "business_sharp"
  | "sport_luxe";

export interface StyleProfile {
  archetypes: Partial<Record<Archetype, number>>; // 0..1 weging
  palette?: string[]; // hex
  gender?: "male" | "female" | "unisex";
}