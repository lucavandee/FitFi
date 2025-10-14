import { getColorAdvice, analyzeColorCompatibility, type ColorAdvice } from "./colorTheory";
import type { NovaUserContext } from "./userContext";

export interface ColorAdviceResponse {
  type: "color_advice";
  advice: ColorAdvice;
  markdown: string;
  suggestions: string[];
}

export function handleColorAdviceRequest(
  userContext: NovaUserContext,
  userMessage: string
): ColorAdviceResponse {
  const { colorProfile, archetype } = userContext;
  const advice = getColorAdvice(colorProfile.undertone, archetype);

  const lowerMsg = userMessage.toLowerCase();
  let markdown = "";
  const suggestions: string[] = [];

  if (
    lowerMsg.includes("combinatie") ||
    lowerMsg.includes("samen") ||
    lowerMsg.includes("match")
  ) {
    markdown = buildColorCombinationAdvice(advice);
    suggestions.push(
      "Toon me outfits met deze kleuren",
      "Welke accessoires passen hierbij?"
    );
  } else if (
    lowerMsg.includes("vermijd") ||
    lowerMsg.includes("niet") ||
    lowerMsg.includes("avoid")
  ) {
    markdown = buildAvoidColorsAdvice(advice);
    suggestions.push(
      "Waarom passen deze kleuren niet?",
      "Toon me wel geschikte kleuren"
    );
  } else if (
    lowerMsg.includes("seizoen") ||
    lowerMsg.includes("winter") ||
    lowerMsg.includes("zomer") ||
    lowerMsg.includes("season")
  ) {
    markdown = buildSeasonalAdvice(advice);
    suggestions.push(
      "Toon voorbeeldoutfits",
      "Welke materialen passen hierbij?"
    );
  } else {
    markdown = buildGeneralColorAdvice(advice);
    suggestions.push(
      "Toon kleuren combinaties",
      "Welke kleuren moet ik vermijden?",
      "Stel een outfit samen met deze kleuren"
    );
  }

  return {
    type: "color_advice",
    advice,
    markdown,
    suggestions,
  };
}

function buildGeneralColorAdvice(advice: ColorAdvice): string {
  let md = `## 🎨 Jouw Kleurenpalet\n\n`;
  md += advice.explanation + "\n\n";

  md += `### Jouw perfecte kleuren\n\n`;
  advice.bestColors.slice(0, 6).forEach((color) => {
    md += `**${color.color}** — ${color.reason}\n\n`;
  });

  if (advice.avoidColors.length > 0) {
    md += `### ⚠️ Vermijd deze tinten\n\n`;
    advice.avoidColors.forEach((color) => {
      md += `• ${color}\n`;
    });
    md += "\n";
  }

  if (advice.complementaryPairs.length > 0) {
    md += `### ✨ Krachtige combinaties\n\n`;
    advice.complementaryPairs.forEach(([c1, c2]) => {
      md += `• **${c1}** × **${c2}**\n`;
    });
  }

  return md;
}

function buildColorCombinationAdvice(advice: ColorAdvice): string {
  let md = `## ✨ Kleurencombinaties voor jouw ${advice.undertone} undertone\n\n`;

  if (advice.complementaryPairs.length > 0) {
    md += `Deze paren werken fantastisch samen:\n\n`;
    advice.complementaryPairs.forEach(([c1, c2]) => {
      const color1 = advice.bestColors.find((c) => c.color === c1);
      const color2 = advice.bestColors.find((c) => c.color === c2);

      md += `### ${c1} × ${c2}\n`;
      if (color1) md += `${color1.reason}\n`;
      if (color2) md += `${color2.reason}\n\n`;
    });
  }

  md += `**Pro tip:** Combineer 1 basis kleur + 1 accent + 1 neutral voor gebalanceerde outfits.\n`;

  return md;
}

function buildAvoidColorsAdvice(advice: ColorAdvice): string {
  let md = `## ⚠️ Kleuren om te vermijden\n\n`;
  md += `Met jouw ${advice.undertone} undertone werken deze tinten minder goed:\n\n`;

  advice.avoidColors.forEach((color) => {
    md += `• **${color}**\n`;
  });

  md += `\n**Waarom?** Deze kleuren kunnen je huid dof doen lijken of onnatuurlijk contrast creëren.\n\n`;
  md += `**Focus in plaats daarvan op:**\n`;
  advice.bestColors
    .filter((c) => c.category === "base")
    .slice(0, 3)
    .forEach((c) => {
      md += `• ${c.color}\n`;
    });

  return md;
}

function buildSeasonalAdvice(advice: ColorAdvice): string {
  let md = `## 🍂 Seizoensadvies\n\n`;
  md += `Jouw ${advice.undertone} undertone past bij: **${advice.seasonalPalette}**\n\n`;

  if (advice.undertone === "warm") {
    md += `### Herfst/Winter\n`;
    md += `Kies rijke, diepe tinten:\n`;
    const autumn = advice.bestColors.filter((c) =>
      ["Rust", "Cognac", "Olive", "Terracotta"].includes(c.color)
    );
    autumn.forEach((c) => md += `• ${c.color}\n`);

    md += `\n### Lente/Zomer\n`;
    md += `Ga voor lichtere, frisse varianten:\n`;
    const spring = advice.bestColors.filter((c) =>
      ["Cream", "Camel", "Warm Grey"].includes(c.color)
    );
    spring.forEach((c) => md += `• ${c.color}\n`);
  } else if (advice.undertone === "cool") {
    md += `### Winter\n`;
    md += `Scherpe contrasten en diepe tinten:\n`;
    const winter = advice.bestColors.filter((c) =>
      ["Navy", "Burgundy", "Charcoal", "Emerald"].includes(c.color)
    );
    winter.forEach((c) => md += `• ${c.color}\n`);

    md += `\n### Zomer\n`;
    md += `Zachte, gedempt kleuren:\n`;
    const summer = advice.bestColors.filter((c) =>
      ["Ice Blue", "Silver Grey", "Cool Grey"].includes(c.color)
    );
    summer.forEach((c) => md += `• ${c.color}\n`);
  } else {
    md += `Als neutral undertone heb je het voordeel dat je het hele jaar door kunt variëren!\n\n`;
    md += `**Basis voor alle seizoenen:**\n`;
    ["Black", "White", "Grey", "Navy"].forEach((c) => md += `• ${c}\n`);
    md += `\n**Seizoensaccenten:**\n`;
    md += `• Herfst/Winter: Burgundy, Charcoal\n`;
    md += `• Lente/Zomer: Camel, Olive\n`;
  }

  return md;
}

export function detectColorIntent(message: string): "color_advice" | "general" {
  const lower = message.toLowerCase();

  const colorKeywords = [
    "kleur",
    "palet",
    "undertone",
    "combinatie",
    "match",
    "tinten",
    "vermijd",
    "seizoen",
    "warm",
    "cool",
    "color",
    "palette",
  ];

  return colorKeywords.some((kw) => lower.includes(kw)) ? "color_advice" : "general";
}
