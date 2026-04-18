import type { ColorProfile } from "./types";

export type OutfitPiece = {
  type: "top" | "bottom" | "shoes" | "accessory";
  label: string;
  color: string;
};

export type OutfitSeed = {
  id: string;
  title: string;
  vibe: string;
  notes: string;
  pieces?: OutfitPiece[];
  tags?: string[];
};

const LEGACY_TO_KEY: Record<string, string> = {
  "Clean Minimal": "MINIMALIST",
  "Smart Casual": "SMART_CASUAL",
  "Sporty Sharp": "ATHLETIC",
  "Classic Soft": "CLASSIC",
};

const SEED_OUTFITS: Record<string, Omit<OutfitSeed, "id">[]> = {
  MINIMALIST: [
    { title: "Office Minimal", vibe: "Werk / meeting", notes: "Strakke lijnen, laag contrast; nette sneakers of loafers." },
    { title: "Monochrome Light", vibe: "Tonal", notes: "Twee lagen; lang silhouet; minimaal detail." },
    { title: "Soft Greys", vibe: "Smart", notes: "Wol + katoen; subtiele textuur voor diepte." },
    { title: "Tailored Casual", vibe: "Casual net", notes: "Net jasje met knit tee en tapered broek." },
    { title: "Light Layers", vibe: "Transseason", notes: "Lichte layer met cropped broek voor lengte." },
    { title: "Weekend Clean", vibe: "Weekend", notes: "Polo of knit met rechte chino." },
  ],
  SMART_CASUAL: [
    { title: "Clean Casual", vibe: "Smart-casual", notes: "Neutrals met rustige textuur; draagbaar elke dag." },
    { title: "Warm Neutral Mix", vibe: "Casual", notes: "Zachte contrasten; koord of rib voor textuur." },
    { title: "Everyday Denim", vibe: "Casual", notes: "Net denim, hoogwaardig breiwerk." },
    { title: "Light Utility", vibe: "Smart", notes: "Overshirt + knit; praktisch en clean." },
    { title: "City Stroll", vibe: "Leisure", notes: "Comfortabele sneakers; compacte tas." },
    { title: "Dinner Casual", vibe: "Avond", notes: "Donkerdere basis, één verfijnd accent." },
  ],
  CLASSIC: [
    { title: "Soft Tonals", vibe: "Casual", notes: "Zachte tonale mix; cozy knits centraal." },
    { title: "Cardigan Set", vibe: "Smart-casual", notes: "Cardigan + tee; warm en rustig." },
    { title: "Relaxed Chino", vibe: "Leisure", notes: "Ruimvallend silhouet; lage contrasten." },
    { title: "Knit Dress-Down", vibe: "Casual", notes: "Breiwerk met relaxte broek." },
    { title: "Weekend Layers", vibe: "Weekend", notes: "Layering met zachte stoffen." },
    { title: "Quiet Evening", vibe: "Avond", notes: "Tonal, subtiele glans in accessoire." },
  ],
  STREETWEAR: [
    { title: "Urban Layers", vibe: "Streetwear", notes: "Hoodie + oversized jacket; chunky sneakers." },
    { title: "Cargo Casual", vibe: "Casual", notes: "Cargo pants met graphic tee en bomber jacket." },
    { title: "Skate Minimal", vibe: "Relaxed", notes: "Loose tee, wide jeans, canvas sneakers." },
    { title: "Tech Street", vibe: "Urban", notes: "Nylon jacket, joggers, retro runner." },
    { title: "Weekend Hoodie", vibe: "Leisure", notes: "Premium hoodie met straight jeans." },
    { title: "Statement Sneaker", vibe: "Statement", notes: "Monochrome outfit, opvallende sneaker." },
  ],
  ATHLETIC: [
    { title: "Technical Minimal", vibe: "Sportief-net", notes: "Schone performance-stoffen, geen grote logo's." },
    { title: "Track Smart", vibe: "Athleisure", notes: "Nette jogger met structured top." },
    { title: "Studio to Street", vibe: "Casual", notes: "Stretch top, cleane runner." },
    { title: "Layered Nylon", vibe: "Urban", notes: "Lichte nylon layer met tapered broek." },
    { title: "Hybrid Hoodie", vibe: "Smart", notes: "Fijne hoodie onder strak overshirt." },
    { title: "Rest Day Uniform", vibe: "Leisure", notes: "Zachte fleece + premium tee." },
  ],
  AVANT_GARDE: [
    { title: "Draped Layers", vibe: "Avant-garde", notes: "Asymmetrische silhouetten met monochrome kleuren." },
    { title: "Statement Mix", vibe: "Creatief", notes: "Onverwachte combinaties, bold texturen." },
    { title: "Dark Minimal", vibe: "Editorial", notes: "All-black met interessante volumes." },
    { title: "Deconstructed", vibe: "Art", notes: "Raw edges, oversized proportions." },
    { title: "Gallery Look", vibe: "Smart", notes: "Clean maar onconventioneel; een statement piece." },
    { title: "Night Creative", vibe: "Avond", notes: "Donkere basis met tactiele textuur." },
  ],
  BUSINESS: [
    { title: "Tailored Werk", vibe: "Kantoor", notes: "Strak colbert met nette pantalon; oxford schoenen." },
    { title: "Smart Presentatie", vibe: "Meeting", notes: "Blazer met crisp overhemd; gepolijste loafers." },
    { title: "Business Casual", vibe: "Kantoor casual", notes: "Chino met button-down; clean loafers of derby." },
    { title: "Zakelijk Dinner", vibe: "Diner", notes: "Donker kostuum of smart blazer; verfijnde accessoires." },
    { title: "Travel Professional", vibe: "Zakenreis", notes: "Kreukvrije pantalon met overhemd; derby schoenen." },
    { title: "Power Casual", vibe: "Vrije dag", notes: "Smart chino met luxe knitwear; nette schoen." },
  ],
};

