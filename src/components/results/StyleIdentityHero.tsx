import { motion } from 'framer-motion';
import { Sparkles, Heart, TrendingUp, Shirt, Palette } from 'lucide-react';
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

/**
 * StyleIdentityHero - Personal style identity presentation
 *
 * Purpose:
 * - Show primary archetype as user's style identity
 * - Personalized narrative: "Jouw stijl-DNA: Casual Comfort"
 * - Connect quiz choices with visual preference data
 * - Evidence-based insights from swipes
 * - Close the loop: "You told us X, we found Y"
 *
 * Psychology:
 * - Identity formation ("This is WHO you are")
 * - Validation ("We understand you")
 * - Evidence ("Based on your choices")
 * - Actionable ("Here's what this means")
 */
export function StyleIdentityHero({
  primaryArchetype,
  colorProfile,
  quizAnswers = {},
  swipeInsights = {}
}: StyleIdentityHeroProps) {
  const archetype = ARCHETYPES[primaryArchetype];

  // Generate personalized descriptions based on archetype
  const getPersonalizedDescription = (): string => {
    const descriptions: Record<ArchetypeKey, string> = {
      MINIMALIST: "Moderne, tijdloze outfits met clean lines en subtiele elegantie voor elke gelegenheid.",
      CLASSIC: "Verfijnde, tijdloze looks met aandacht voor detail en kwaliteit – altijd verzorgd, nooit overdreven.",
      SMART_CASUAL: "Moeiteloos gepolijste stijl die comfort combineert met een verzorgde uitstraling.",
      STREETWEAR: "Expressieve, urban looks met een sportieve edge en eye-catching details.",
      ATHLETIC: "Functionele, comfortabele outfits met een sportieve uitstraling en moderne silhouetten.",
      AVANT_GARDE: "Experimentele, statement-makende looks die conventie uitdagen en opvallen."
    };

    return descriptions[primaryArchetype];
  };

  const getSwipeInsights = (): string[] => {
    const insights: string[] = [];

    // Derive from real quiz answers first
    if (quizAnswers.neutrals) {
      const map: Record<string, string> = {
        warm: 'Je koos warme tinten — beige, camel en terracotta als basis',
        koel: 'Je koos koele tinten — grijs, navy en steenkleur als basis',
        neutraal: 'Je koos neutrale mix — zwart, wit en grijs als basis',
      };
      if (map[quizAnswers.neutrals]) insights.push(map[quizAnswers.neutrals]);
    }

    if (quizAnswers.contrast) {
      const map: Record<string, string> = {
        laag: 'Je gaf de voorkeur aan tonal outfits — alles in dezelfde tintfamilie',
        medium: 'Je houdt van rustig contrast — niet tonal, maar ook niet scherp',
        hoog: 'Je koos sterk contrast — lichte en donkere stukken combineren',
      };
      if (map[quizAnswers.contrast]) insights.push(map[quizAnswers.contrast]);
    }

    if (quizAnswers.fit) {
      const map: Record<string, string> = {
        slim: 'Je verkiest nauwsluitende, getailleerde silhouetten',
        regular: 'Je waardeert een klassieke, comfortabele pasvorm',
        relaxed: 'Je koos losser — comfortabele, relaxed silhouetten',
        oversized: 'Je koos oversized — moderne, ruime proporties',
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
        effen: 'Je gaf géén pastels of prints op — outfits blijven clean',
        subtiel: 'Je waardeert subtiele prints — strepen of kleine motieven',
        statement: 'Je bent niet bang voor opvallende prints',
        gemengd: 'Je combineert prints en effen vrij',
      };
      if (map[quizAnswers.prints]) insights.push(map[quizAnswers.prints]);
    }

    // Fallback from archetype if no quiz data
    if (insights.length < 2 && archetype.materials.length > 0) {
      const materialDescriptions: Record<string, string> = {
        katoen: 'natuurlijke stoffen zoals katoen',
        wol: 'kwalitatieve materialen zoals wol',
        tech: 'technische, functionele materialen',
        leer: 'luxe materialen zoals leer',
        linnen: 'luchtige, natuurlijke stoffen',
        fleece: 'zachte, comfortabele materialen',
        denim: 'robuuste, veelzijdige denim',
      };
      const material = archetype.materials[0];
      if (materialDescriptions[material]) {
        insights.push(`Je waardeert ${materialDescriptions[material]}`);
      }
    }

    return insights.slice(0, 4);
  };

  const personalizedDescription = getPersonalizedDescription();
  const swipeBasedInsights = getSwipeInsights();

  // Generate style name combining archetype + season
  const getStyleName = (): string => {
    const seasonSuffixes: Record<string, string> = {
      'winter': 'Cool',
      'zomer': 'Soft',
      'herfst': 'Warm',
      'lente': 'Bright'
    };

    const suffix = seasonSuffixes[colorProfile.season?.toLowerCase()] || '';
    return suffix ? `${archetype.label} ${suffix}` : archetype.label;
  };

  const styleName = getStyleName();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-3xl border border-[var(--ff-color-primary-300)] shadow-2xl p-8 md:p-12"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--ff-color-primary-200)] to-transparent opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[var(--ff-color-accent-200)] to-transparent opacity-20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[var(--ff-color-primary-300)] mb-6"
        >
          <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
          <span className="text-sm font-bold text-[var(--ff-color-primary-700)]">
            Jouw Stijl-Identiteit
          </span>
        </motion.div>

        {/* Main Identity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)] mb-3 leading-tight">
            {styleName}
          </h2>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] leading-relaxed font-light">
            {personalizedDescription}
          </p>
        </motion.div>

        {/* Insights Grid */}
        {swipeBasedInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
          >
            {swipeBasedInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-[var(--ff-color-primary-200)]"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-snug flex-1">
                  {insight}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Signature Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--ff-color-primary-300)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
            <h4 className="font-bold text-[var(--ff-color-primary-800)]">
              Jouw signature items
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {archetype.staples.slice(0, 5).map((staple, idx) => (
              <motion.span
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 + idx * 0.05 }}
                className="px-3 py-1.5 bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] text-sm font-semibold rounded-full capitalize"
              >
                {staple}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Connection Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 flex items-start gap-3 p-4 bg-gradient-to-r from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] rounded-xl border border-[var(--ff-color-primary-300)]"
        >
          <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ff-color-primary-800)] leading-relaxed">
            <strong>Jouw stijl in één zin:</strong>{" "}
            {quizAnswers.neutrals === 'warm'
              ? 'Warm, aards en consistent — '
              : quizAnswers.neutrals === 'koel'
              ? 'Koel, helder en gestructureerd — '
              : 'Neutraal en veelzijdig — '}
            je gaf aan dat je {quizAnswers.fit === 'slim' ? 'getailleerde' : quizAnswers.fit === 'oversized' ? 'oversized' : 'comfortabele'} outfits wilt.
            Daarom hebben we {archetype.label.toLowerCase()} looks voor je geselecteerd die direct aansluiten op jouw antwoorden.
            {" "}<em className="not-italic font-medium">Niet eens? Pas je antwoorden aan en vernieuw je rapport.</em>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Design & UX Decisions:
 *
 * 1. Hero Positioning:
 *    - Large, prominent (hero treatment)
 *    - First thing user sees on results page
 *    - Gradient background (premium feel)
 *    - Decorative elements (depth)
 *
 * 2. Content Hierarchy:
 *    Level 1: Style Name (Minimalist Cool)
 *    Level 2: Description (What this means)
 *    Level 3: Evidence (What we observed)
 *    Level 4: Signature Items (Concrete examples)
 *    Level 5: Connection (Why outfits match)
 *
 * 3. Personalization Layers:
 *    - Quiz → Primary archetype
 *    - Color analysis → Season suffix
 *    - Swipes → Evidence-based insights
 *    - Materials/Silhouettes → Preferences
 *
 * 4. Narrative Structure:
 *    "You are X" → "You love Y" → "Therefore Z"
 *    Identity → Evidence → Action
 *
 * 5. Validation Psychology:
 *    - "We understand you" (insights)
 *    - "Based on your choices" (evidence)
 *    - "This is why" (connection)
 *
 * 6. Visual Language:
 *    - Gradient backgrounds (premium)
 *    - Heart icons (preference)
 *    - Signature chips (concrete)
 *    - Progressive disclosure (animated)
 *
 * 7. Mobile Optimization:
 *    - Single column on mobile
 *    - Touch-friendly chips
 *    - Readable text sizes
 *    - Condensed on small screens
 *
 * References:
 * - Identity Formation Theory (Erikson)
 * - Self-Determination Theory (Ryan & Deci)
 * - Narrative Psychology (Bruner)
 * - Evidence-Based Design (Nielsen)
 */
