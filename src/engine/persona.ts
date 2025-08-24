export type Persona = {
  id: string;
  name: string;
  keywords: string[];
  palette: string[];
  keyItems: string[];
};

export const PERSONAS: Persona[] = [
  {
    id: "casual_chic",
    name: "Casual Chic",
    keywords: ["blazer", "slim fit", "neutraal"],
    palette: ["#0F172A", "#334155", "#94A3B8"],
    keyItems: ["blazer", "jeans"],
  },
  {
    id: "urban",
    name: "Urban",
    keywords: ["hoodie", "sneakers", "denim"],
    palette: ["#111827", "#6B7280", "#9CA3AF"],
    keyItems: ["hoodie", "sneaker"],
  },
  {
    id: "streetstyle",
    name: "Streetstyle",
    keywords: ["oversized", "cargo", "graphic"],
    palette: ["#0B0F19", "#3F3F46", "#D4D4D8"],
    keyItems: ["cargo", "tee"],
  },
  {
    id: "retro",
    name: "Retro",
    keywords: ["vintage", "corduroy", "pattern"],
    palette: ["#4B5563", "#A16207", "#92400E"],
    keyItems: ["corduroy", "polo"],
  },
  {
    id: "klassiek",
    name: "Klassiek",
    keywords: ["oxford", "trench", "leer"],
    palette: ["#1F2937", "#6B7280", "#D1D5DB"],
    keyItems: ["trench", "oxford"],
  },
  {
    id: "luxury",
    name: "Luxury",
    keywords: ["zijde", "wol", "tailored"],
    palette: ["#111827", "#374151", "#E5E7EB"],
    keyItems: ["cashmere", "loafer"],
  },
];

export function scoreProductForPersona(
  p: any,
  personaId = "casual_chic",
): number {
  const per = PERSONAS.find((x) => x.id === personaId) ?? PERSONAS[0];
  const name = (p.name || "").toLowerCase();
  const tags: string[] = (p.styleTags || []).map((t: string) =>
    t.toLowerCase(),
  );
  const color = (p.color || "").toLowerCase();
  let s = 0;
  per.keywords.forEach((k) => {
    if (name.includes(k) || tags.includes(k)) s += 20;
  });
  per.keyItems.forEach((k) => {
    if (name.includes(k) || tags.includes(k)) s += 15;
  });
  if (
    per.palette.some(
      (hex) =>
        color.includes("navy") ||
        color.includes("black") ||
        color.includes("grey"),
    )
  )
    s += 10;
  return Math.max(0, Math.min(100, s));
}