function seasonText(c: ColorProfile): { palette: string; accentTip: string } {
  switch (c.season) {
    case "lente":
    case "spring": return { palette: "licht-warme neutrals", accentTip: "lichte, warme accenten" };
    case "zomer":
    case "summer": return { palette: "zacht-koele tonals", accentTip: "koele, zachte accenten" };
    case "herfst":
    case "autumn": return { palette: "aards-warme neutrals", accentTip: "diepere, warme accenten" };
    case "winter": return { palette: "crispe koele neutrals", accentTip: "hoog contrast, koel accent" };
    default:       return { palette: "neutrale tinten", accentTip: "zachte kleuraccenten" };
  }
}

function getSeasonalColors(c: ColorProfile): { base: string[]; accent: string[] } {
  switch (c.season) {
    case "lente":
    case "spring":
      return {
        base: ["#E8DDD3", "#D4C4B0", "#F5F0E8", "#C9B8A0"],
        accent: ["#E8B4A0", "#D4A88C", "#F0C8B0"],
      };
    case "zomer":
    case "summer":
      return {
        base: ["#E0E8F0", "#D0D8E0", "#C8D4DC", "#B8C8D4"],
        accent: ["#A8C4D8", "#98B8CC", "#B0D0E0"],
      };
    case "herfst":
    case "autumn":
      return {
        base: ["#C8B8A0", "#B0A090", "#A89080", "#988070"],
        accent: ["#D4A080", "#C49070", "#B88860"],
      };
    case "winter":
      return {
        base: ["#F0F0F0", "#E0E0E0", "#D0D0D0", "#303030"],
        accent: ["#E0F0F8", "#D0E8F0", "#C0E0E8"],
      };
    default:
      return {
        base: ["#E8E0D8", "#D8D0C8", "#F0EBE4", "#C8C0B8"],
        accent: ["#D4A88C", "#C8A080", "#E0B898"],
      };
  }
}

function generateOutfitPieces(
  outfitTitle: string,
  _archetype: string,
  colors: { base: string[]; accent: string[] }
): OutfitPiece[] {
  const baseColors = colors.base;
  const accentColors = colors.accent;

  const templates: Record<string, OutfitPiece[]> = {
    "Office Minimal": [
      { type: "top", label: "Light knit polo", color: baseColors[0] },
      { type: "bottom", label: "Straight chinos", color: baseColors[1] },
      { type: "shoes", label: "Minimal sneakers", color: baseColors[2] },
    ],
    "Monochrome Light": [
      { type: "top", label: "Oversized tee", color: baseColors[0] },
      { type: "bottom", label: "Wide leg trousers", color: baseColors[0] },
      { type: "shoes", label: "Leather loafers", color: baseColors[1] },
    ],
    "Clean Casual": [
      { type: "top", label: "Structured overshirt", color: baseColors[1] },
      { type: "bottom", label: "Tapered chinos", color: baseColors[2] },
      { type: "shoes", label: "Retro sneakers", color: accentColors[0] },
    ],
    "Warm Neutral Mix": [
      { type: "top", label: "Corduroy shirt", color: baseColors[0] },
      { type: "bottom", label: "Relaxed jeans", color: baseColors[3] },
      { type: "shoes", label: "Suede desert boots", color: baseColors[1] },
    ],
    "Technical Minimal": [
      { type: "top", label: "Performance tee", color: baseColors[2] },
      { type: "bottom", label: "Tech joggers", color: baseColors[3] },
      { type: "shoes", label: "Running shoes", color: accentColors[1] },
    ],
    "Soft Tonals": [
      { type: "top", label: "Cashmere knit", color: baseColors[0] },
      { type: "bottom", label: "Relaxed trousers", color: baseColors[1] },
      { type: "shoes", label: "Slip-on sneakers", color: baseColors[2] },
    ],
  };

  return templates[outfitTitle] || [
    { type: "top", label: "Classic shirt", color: baseColors[0] },
    { type: "bottom", label: "Straight pants", color: baseColors[1] },
    { type: "shoes", label: "Casual shoes", color: baseColors[2] },
  ];
}

export function getSeedOutfits(color: ColorProfile, archetype: string): OutfitSeed[] {
  const key = LEGACY_TO_KEY[archetype] || archetype;
  const base = SEED_OUTFITS[key] || SEED_OUTFITS.SMART_CASUAL;
  if (!base) return [];

  const { palette, accentTip } = seasonText(color);
  const seasonalColors = getSeasonalColors(color);

  return base.map((b, i) => ({
    id: `${key}-${color.season}-${i + 1}`,
    title: b.title,
    vibe: b.vibe,
    notes: `${b.notes} Palet: ${palette}. Tip: ${accentTip}.`,
    pieces: generateOutfitPieces(b.title, key, seasonalColors),
    tags: [key, color.season, color.temperature, color.contrast],
  }));
}