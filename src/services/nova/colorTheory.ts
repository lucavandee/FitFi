export interface ColorAdvice {
  undertone: "warm" | "cool" | "neutral";
  bestColors: ColorRecommendation[];
  avoidColors: string[];
  seasonalPalette: string;
  complementaryPairs: [string, string][];
  explanation: string;
  archetype: string;
}

export interface ColorRecommendation {
  color: string;
  hex: string;
  reason: string;
  category: "base" | "accent" | "neutral";
  occasions: string[];
  cssVar?: string;
}

const WARM_PALETTE: ColorRecommendation[] = [
  {
    color: "Camel",
    hex: "#C19A6B",
    reason: "Warme basis die je huid laat stralen",
    category: "base",
    occasions: ["work", "casual", "smart-casual"],
  },
  {
    color: "Terracotta",
    hex: "#E2725B",
    reason: "Aardse toon die warmte toevoegt zonder overdrijving",
    category: "accent",
    occasions: ["casual", "weekend"],
  },
  {
    color: "Cream",
    hex: "#FFFDD0",
    reason: "Zachte neutral die harmonieus is met warme tonen",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Olive",
    hex: "#708238",
    reason: "Natuurlijke toon die balanceert en verzacht",
    category: "base",
    occasions: ["casual", "outdoor"],
  },
  {
    color: "Rust",
    hex: "#B7410E",
    reason: "Diep en rijk accent voor herfst/winter",
    category: "accent",
    occasions: ["autumn", "evening"],
  },
  {
    color: "Mustard",
    hex: "#FFDB58",
    reason: "Levendig accent dat energie geeft",
    category: "accent",
    occasions: ["casual", "creative"],
  },
  {
    color: "Warm Grey",
    hex: "#8C7E6E",
    reason: "Veelzijdige neutral met warme ondertoon",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Cognac",
    hex: "#9A463D",
    reason: "Verfijnde bruintinten voor premium looks",
    category: "base",
    occasions: ["work", "evening"],
  },
];

const COOL_PALETTE: ColorRecommendation[] = [
  {
    color: "Navy",
    hex: "#000080",
    reason: "Klassieke basis die cooler is dan zwart",
    category: "base",
    occasions: ["work", "formal", "smart-casual"],
  },
  {
    color: "Charcoal",
    hex: "#36454F",
    reason: "Verfijnde neutral met koele ondertoon",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Ice Blue",
    hex: "#D6F1FF",
    reason: "Fris accent dat je huid laat oplichten",
    category: "accent",
    occasions: ["spring", "summer"],
  },
  {
    color: "Silver Grey",
    hex: "#C0C0C0",
    reason: "Moderne neutral die luxe uitstraalt",
    category: "neutral",
    occasions: ["evening", "formal"],
  },
  {
    color: "Burgundy",
    hex: "#800020",
    reason: "Rijk accent met koele ondertoon voor diepte",
    category: "accent",
    occasions: ["autumn", "winter", "evening"],
  },
  {
    color: "Emerald",
    hex: "#50C878",
    reason: "Statement kleur die helderheid toevoegt",
    category: "accent",
    occasions: ["special", "evening"],
  },
  {
    color: "Cool Grey",
    hex: "#8C92AC",
    reason: "Koele neutral die modern en clean is",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Slate",
    hex: "#708090",
    reason: "Zachte basis met blue undertone",
    category: "base",
    occasions: ["work", "casual"],
  },
];

const NEUTRAL_PALETTE: ColorRecommendation[] = [
  {
    color: "Black",
    hex: "#000000",
    reason: "Universele basis die altijd werkt",
    category: "base",
    occasions: ["all"],
  },
  {
    color: "White",
    hex: "#FFFFFF",
    reason: "Frisse neutral voor elke outfit",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Grey",
    hex: "#808080",
    reason: "Veelzijdige neutral zonder dominante ondertoon",
    category: "neutral",
    occasions: ["all"],
  },
  {
    color: "Navy",
    hex: "#000080",
    reason: "Zachter alternatief voor zwart",
    category: "base",
    occasions: ["work", "formal"],
  },
  {
    color: "Camel",
    hex: "#C19A6B",
    reason: "Warme accent die flexibel is",
    category: "accent",
    occasions: ["casual", "smart-casual"],
  },
  {
    color: "Burgundy",
    hex: "#800020",
    reason: "Diep accent voor variatie",
    category: "accent",
    occasions: ["autumn", "winter"],
  },
  {
    color: "Olive",
    hex: "#708238",
    reason: "Natuurlijke toon die overal bij past",
    category: "base",
    occasions: ["casual"],
  },
  {
    color: "Charcoal",
    hex: "#36454F",
    reason: "Moderne neutral tussen zwart en grijs",
    category: "neutral",
    occasions: ["all"],
  },
];

