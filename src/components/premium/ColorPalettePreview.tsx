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
          className="w-12 h-12 rounded-full shadow-sm border-2 border-white transition-transform duration-200 group-hover:scale-110 group-hover:shadow-sm"
          style={{ backgroundColor: color.hex }}
          aria-label={color.name}
        />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <span className="text-xs font-medium bg-[#FFFFFF] text-[#1A1A1A] px-2 py-1 rounded-md shadow-sm border border-[#E5E5E5]">
            {color.name}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A8513A] to-[#C2654A] p-6 text-white">
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
      <div className="p-6 border-b border-[#E5E5E5]">
        <div className="flex gap-2 flex-wrap">
          {seasons.map((season) => (
            <button
              key={season.key}
              onClick={() => setSelectedSeason(season.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSeason === season.key
                  ? 'bg-gradient-to-r ' + season.gradient + ' text-white shadow-sm'
                  : 'bg-[#FAFAF8] text-[#8A8A8A] hover:bg-[#FAF5F2] hover:text-[#A8513A] border border-[#E5E5E5]'
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
          <p className="text-sm text-[#8A8A8A] mb-4">
            {palette.description}
          </p>
        </div>

        {/* Do Colors - Recommended */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#3D8B5E]" />
            <h4 className="text-sm font-semibold text-[#1A1A1A]">
              Aanbevolen kleuren
            </h4>
          </div>
          <div className="flex flex-wrap gap-3 mb-2">
            {renderColorSwatches(palette.doColors)}
          </div>
        </div>

        {/* Trend Highlights */}
        {selectedSeason === 'herfst' && (
          <div className="bg-gradient-to-br from-[#FAF5F2] to-transparent rounded-2xl p-4 border border-[#F4E8E3] mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#C2654A] to-[#A8513A] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#1A1A1A] mb-1">
                  Trending in 2025
                </h5>
                <p className="text-xs text-[#8A8A8A] mb-2">
                  Herfst is HET seizoen voor quiet luxury. Camel, Cognac, Terracotta en Sage domineren de runways.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-[#A8513A] font-medium border border-[#F4E8E3]">
                    Quiet Luxury
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-[#A8513A] font-medium border border-[#F4E8E3]">
                    Earthy Tones
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSeason === 'zomer' && (
          <div className="bg-gradient-to-br from-[#FAF5F2] to-transparent rounded-2xl p-4 border border-[#F4E8E3] mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#C2654A] to-[#A8513A] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#1A1A1A] mb-1">
                  Soft Sophistication
                </h5>
                <p className="text-xs text-[#8A8A8A]">
                  Gedempte pastels en grijs-tinten blijven populair voor elegant minimalism.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                Ontdek jouw perfecte kleuren
              </p>
              <p className="text-xs text-[#8A8A8A]">
                Krijg AI-analyse + persoonlijk kleurenpalet
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#C2654A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
