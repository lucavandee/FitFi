type Undertone = "warm" | "cool" | "neutral";

interface ColorPalette {
  undertone: Undertone;
  baseColors: string[];
  neutralColors: string[];
  accentColors: string[];
  avoid: string[];
  complementaryPairs: [string, string][];
}

const WARM_PALETTE: ColorPalette = {
  undertone: "warm",
  baseColors: ["Camel", "Olive", "Cognac", "Rust"],
  neutralColors: ["Cream", "Warm Grey"],
  accentColors: ["Terracotta", "Mustard"],
  avoid: ["Koel blauw (ijzig)", "Pure wit", "Fuchsia", "Zilvergrijs"],
  complementaryPairs: [
    ["Camel", "Olive"],
    ["Terracotta", "Cream"],
    ["Rust", "Warm Grey"],
  ],
};

const COOL_PALETTE: ColorPalette = {
  undertone: "cool",
  baseColors: ["Navy", "Charcoal", "Slate"],
  neutralColors: ["Silver Grey", "Cool Grey"],
  accentColors: ["Ice Blue", "Burgundy", "Emerald"],
  avoid: ["Oranje/terracotta", "Geel-goud", "Warm bruin", "Peach"],
  complementaryPairs: [
    ["Navy", "Ice Blue"],
    ["Charcoal", "Silver Grey"],
    ["Burgundy", "Emerald"],
  ],
};

const NEUTRAL_PALETTE: ColorPalette = {
  undertone: "neutral",
  baseColors: ["Black", "Navy", "Charcoal"],
  neutralColors: ["White", "Grey"],
  accentColors: ["Camel", "Burgundy", "Olive"],
  avoid: ["Extreme neons", "Te felle kleuren"],
  complementaryPairs: [
    ["Black", "White"],
    ["Navy", "Camel"],
    ["Charcoal", "Grey"],
  ],
};

export function generateColorAdvice(
  undertone: Undertone,
  archetype: string,
  userMessage: string
): string {
  let palette: ColorPalette;

  switch (undertone) {
    case "warm":
      palette = WARM_PALETTE;
      break;
    case "cool":
      palette = COOL_PALETTE;
      break;
    default:
      palette = NEUTRAL_PALETTE;
  }

  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("combinatie") || lowerMsg.includes("samen")) {
    return buildCombinationAdvice(palette, archetype);
  }

  if (lowerMsg.includes("vermijd") || lowerMsg.includes("niet")) {
    return buildAvoidAdvice(palette, archetype);
  }

  return buildGeneralAdvice(palette, archetype);
}

function buildGeneralAdvice(palette: ColorPalette, archetype: string): string {
  let advice = `Met jouw **${palette.undertone} undertone** en **${archetype}** stijl werk je het beste met:\n\n`;

  advice += `**Basis kleuren:** ${palette.baseColors.slice(0, 3).join(", ")}\n`;
  advice += `Deze vormen de foundation van je garderobe — tijdloos en veelzijdig.\n\n`;

  advice += `**Neutrals:** ${palette.neutralColors.join(", ")}\n`;
  advice += `Voor laagopbouw en balans.\n\n`;

  advice += `**Accent kleuren:** ${palette.accentColors.slice(0, 3).join(", ")}\n`;
  advice += `Voor statement pieces en diepte.\n\n`;

  if (palette.complementaryPairs.length > 0) {
    advice += `**Krachtige combinaties:**\n`;
    palette.complementaryPairs.forEach(([c1, c2]) => {
      advice += `• ${c1} × ${c2}\n`;
    });
    advice += `\n`;
  }

  advice += `**Pro tip:** Start met 60% basis, 30% neutrals, 10% accents voor een gebalanceerde garderobe.`;

  return advice;
}

function buildCombinationAdvice(palette: ColorPalette, archetype: string): string {
  let advice = `## Kleurencombinaties voor jouw ${palette.undertone} undertone\n\n`;

  advice += `Deze paren werken fantastisch samen:\n\n`;
  palette.complementaryPairs.forEach(([c1, c2]) => {
    advice += `**${c1} × ${c2}**\n`;
    advice += `Harmonieuze balans tussen warmte en neutraliteit.\n\n`;
  });

  advice += `**Pro tip:** Combineer 1 basis + 1 accent + 1 neutral voor gebalanceerde outfits.`;

  return advice;
}

function buildAvoidAdvice(palette: ColorPalette, archetype: string): string {
  let advice = `## Kleuren om te vermijden\n\n`;
  advice += `Met jouw ${palette.undertone} undertone werken deze minder goed:\n\n`;

  palette.avoid.forEach((color) => {
    advice += `• ${color}\n`;
  });

  advice += `\n**Waarom?** Ze kunnen je huid dof doen lijken of onnatuurlijk contrast creëren.\n\n`;
  advice += `**Focus in plaats daarvan op:** ${palette.baseColors.slice(0, 3).join(", ")}`;

  return advice;
}

export function detectColorIntent(message: string): boolean {
  const colorKeywords = [
    "kleur",
    "palet",
    "undertone",
    "combinatie",
    "match",
    "tinten",
    "vermijd",
    "color",
    "palette",
  ];

  const lower = message.toLowerCase();
  return colorKeywords.some((kw) => lower.includes(kw));
}