export function getColorAdvice(
  undertone: "warm" | "cool" | "neutral",
  archetype: string
): ColorAdvice {
  let palette: ColorRecommendation[];
  let avoid: string[];
  let seasonal: string;

  switch (undertone) {
    case "warm":
      palette = [...WARM_PALETTE];
      avoid = [
        "Koel blauw (ijzig)",
        "Pure wit (te hard contrast)",
        "Fuchsia/magenta",
        "Neon kleuren",
        "Zilvergrijs",
      ];
      seasonal = "Autumn/Spring";
      break;

    case "cool":
      palette = [...COOL_PALETTE];
      avoid = [
        "Oranje/terracotta",
        "Geel-goud",
        "Warm bruin",
        "Peach/zalm",
        "Koper/brons tonen",
      ];
      seasonal = "Winter/Summer";
      break;

    default:
      palette = [...NEUTRAL_PALETTE];
      avoid = [
        "Extreme neons zonder balans",
        "Te felle kleuren in grote vlakken",
      ];
      seasonal = "Universal (all seasons)";
  }

  palette = adjustPaletteForArchetype(palette, archetype);

  const explanation = buildColorExplanation(undertone, archetype, palette);
  const complementaryPairs = buildComplementaryPairs(palette, undertone);

  return {
    undertone,
    bestColors: palette,
    avoidColors: avoid,
    seasonalPalette: seasonal,
    complementaryPairs,
    explanation,
    archetype,
  };
}

function adjustPaletteForArchetype(
  palette: ColorRecommendation[],
  archetype: string
): ColorRecommendation[] {
  const lower = archetype.toLowerCase();

  if (lower.includes("klassiek") || lower.includes("classic")) {
    return palette.filter(
      (c) =>
        c.category === "base" ||
        c.category === "neutral" ||
        ["Burgundy", "Navy", "Charcoal"].includes(c.color)
    );
  }

  if (lower.includes("minimal")) {
    return palette.filter(
      (c) =>
        c.category === "neutral" ||
        c.category === "base" ||
        ["Black", "White", "Grey", "Navy", "Charcoal"].includes(c.color)
    );
  }

  if (lower.includes("casual")) {
    return palette.sort((a, b) => {
      if (a.category === "accent" && b.category !== "accent") return -1;
      if (b.category === "accent" && a.category !== "accent") return 1;
      return 0;
    });
  }

  return palette;
}

function buildComplementaryPairs(
  palette: ColorRecommendation[],
  undertone: string
): [string, string][] {
  const pairs: [string, string][] = [];
  const colors = palette.map((c) => c.color);

  if (undertone === "warm") {
    if (colors.includes("Camel") && colors.includes("Olive"))
      pairs.push(["Camel", "Olive"]);
    if (colors.includes("Terracotta") && colors.includes("Cream"))
      pairs.push(["Terracotta", "Cream"]);
    if (colors.includes("Rust") && colors.includes("Warm Grey"))
      pairs.push(["Rust", "Warm Grey"]);
    if (colors.includes("Cognac") && colors.includes("Cream"))
      pairs.push(["Cognac", "Cream"]);
  } else if (undertone === "cool") {
    if (colors.includes("Navy") && colors.includes("Ice Blue"))
      pairs.push(["Navy", "Ice Blue"]);
    if (colors.includes("Charcoal") && colors.includes("Silver Grey"))
      pairs.push(["Charcoal", "Silver Grey"]);
    if (colors.includes("Burgundy") && colors.includes("Emerald"))
      pairs.push(["Burgundy", "Emerald"]);
    if (colors.includes("Slate") && colors.includes("Cool Grey"))
      pairs.push(["Slate", "Cool Grey"]);
  } else {
    if (colors.includes("Black") && colors.includes("White"))
      pairs.push(["Black", "White"]);
    if (colors.includes("Navy") && colors.includes("Camel"))
      pairs.push(["Navy", "Camel"]);
    if (colors.includes("Charcoal") && colors.includes("Grey"))
      pairs.push(["Charcoal", "Grey"]);
    if (colors.includes("Olive") && colors.includes("Burgundy"))
      pairs.push(["Olive", "Burgundy"]);
  }

  return pairs;
}

