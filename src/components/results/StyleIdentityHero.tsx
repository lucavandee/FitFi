import { motion } from 'framer-motion';
import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';
import type { ColorProfile } from '@/lib/quiz/types';
import { getArchetypeDisplayNL } from '@/utils/displayNames';
import { SUB_SEASON_PALETTES } from '@/data/colorPalettes';

interface StyleIdentityHeroProps {
  primaryArchetype: ArchetypeKey;
  colorProfile: ColorProfile;
  quizAnswers?: Record<string, any>;
  swipeInsights?: {
    favoriteCategories?: string[];
    preferredPatterns?: string[];
    preferredColors?: string[];
    styleNotes?: string[];
  };
}

const DESCRIPTIONS: Record<ArchetypeKey, string> = {
  MINIMALIST: 'Tijdloze outfits met clean lines en subtiele elegantie.',
  CLASSIC: 'Verfijnde looks met aandacht voor detail en kwaliteit.',
  SMART_CASUAL: 'Moeiteloos gepolijste stijl — comfort én verzorgd.',
  STREETWEAR: 'Expressieve urban looks met een sportieve edge.',
  ATHLETIC: 'Functionele outfits met een sportieve, moderne uitstraling.',
  AVANT_GARDE: 'Statement looks die conventie uitdagen.',
};

const SEASON_SUFFIX: Record<string, string> = {
  winter: 'Cool',
  zomer: 'Soft',
  herfst: 'Warm',
  lente: 'Bright',
};

const SUB_SEASON_DISPLAY: Record<string, string> = {
  'licht-lente': 'Licht Lente',
  'warm-lente': 'Warm Lente',
  'helder-lente': 'Helder Lente',
  'licht-zomer': 'Licht Zomer',
  'koel-zomer': 'Koel Zomer',
  'zacht-zomer': 'Zacht Zomer',
  'zacht-herfst': 'Zacht Herfst',
  'warm-herfst': 'Warm Herfst',
  'diep-herfst': 'Diep Herfst',
  'koel-winter': 'Koel Winter',
  'diep-winter': 'Diep Winter',
  'helder-winter': 'Helder Winter',
};

const INSIGHT_ICONS: Record<number, string> = {
  0: '◆',
  1: '◈',
  2: '◉',
  3: '◇',
};

function buildInsights(quizAnswers: Record<string, any>, swipeInsights?: StyleIdentityHeroProps['swipeInsights']): string[] {
  const out: string[] = [];

  const neutralMap: Record<string, string> = {
    warm: 'Warme basis — beige, camel en terracotta',
    koel: 'Koele basis — grijs, navy en steenkleur',
    neutraal: 'Neutrale basis — zwart, wit en grijs',
  };
  if (quizAnswers.neutrals && neutralMap[quizAnswers.neutrals]) out.push(neutralMap[quizAnswers.neutrals]);

  const fitMap: Record<string, string> = {
    slim: 'Getailleerde silhouetten',
    regular: 'Klassieke, comfortabele pasvorm',
    relaxed: 'Ruimere, comfortabele silhouetten',
    oversized: 'Oversized proporties',
  };
  if (quizAnswers.fit && fitMap[quizAnswers.fit]) out.push(fitMap[quizAnswers.fit]);

  if (Array.isArray(quizAnswers.goals) && quizAnswers.goals.length > 0) {
    const goalLabels: Record<string, string> = {
      timeless: 'tijdloze stukken', trendy: 'trendy items',
      minimal: 'minimale looks', express: 'zelfexpressie',
      professional: 'professionele uitstraling', comfort: 'comfort boven alles',
    };
    const labels = quizAnswers.goals.slice(0, 2).map((g: string) => goalLabels[g] ?? g);
    out.push(`Doelen: ${labels.join(' & ')}`);
  }

  if (swipeInsights?.favoriteCategories?.length) {
    out.push(`Voorkeur: ${swipeInsights.favoriteCategories.slice(0, 2).join(' & ')}`);
  }

  return out.slice(0, 4);
}

export function StyleIdentityHero({
  primaryArchetype,
  colorProfile,
  quizAnswers = {},
  swipeInsights,
}: StyleIdentityHeroProps) {
  const archetype = ARCHETYPES[primaryArchetype];
  const subSeasonLabel = colorProfile.subSeason ? SUB_SEASON_DISPLAY[colorProfile.subSeason] : null;
  const seasonLabel = subSeasonLabel || SEASON_SUFFIX[colorProfile.season?.toLowerCase() ?? ''] || '';
  const description = DESCRIPTIONS[primaryArchetype];
  const insights = buildInsights(quizAnswers, swipeInsights);

  // Get color swatches from sub-season palette
  const colorSwatches = (() => {
    if (colorProfile.subSeason && SUB_SEASON_PALETTES[colorProfile.subSeason]) {
      const palette = SUB_SEASON_PALETTES[colorProfile.subSeason];
      // Pick a mix: 2 basis + 2 accent colors
      const basis = palette.colors.filter((c: any) => c.category === 'basis').slice(0, 2);
      const accents = palette.colors.filter((c: any) => c.category === 'accent').slice(0, 2);
      return [...basis, ...accents];
    }
    return [];
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Hero identity block */}
      <div className="bg-[#F5F0EB] rounded-2xl px-7 py-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Text content — full width on mobile, left side on desktop */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#C2654A] mb-3">
              Jouw stijlprofiel
            </p>

            <h2
              className="text-[#1A1A1A] leading-[1.1] mb-1"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(36px, 6vw, 44px)",
                fontWeight: 400,
              }}
            >
              {getArchetypeDisplayNL(archetype.label)}
            </h2>
            {seasonLabel && (
              <p className="text-sm text-[#8A8A8A] font-medium mb-4">
                {seasonLabel}
              </p>
            )}

            <p className="text-base text-[#4A4A4A] leading-[1.75] max-w-lg mb-6">
              {description}
            </p>

            {archetype.staples && archetype.staples.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {archetype.staples.slice(0, 6).map((staple, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.25 }}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-medium text-[#4A4A4A] capitalize shadow-sm"
                  >
                    {staple}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Color swatches — compact palette preview */}
          {colorSwatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="shrink-0 hidden sm:block"
            >
              <div className="grid grid-cols-2 gap-1.5 w-[88px]">
                {colorSwatches.slice(0, 4).map((swatch, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-lg border border-white/60 shadow-sm"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  />
                ))}
              </div>
              <p className="text-[10px] text-[#8A8A8A] text-center mt-2 font-medium">
                Jouw kleuren
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Insights grid */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#8A8A8A] mb-4 px-1">
            Op basis van jouw quiz
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.07, duration: 0.3 }}
                className="bg-white border border-[#E5E5E5] rounded-xl px-5 py-4 flex items-start gap-3"
              >
                <span
                  className="text-[#C2654A] text-[10px] mt-0.5 flex-shrink-0 font-bold"
                  aria-hidden="true"
                >
                  {INSIGHT_ICONS[idx] ?? '◆'}
                </span>
                <span className="text-sm text-[#4A4A4A] leading-[1.65]">{insight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
