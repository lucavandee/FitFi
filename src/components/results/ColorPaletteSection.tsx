import { motion } from 'framer-motion';
import { Palette, CheckCircle, XCircle, Info, Lock, Camera } from 'lucide-react';
import { getColorPalette, groupColorsByCategory } from '@/data/colorPalettes';
import { ColorSwatchGrid } from './ColorSwatchWithLabel';
import { useNavigate } from 'react-router-dom';

interface ColorPaletteSectionProps {
  season: string;
  hasPhoto?: boolean;
  isPremium?: boolean;
}

/**
 * ColorPaletteSection - Complete color palette display with categories
 *
 * Purpose:
 * - Show concrete, named colors for user's season
 * - Organize by category (basis, accent, neutral)
 * - Highlight do's and don'ts
 * - Fully accessible and educational
 *
 * Layout:
 * 1. Header with season description
 * 2. Recommended colors (do's) - Green badge
 * 3. Full palette organized by category
 * 4. Colors to avoid (don'ts) - Red badge
 */
export function ColorPaletteSection({ season, hasPhoto = false, isPremium = false }: ColorPaletteSectionProps) {
  const navigate = useNavigate();
  const palette = getColorPalette(season);

  if (!palette) {
    return null;
  }

  const groupedColors = groupColorsByCategory(palette.colors);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-3xl border-2 border-[var(--ff-color-primary-200)] p-8 md:p-10 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center flex-shrink-0">
          <Palette className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Kleurcombinaties voor {palette.season}
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            {palette.description}
          </p>
        </div>
      </div>

      {/* Photo / undertone disclaimer — aria-live so screen readers hear the dynamic state */}
      <div aria-live="polite" aria-atomic="true">
        {!hasPhoto ? (
          <div className="flex items-start gap-3 p-4 mb-8 bg-amber-50 border border-amber-200 rounded-xl" role="note">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Kleurtips op basis van jouw kleurvoorkeur — geen ondertoonadvies
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Zonder foto geven we geen uitspraken over huidondertoon. Onderstaande kleuren zijn gebaseerd op jouw keuzes in de quiz.{' '}
                <button
                  onClick={() => navigate('/onboarding?step=photo')}
                  className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1 rounded"
                >
                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                  Upload selfie voor ondertoonanalyse
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 mb-8 bg-green-50 border border-green-200 rounded-xl" role="note">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-800 leading-relaxed">
              <strong className="font-semibold">Foto-gebaseerd kleuradvies</strong> — kleurtips zijn mede gebaseerd op je huidondertoon uit de foto-analyse.
            </p>
          </div>
        )}
      </div>

      {/* Recommended Colors (DO) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h4 className="text-xl font-bold text-green-900">
            Draag deze kleuren
          </h4>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
          <ColorSwatchGrid
            swatches={palette.doColors}
            recommendation="do"
            columns={6}
          />
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Deze kleuren flatteren je het meest. Screenshot deze sectie en
                bewaar hem in je telefoon voor tijdens het shoppen!
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Full Palette by Category */}
      <div className="mb-10">
        <h4 className="text-xl font-bold text-gray-800 mb-6">
          Compleet Kleurpalet
        </h4>

        {/* Basis Kleuren */}
        {groupedColors.basis.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[var(--ff-color-primary-500)]" />
              <h5 className="text-lg font-semibold text-gray-700">
                Basiskleuren
              </h5>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Bouw je garderobe hierop. Deze kleuren vormen je foundation.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.basis}
              columns={6}
            />
          </div>
        )}

        {/* Accent Kleuren */}
        {groupedColors.accent.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[var(--ff-color-accent-500)]" />
              <h5 className="text-lg font-semibold text-gray-700">
                Accentkleuren
              </h5>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Voeg energie toe aan je outfits. Mix met basiskleuren voor balans.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.accent}
              columns={6}
            />
          </div>
        )}

        {/* Neutrale Tinten */}
        {groupedColors.neutraal.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <h5 className="text-lg font-semibold text-gray-700">
                Neutrale tinten
              </h5>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Perfecte complementen. Combineer met elke andere kleur uit je palet.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.neutraal}
              columns={6}
            />
          </div>
        )}
      </div>

      {/* Colors to Avoid — only available when undertone is confirmed via photo */}
      {hasPhoto ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
            <h4 className="text-xl font-bold text-red-900">
              Vermijd deze kleuren
            </h4>
          </div>
          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
            <ColorSwatchGrid
              swatches={palette.dontColors}
              recommendation="dont"
              columns={6}
            />
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>
                  Op basis van jouw huidondertoon zijn deze kleuren minder flatterend. Ze kunnen je huid dof of grauw maken.
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border-2 border-dashed border-[var(--color-border)] p-8 text-center">
          <div className="absolute inset-0 bg-[var(--color-bg)]/60 backdrop-blur-[2px] rounded-2xl" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[var(--color-muted)]" />
            </div>
            <p className="font-semibold text-[var(--color-text)]">Kleuren om te vermijden</p>
            <p className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">
              Wil je een persoonlijk kleurenpalet? Upload een selfie — dan analyseren we jouw ondertoon.
            </p>
            <button
              onClick={() => navigate('/onboarding?step=photo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              <Camera className="w-4 h-4" />
              Upload foto voor ondertoonanalyse
            </button>
          </div>
        </div>
      )}

      {/* How to Use This Palette */}
      <div className="mt-8 p-6 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border border-[var(--ff-color-primary-200)]">
        <h5 className="font-bold text-lg text-[var(--ff-color-primary-800)] mb-3">
          💡 Hoe gebruik je dit palet?
        </h5>
        <ul className="space-y-2 text-sm text-[var(--ff-color-primary-700)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5">•</span>
            <span>
              <strong>Basis 60%:</strong> Kies 2-3 basiskleuren voor je garderobe foundation (broeken, jasjes, basics).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5">•</span>
            <span>
              <strong>Accent 30%:</strong> Gebruik accentkleuren voor tops, accessoires en statement pieces.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5">•</span>
            <span>
              <strong>Neutrale 10%:</strong> Neutrale tinten zijn perfecte complementen en binders.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5">•</span>
            <span>
              <strong>Test in winkel:</strong> Houd een kledingstuk bij je gezicht in natuurlijk licht.
              Zie je een gezonde gloed? Dan past het bij je palet!
            </span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * UX Psychology & Design Decisions:
 *
 * 1. Visual Hierarchy:
 *    ✅ DO (green) → FULL PALETTE → ❌ DON'T (red)
 *    Priority: Show recommended first, avoid last
 *
 * 2. Color Organization:
 *    - Group by function (basis, accent, neutral)
 *    - Each group has clear purpose explained
 *    - 60-30-10 rule guidance
 *
 * 3. Practical Application:
 *    - "Draag deze" (not "you could wear")
 *    - Screenshot encouragement
 *    - In-store testing tips
 *
 * 4. Accessibility:
 *    - All swatches have names (not just hex)
 *    - Hover/touch to see name
 *    - Screen reader support
 *    - Color contrast compliance
 *
 * 5. Educational Content:
 *    - Why categories matter
 *    - How to build a wardrobe
 *    - Practical usage ratios
 *
 * 6. Mobile Optimization:
 *    - Grid adapts to screen size
 *    - Touch-friendly swatches
 *    - Labels always visible (no hover dependency)
 *
 * References:
 * - Color Theory: 60-30-10 Rule
 * - Fashion Capsule Wardrobe Principles
 * - WCAG 2.1: Non-text Contrast
 * - Material Design: Color Systems
 */
