import React, { useMemo } from "react";
import { TrendingUp, Sparkles, Calendar, Crown, Star, ArrowUpRight } from "lucide-react";
import { COLOR_PALETTES } from "@/data/colorPalettes";

interface Props {
  userSeason?: 'winter' | 'zomer' | 'herfst' | 'lente';
  compact?: boolean;
}

interface TrendData {
  title: string;
  description: string;
  colors: { hex: string; name: string }[];
  tags: string[];
  popularity: number;
}

const TREND_INSIGHTS_2025: Record<string, TrendData> = {
  herfst: {
    title: "Quiet Luxury Dominates",
    description: "Aardse tinten en rijke neutrale kleuren zijn DE trend van 2025. Camel, Cognac en Terracotta zijn overal te zien op runways en in high-street fashion.",
    colors: [
      { hex: '#D4A373', name: 'Camel' },
      { hex: '#A0785A', name: 'Cognac' },
      { hex: '#C17767', name: 'Terracotta' },
      { hex: '#6B8E23', name: 'Olijfgroen' }
    ],
    tags: ['Quiet Luxury', 'Earthy', 'Timeless'],
    popularity: 98
  },
  winter: {
    title: "Bold Sophistication",
    description: "Diepe, rijke kleuren met hoog contrast. Bourgogne, Smaragdgroen en Navy zijn de nieuwe zwart voor sophisticated looks.",
    colors: [
      { hex: '#6A1B4D', name: 'Bourgogne' },
      { hex: '#1E8449', name: 'Smaragdgroen' },
      { hex: '#1C2833', name: 'Navy' },
      { hex: '#0E6655', name: 'Petrol' }
    ],
    tags: ['Bold', 'Sophisticated', 'High Contrast'],
    popularity: 92
  },
  zomer: {
    title: "Soft Minimalism",
    description: "Gedempte pastels en grijs-tinten blijven populair. Eucalyptus, Soft Blauw en Pearl Grey creëren elegante, verfijnde looks.",
    colors: [
      { hex: '#7B8A8B', name: 'Eucalyptus' },
      { hex: '#85C1E2', name: 'Soft blauw' },
      { hex: '#D5D8DC', name: 'Pearl grey' },
      { hex: '#A3B1C1', name: 'Zachte lavendel' }
    ],
    tags: ['Minimalist', 'Soft', 'Elegant'],
    popularity: 85
  },
  lente: {
    title: "Fresh & Approachable",
    description: "Warme, toegankelijke kleuren met natuurlijke uitstraling. Sage, Terracotta en Soft Gold geven een fresh, moderne look.",
    colors: [
      { hex: '#5F7A61', name: 'Sage groen' },
      { hex: '#E08E79', name: 'Warm terracotta' },
      { hex: '#C4A77D', name: 'Soft gold' },
      { hex: '#E5B299', name: 'Peach' }
    ],
    tags: ['Natural', 'Fresh', 'Approachable'],
    popularity: 88
  }
};

const UNIVERSAL_TRENDS_2025 = [
  {
    title: "Dopamine Minimalism",
    description: "Vrolijke kleuren in minimalistische silhouetten. Niet te fel, maar wel genoeg kleur om je humeur te boosten.",
    icon: Sparkles,
    impact: "high"
  },
  {
    title: "Sustainable Neutrals",
    description: "Natuurlijke, tijdloze kleuren die jaren meegaan. Denk aan Greige, Taupe en Warm Beige.",
    icon: Star,
    impact: "medium"
  },
  {
    title: "Neo-Classic Palette",
    description: "Terugkeer naar klassieke kleurencombinaties met een moderne twist. Navy + Camel, Zwart + Beige.",
    icon: Crown,
    impact: "high"
  }
];

export default function TrendInsights({ userSeason = 'herfst', compact = false }: Props) {
  const seasonTrend = useMemo(() => TREND_INSIGHTS_2025[userSeason], [userSeason]);

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--ff-color-primary-50)] rounded-[var(--radius-lg)] p-5 border border-[var(--ff-color-primary-200)] shadow-[var(--shadow-md)]">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                {seasonTrend.title}
              </h3>
              <Crown className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {seasonTrend.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {seasonTrend.colors.slice(0, 4).map((color, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full shadow-[var(--shadow-sm)] border-2 border-white"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {seasonTrend.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded-full bg-white text-[var(--ff-color-primary-700)] font-medium border border-[var(--ff-color-primary-200)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Season Trend */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{seasonTrend.title}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  {seasonTrend.popularity}% trending
                </span>
              </div>
              <p className="text-white/80 text-sm">Voor jouw {userSeason} seizoen</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[var(--color-text-secondary)] mb-6">
            {seasonTrend.description}
          </p>

          {/* Trending Colors */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              Key Colors voor 2025
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {seasonTrend.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-colors"
                >
                  <div
                    className="w-16 h-16 rounded-full shadow-[var(--shadow-md)] border-2 border-white"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs font-medium text-[var(--color-text)] text-center">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {seasonTrend.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-100)] to-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-800)] font-medium border border-[var(--ff-color-primary-200)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Shopping Tip */}
          <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent rounded-[var(--radius-md)] p-4 border border-[var(--ff-color-primary-200)]">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  Shopping Tip
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Deze kleuren zijn nu overal beschikbaar. Zoek naar deze kleurnamen bij je favoriete merken voor instant-trendy looks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Trends */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Universele 2025 Trends
          </h2>
        </div>

        <div className="space-y-4">
          {UNIVERSAL_TRENDS_2025.map((trend, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <trend.icon className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {trend.title}
                  </h3>
                  {trend.impact === 'high' && (
                    <ArrowUpRight className="w-3 h-3 text-[var(--ff-color-success-600)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {trend.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <Crown className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
        <span>Premium trend insights • Updated voor 2025</span>
      </div>
    </div>
  );
}
