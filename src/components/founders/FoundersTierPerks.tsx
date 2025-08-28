import React from "react";
import {
  Sparkles,
  Shield,
  Users,
  Star,
  Crown,
  Wand2,
  Ticket,
  Gift,
  Headphones,
  Video,
  Trophy,
  CheckCircle,
  Lock,
  Award,
} from "lucide-react";
import { allPerksSorted } from "@/config/foundersTiers";

const ICONS = {
  Sparkles,
  Shield,
  Users,
  Star,
  Crown,
  Wand2,
  Ticket,
  Gift,
  Headphones,
  Video,
  Trophy,
  CheckCircle,
  Lock,
  Award,
} as const;

function getIcon(name?: string) {
  const key = (name || "") as keyof typeof ICONS;
  return ICONS[key] ?? Sparkles;
}

type Props = { referrals: number; className?: string };

export default function FoundersTierPerks({ referrals, className }: Props) {
  const perks = allPerksSorted();
  const items = perks.map((p) => ({ ...p, unlocked: referrals >= p.unlockedAt }));

  return (
    <div className={className ?? ""}>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((p) => {
          const Icon = getIcon(p.icon);
          return (
            <li key={p.id} className="flex items-start gap-3">
              <Icon size={20} className={p.unlocked ? "text-green-600" : "text-gray-400"} />
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}