function buildColorExplanation(
  undertone: string,
  archetype: string,
  palette: ColorRecommendation[]
): string {
  const baseColors = palette
    .filter((c) => c.category === "base")
    .map((c) => c.color)
    .slice(0, 3);
  const neutralColors = palette
    .filter((c) => c.category === "neutral")
    .map((c) => c.color)
    .slice(0, 2);
  const accentColors = palette
    .filter((c) => c.category === "accent")
    .map((c) => c.color)
    .slice(0, 3);

  let explanation = `Met jouw **${undertone} undertone** en **${archetype}** stijl werk je het beste met:\n\n`;

  if (baseColors.length > 0) {
    explanation += `**Basis kleuren:** ${baseColors.join(", ")}\n`;
    explanation += `Deze vormen de foundation van je garderobe — tijdloos en veelzijdig.\n\n`;
  }

  if (neutralColors.length > 0) {
    explanation += `**Neutrals:** ${neutralColors.join(", ")}\n`;
    explanation += `Gebruik deze voor laagopbouw en om outfits te balanceren.\n\n`;
  }

  if (accentColors.length > 0) {
    explanation += `**Accent kleuren:** ${accentColors.join(", ")}\n`;
    explanation += `Voor statement pieces en om diepte toe te voegen.\n\n`;
  }

  explanation += `**Pro tip:** Start met 60% basis, 30% neutrals, 10% accents voor een gebalanceerde garderobe.`;

  return explanation;
}

export function getColorByName(
  colorName: string,
  undertone: "warm" | "cool" | "neutral"
): ColorRecommendation | null {
  const allPalettes = [...WARM_PALETTE, ...COOL_PALETTE, ...NEUTRAL_PALETTE];
  return (
    allPalettes.find(
      (c) => c.color.toLowerCase() === colorName.toLowerCase()
    ) || null
  );
}

export function analyzeColorCompatibility(
  color1: string,
  color2: string,
  undertone: string
): { compatible: boolean; reason: string } {
  const advice = getColorAdvice(undertone as any, "casual_chic");
  const pairs = advice.complementaryPairs;

  const isComplementary = pairs.some(
    ([c1, c2]) =>
      (c1.toLowerCase() === color1.toLowerCase() &&
        c2.toLowerCase() === color2.toLowerCase()) ||
      (c2.toLowerCase() === color1.toLowerCase() &&
        c1.toLowerCase() === color2.toLowerCase())
  );

  if (isComplementary) {
    return {
      compatible: true,
      reason: `${color1} en ${color2} zijn een krachtige combinatie voor jouw ${undertone} undertone.`,
    };
  }

  const colors = advice.bestColors.map((c) => c.color.toLowerCase());
  const both = colors.includes(color1.toLowerCase()) && colors.includes(color2.toLowerCase());

  if (both) {
    return {
      compatible: true,
      reason: `Beide kleuren passen goed bij je ${undertone} undertone.`,
    };
  }

  const avoid = advice.avoidColors.some(
    (a) =>
      a.toLowerCase().includes(color1.toLowerCase()) ||
      a.toLowerCase().includes(color2.toLowerCase())
  );

  if (avoid) {
    return {
      compatible: false,
      reason: `Een van deze kleuren werkt niet optimaal met jouw ${undertone} undertone.`,
    };
  }

  return {
    compatible: true,
    reason: "Deze combinatie kan werken, maar check of de tinten harmoniëren.",
  };
}
