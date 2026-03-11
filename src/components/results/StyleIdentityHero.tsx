import { motion } from 'framer-motion';
import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';
import type { ColorProfile } from '@/lib/quiz/types';

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
  const suffix = SEASON_SUFFIX[colorProfile.season?.toLowerCase() ?? ''] ?? '';
  const styleName = suffix ? `${archetype.label} · ${suffix}` : archetype.label;
  const description = DESCRIPTIONS[primaryArchetype];
  const insights = buildInsights(quizAnswers, swipeInsights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)] mb-2">
          Jouw stijlprofiel
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-tight leading-tight mb-2">
          {styleName}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-lg">
          {description}
        </p>
      </div>

      {archetype.staples && archetype.staples.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {archetype.staples.slice(0, 6).map((staple, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + idx * 0.04 }}
              className="px-2.5 py-1 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] text-[var(--ff-color-primary-700)] text-xs font-medium rounded-full capitalize"
            >
              {staple}
            </motion.span>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Op basis van jouw quiz
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-[var(--ff-color-primary-400)] mt-[7px] shrink-0" aria-hidden="true" />
                <span className="text-sm text-[var(--color-muted)] leading-snug">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
