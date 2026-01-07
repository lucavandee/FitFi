import { motion } from 'framer-motion';
import { Sparkles, Heart, TrendingUp, Shirt, Palette } from 'lucide-react';
import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';
import type { ColorProfile } from '@/lib/quiz/types';

interface StyleIdentityHeroProps {
  primaryArchetype: ArchetypeKey;
  colorProfile: ColorProfile;
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

  // Generate evidence-based insights from swipe data
  const getSwipeInsights = (): string[] => {
    const insights: string[] = [];

    // Favorite categories
    if (swipeInsights.favoriteCategories && swipeInsights.favoriteCategories.length > 0) {
      const categories = swipeInsights.favoriteCategories.slice(0, 2).join(' en ');
      insights.push(`Je hebt een voorkeur voor ${categories}`);
    }

    // Pattern preferences
    if (swipeInsights.preferredPatterns && swipeInsights.preferredPatterns.length > 0) {
      const patterns = swipeInsights.preferredPatterns[0];
      if (patterns.includes('effen')) {
        insights.push("Je houdt van effen stoffen zonder opvallende prints");
      } else if (patterns.includes('gestreept')) {
        insights.push("Je waardeert subtiele strepen en geometrische patronen");
      } else if (patterns.includes('print')) {
        insights.push("Je bent niet bang voor opvallende prints en patronen");
      }
    }

    // Silhouette preferences from archetype
    const silhouetteMap: Record<string, string> = {
      'slim': "Je verkiest slimme, getailleerde silhouetten",
      'relaxed': "Je waardeert comfortabele, relaxed pasvormen",
      'oversized': "Je houdt van oversized, losse silhouetten",
      'tailored': "Je waardeert goed gesneden, tailored pieces",
      'boxy': "Je houdt van boxy, moderne silhouetten"
    };

    if (archetype.silhouettes.length > 0) {
      const silhouette = archetype.silhouettes[0];
      if (silhouetteMap[silhouette]) {
        insights.push(silhouetteMap[silhouette]);
      }
    }

    // Material preferences
    if (archetype.materials.length > 0) {
      const materialDescriptions: Record<string, string> = {
        'katoen': "natuurlijke stoffen zoals katoen",
        'wol': "kwalitatieve materialen zoals wol",
        'tech': "technische, functionele materialen",
        'leer': "luxe materialen zoals leer",
        'linnen': "luchtige, natuurlijke stoffen",
        'fleece': "zachte, comfortabele materialen",
        'denim': "robuuste, veelzijdige denim"
      };

      const material = archetype.materials[0];
      if (materialDescriptions[material]) {
        insights.push(`Je waardeert ${materialDescriptions[material]}`);
      }
    }

    // Color preferences from color profile
    if (colorProfile.season) {
      const seasonDescriptions: Record<string, string> = {
        'winter': "heldere, koele kleuren met contrast",
        'zomer': "zachte, gedempte pasteltinten",
        'herfst': "warme, aardse kleuren met diepte",
        'lente': "heldere, warme kleuren vol energie"
      };

      const seasonDesc = seasonDescriptions[colorProfile.season.toLowerCase()];
      if (seasonDesc) {
        insights.push(`Je komt het best tot je recht in ${seasonDesc}`);
      }
    }

    return insights.slice(0, 4); // Max 4 insights
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
      className="relative overflow-hidden bg-gradient-to-br from-white via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-3xl border-2 border-[var(--ff-color-primary-300)] shadow-2xl p-8 md:p-12"
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
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light">
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
                <p className="text-sm text-gray-700 leading-snug flex-1">
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
            <strong>Daarom hebben we voor je geselecteerd:</strong>{" "}
            Alle onderstaande outfits zijn handmatig afgestemd op jouw {styleName}-stijl
            en je {colorProfile.season}-kleurpalet. Ze passen perfect bij wat je ons vertelde
            én wat we zagen in je visual preferences.
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
