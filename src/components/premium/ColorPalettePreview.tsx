import React, { useState } from "react";
import { Palette, Sparkles, ChevronRight, TrendingUp } from "lucide-react";
import { COLOR_PALETTES, type ColorSwatch } from "@/data/colorPalettes";

export default function ColorPalettePreview() {
  const [selectedSeason, setSelectedSeason] = useState<'winter' | 'zomer' | 'herfst' | 'lente'>('herfst');

  const seasons = [
    { key: 'winter' as const, label: 'Winter', gradient: 'from-slate-700 to-blue-900' },
    { key: 'zomer' as const, label: 'Zomer', gradient: 'from-blue-200 to-purple-200' },
    { key: 'herfst' as const, label: 'Herfst', gradient: 'from-amber-700 to-orange-800' },
    { key: 'lente' as const, label: 'Lente', gradient: 'from-green-400 to-emerald-500' }
  ];

  const palette = COLOR_PALETTES[selectedSeason];

  const renderColorSwatches = (colors: ColorSwatch[], limit = 8) => {
    return colors.slice(0, limit).map((color, idx) => (
      <div
        key={idx}
        className="group relative"
      >
        <div
          className="w-12 h-12 rounded-full shadow-[var(--shadow-sm)] border-2 border-white transition-transform duration-200 group-hover:scale-110 group-hover:shadow-[var(--shadow-md)]"
          style={{ backgroundColor: color.hex }}
          aria-label={color.name}
        />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <span className="text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text)] px-2 py-1 rounded-md shadow-[var(--shadow-md)] border border-[var(--color-border)]">
            {color.name}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold">2025 Wearable Color Trends</h3>
        </div>
        <p className="text-white/90 text-sm">
          Premium members krijgen toegang tot professionele kleurenpalletten gebaseerd op de nieuwste trends
        </p>
      </div>

      {/* Season Selector */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex gap-2 flex-wrap">
          {seasons.map((season) => (
            <button
              key={season.key}
              onClick={() => setSelectedSeason(season.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSeason === season.key
                  ? 'bg-gradient-to-r ' + season.gradient + ' text-white shadow-[var(--shadow-md)]'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--ff-color-primary-700)] border border-[var(--color-border)]'
              }`}
            >
              {season.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Preview */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {palette.description}
          </p>
        </div>

        {/* Do Colors - Recommended */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-success-600)]" />
            <h4 className="text-sm font-semibold text-[var(--color-text)]">
              Aanbevolen kleuren
            </h4>
          </div>
          <div className="flex flex-wrap gap-3 mb-2">
            {renderColorSwatches(palette.doColors)}
          </div>
        </div>

        {/* Trend Highlights */}
        {selectedSeason === 'herfst' && (
          <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent rounded-[var(--radius-lg)] p-4 border border-[var(--ff-color-primary-200)] mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  Trending in 2025
                </h5>
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                  Herfst is HET seizoen voor quiet luxury. Camel, Cognac, Terracotta en Sage domineren de runways.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-[var(--ff-color-primary-700)] font-medium border border-[var(--ff-color-primary-200)]">
                    Quiet Luxury
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-[var(--ff-color-primary-700)] font-medium border border-[var(--ff-color-primary-200)]">
                    Earthy Tones
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSeason === 'zomer' && (
          <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent rounded-[var(--radius-lg)] p-4 border border-[var(--ff-color-primary-200)] mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  Soft Sophistication
                </h5>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Gedempte pastels en grijs-tinten blijven populair voor elegant minimalism.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[var(--color-bg)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                Ontdek jouw perfecte kleuren
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Krijg AI-analyse + persoonlijk kleurenpalet
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
