import React from "react";
import { Award, Crown, Star, Rocket, Shield, Gift } from "lucide-react";

const ICONS = {
  award: Award,
  crown: Crown,
  star: Star,
  rocket: Rocket,
  shield: Shield,
  gift: Gift,
} as const;

type IconKey = keyof typeof ICONS;

type PerkProps = {
  icon?: string;             // "Award" | "award" | etc.
  title: string;
  description?: string;
  className?: string;
};

export default function FoundersTierPerks({
  icon = "award",
  title,
  description,
  className = "",
}: PerkProps) {
  // normaliseer naar lowercase
  const key = (icon || "award").toLowerCase() as IconKey;
  const Icon = ICONS[key] ?? Award;

  if (ICONS[key] === undefined) {
    // eslint-disable-next-line no-console
    console.warn("[FoundersTierPerks] Unknown icon:", icon, "— using Award");
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="mt-1 inline-flex rounded-xl p-2 border">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div>
        <div className="font-semibold">{title}</div>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
    </div>
  );
}