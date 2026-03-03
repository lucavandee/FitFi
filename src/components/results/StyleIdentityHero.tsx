import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
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

export function StyleIdentityHero({
  primaryArchetype,
  colorProfile,
  quizAnswers = {},
  swipeInsights,
}: StyleIdentityHeroProps) {
  const archetype = ARCHETYPES[primaryArchetype];

  const getPersonalizedDescription = (): string => {
    const descriptions: Record<ArchetypeKey, string> = {
      MINIMALIST: "Moderne, tijdloze outfits met clean lines en subtiele elegantie voor elke gelegenheid.",
      CLASSIC: "Verfijnde, tijdloze looks met aandacht voor detail en kwaliteit — altijd verzorgd, nooit overdreven.",
      SMART_CASUAL: "Moeiteloos gepolijste stijl die comfort combineert met een verzorgde uitstraling.",
      STREETWEAR: "Expressieve, urban looks met een sportieve edge en eye-catching details.",
      ATHLETIC: "Functionele, comfortabele outfits met een sportieve uitstraling en moderne silhouetten.",
      AVANT_GARDE: "Experimentele, statement-makende looks die conventie uitdagen en opvallen."
    };
    return descriptions[primaryArchetype];
  };

  const getInsights = (): string[] => {
    const insights: string[] = [];

    if (quizAnswers.neutrals) {
      const map: Record<string, string> = {
        warm: 'Warme tinten — beige, camel en terracotta als basis',
        koel: 'Koele tinten — grijs, navy en steenkleur als basis',
        neutraal: 'Neutrale mix — zwart, wit en grijs als basis',
      };
      if (map[quizAnswers.neutrals]) insights.push(map[quizAnswers.neutrals]);
    }
    if (quizAnswers.contrast) {
      const map: Record<string, string> = {
        laag: 'Tonal outfits — alles in dezelfde tintfamilie',
        medium: 'Rustig contrast — niet tonal, niet te scherp',
        hoog: 'Sterk contrast — lichte en donkere stukken',
      };
      if (map[quizAnswers.contrast]) insights.push(map[quizAnswers.contrast]);
    }
    if (quizAnswers.fit) {
      const map: Record<string, string> = {
        slim: 'Nauwsluitende, getailleerde silhouetten',
        regular: 'Klassieke, comfortabele pasvorm',
        relaxed: 'Losser — comfortabele silhouetten',
        oversized: 'Oversized — moderne, ruime proporties',
      };
      if (map[quizAnswers.fit]) insights.push(map[quizAnswers.fit]);
    }
    if (Array.isArray(quizAnswers.goals) && quizAnswers.goals.length > 0) {
      const goalLabels: Record<string, string> = {
        timeless: 'tijdloze stukken',
        trendy: 'trendy items',
        minimal: 'minimale looks',
        express: 'zelfexpressie',
        professional: 'professionele uitstraling',
        comfort: 'comfort boven alles',
      };
      const labels = quizAnswers.goals.slice(0, 2).map((g: string) => goalLabels[g] ?? g);
      insights.push(`Stijldoelen: ${labels.join(' en ')}`);
    }
    if (quizAnswers.prints) {
      const map: Record<string, string> = {
        effen: 'Clean, zonder prints',
        subtiel: 'Subtiele prints — strepen of kleine motieven',
        statement: 'Opvallende prints welkom',
        gemengd: 'Mix van prints en effen',
      };
      if (map[quizAnswers.prints]) insights.push(map[quizAnswers.prints]);
    }
    if (swipeInsights?.favoriteCategories && swipeInsights.favoriteCategories.length > 0) {
      const cats = swipeInsights.favoriteCategories.slice(0, 2).join(' & ');
      insights.push(`Op basis van swipes: voorkeur voor ${cats}`);
    }
    return insights.slice(0, 4);
  };

  const getSeasonSuffix = (): string => {
    const suffixes: Record<string, string> = {
      winter: 'Cool',
      zomer: 'Soft',
      herfst: 'Warm',
      lente: 'Bright',
    };
    return suffixes[colorProfile.season?.toLowerCase() ?? ''] || '';
  };

  const styleName = getSeasonSuffix()
    ? `${archetype.label} ${getSeasonSuffix()}`
    : archetype.label;

  const insights = getInsights();
  const description = getPersonalizedDescription();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl bg-[var(--color-surface)] overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 4px 20px rgba(30,35,51,0.07)' }}
    >
      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)]" />

      <div className="p-6 sm:p-8">
        {/* Kicker */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--ff-color-primary-500)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)]">
            Jouw stijl-identiteit
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight leading-none mb-3">
          {styleName}
        </h2>
        <p className="text-base text-[var(--color-muted)] leading-relaxed mb-6 max-w-xl">
          {description}
        </p>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.07, duration: 0.35 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--ff-color-primary-25)] border border-[var(--ff-color-primary-100)]"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[var(--ff-color-primary-600)]" />
                </div>
                <p className="text-sm text-[var(--color-text)] leading-snug">{insight}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Signature items */}
        {archetype.staples && archetype.staples.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-2.5">
              Jouw signature items
            </p>
            <div className="flex flex-wrap gap-2">
              {archetype.staples.slice(0, 5).map((staple, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="px-3 py-1.5 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] text-[var(--ff-color-primary-700)] text-sm font-medium rounded-full capitalize"
                >
                  {staple}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
