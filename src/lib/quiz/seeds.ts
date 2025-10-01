// /src/lib/quiz/seeds.ts
import type { ColorProfile, Archetype } from "./types";

export type OutfitSeed = {
  id: string;
  title: string;
  vibe: string;
  notes: string;
  tags?: string[];
  // optioneel voor affiliate-koppeling per item
  items?: { merchant: string; sku: string; name: string }[];
};

const BASE_BY_ARCHETYPE: Record<Archetype, Omit<OutfitSeed, "id">[]> = {
  "Clean Minimal": [
    { title: "Office Minimal", vibe: "Werk / meeting", notes: "Strakke lijnen, laag contrast; nette sneakers of loafers." },
    { title: "Monochrome Light", vibe: "Tonal", notes: "Twee lagen; lang silhouet; minimaal detail." },
    { title: "Soft Greys", vibe: "Smart", notes: "Wol + katoen; subtiele textuur voor diepte." },
    { title: "Tailored Casual", vibe: "Casual net", notes: "Net jasje met knit tee en tapered broek." },
    { title: "Light Layers", vibe: "Transseason", notes: "Lichte layer met cropped broek voor lengte." },
    { title: "Weekend Clean", vibe: "Weekend", notes: "Polo of knit met rechte chino." },
  ],
  "Smart Casual": [
    { title: "Clean Casual", vibe: "Smart-casual", notes: "Neutrals met rustige textuur; draagbaar elke dag." },
    { title: "Warm Neutral Mix", vibe: "Casual", notes: "Zachte contrasten; koord of rib voor textuur." },
    { title: "Everyday Denim", vibe: "Casual", notes: "Net denim, hoogwaardig breiwerk." },
    { title: "Light Utility", vibe: "Smart", notes: "Overshirt + knit; praktisch en clean." },
    { title: "City Stroll", vibe: "Leisure", notes: "Comfortabele sneakers; compacte tas." },
    { title: "Dinner Casual", vibe: "Avond", notes: "Donkerdere basis, één verfijnd accent." },
  ],
  "Sporty Sharp": [
    { title: "Technical Minimal", vibe: "Sportief-net", notes: "Schone performance-stoffen, geen grote logo's." },
    { title: "Track Smart", vibe: "Athleisure", notes: "Nette jogger met structured top." },
    { title: "Studio to Street", vibe: "Casual", notes: "Stretch top, cleane runner." },
    { title: "Layered Nylon", vibe: "Urban", notes: "Lichte nylon layer met tapered broek." },
    { title: "Hybrid Hoodie", vibe: "Smart", notes: "Fijne hoodie onder strak overshirt." },
    { title: "Rest Day Uniform", vibe: "Leisure", notes: "Zachte fleece + premium tee." },
  ],
  "Classic Soft": [
    { title: "Soft Tonals", vibe: "Casual", notes: "Zachte tonale mix; cozy knits centraal." },
    { title: "Cardigan Set", vibe: "Smart-casual", notes: "Cardigan + tee; warm en rustig." },
    { title: "Relaxed Chino", vibe: "Leisure", notes: "Ruimvallend silhouet; lage contrasten." },
    { title: "Knit Dress-Down", vibe: "Casual", notes: "Breiwerk met relaxte broek." },
    { title: "Weekend Layers", vibe: "Weekend", notes: "Layering met zachte stoffen." },
    { title: "Quiet Evening", vibe: "Avond", notes: "Tonal, subtiele glans in accessoire." },
  ],
};

function seasonText(c: ColorProfile): { palette: string; accentTip: string } {
  switch (c.season) {
    case "lente":  return { palette: "licht-warme neutrals", accentTip: "lichte, warme accenten" };
    case "zomer":  return { palette: "zacht-koele tonals", accentTip: "koele, zachte accenten" };
    case "herfst": return { palette: "aards-warme neutrals", accentTip: "diepere, warme accenten" };
    case "winter": return { palette: "crispe koele neutrals", accentTip: "hoog contrast, koel accent" };
  }
}

export function getSeedOutfits(color: ColorProfile, archetype: Archetype): OutfitSeed[] {
  const base = BASE_BY_ARCHETYPE[archetype];
  const { palette, accentTip } = seasonText(color);
  return base.map((b, i) => ({
    id: `${archetype.replace(/\s+/g, "")}-${color.season}-${i + 1}`,
    title: b.title,
    vibe: b.vibe,
    notes: `${b.notes} Palet: ${palette}. Tip: ${accentTip}.`,
    tags: [archetype, color.season, color.temperature, color.contrast],
  }));
}