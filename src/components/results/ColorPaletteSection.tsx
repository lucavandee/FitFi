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

export function ColorPaletteSection({ season, hasPhoto = false }: ColorPaletteSectionProps) {
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
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-[var(--shadow-soft)]"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ff-color-primary-100)' }}
        >
          <Palette className="w-6 h-6 text-[var(--ff-color-primary-700)]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-1">
            Kleurcombinaties voor {palette.season}
          </h3>
          <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            {palette.description}
          </p>
        </div>
      </div>

      {/* Photo / undertone disclaimer */}
      <div aria-live="polite" aria-atomic="true">
        {!hasPhoto ? (
          <div
            className="flex items-start gap-3 p-4 mb-8 rounded-xl border border-[var(--color-border)]"
            style={{ background: 'var(--ff-color-primary-50)' }}
            role="note"
          >
            <Info className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                Kleurtips op basis van jouw kleurvoorkeur
              </p>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                Zonder foto geven we geen uitspraken over huidondertoon. Onderstaande kleuren zijn gebaseerd op jouw keuzes in de quiz.{' '}
                <button
                  onClick={() => navigate('/onboarding?step=photo')}
                  className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline text-[var(--ff-color-primary-700)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-1 rounded"
                  aria-label="Voeg een selfie toe voor ondertoonanalyse"
                >
                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                  Voeg selfie toe
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex items-start gap-3 p-4 mb-8 rounded-xl border border-[var(--color-border)]"
            style={{ background: 'var(--ff-color-primary-50)' }}
            role="note"
          >
            <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              <strong className="font-semibold text-[var(--color-text)]">Foto-gebaseerd kleuradvies</strong> — kleurtips zijn mede gebaseerd op je huidondertoon uit de kleuranalyse.
            </p>
          </div>
        )}
      </div>

      {/* Recommended Colors */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" aria-hidden="true" />
          <h4 className="text-base font-bold text-[var(--color-text)]">
            Draag deze kleuren
          </h4>
        </div>
        <div
          className="rounded-xl p-4 sm:p-6 border border-[var(--color-border)]"
          style={{ background: 'var(--ff-color-primary-50)' }}
        >
          <ColorSwatchGrid
            swatches={palette.doColors}
            recommendation="do"
            columns={6}
          />
          <div className="mt-4 p-3 bg-[var(--color-surface)] rounded-lg">
            <p className="text-sm text-[var(--color-muted)] flex items-start gap-2">
              <Info className="w-4 h-4 text-[var(--ff-color-primary-600)] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                Deze kleuren staan je het beste. Sla deze sectie op voor tijdens het shoppen.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Full Palette by Category */}
      <div className="mb-8">
        <h4 className="text-base font-bold text-[var(--color-text)] mb-5">
          Compleet kleurpalet
        </h4>

        {groupedColors.basis.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--ff-color-primary-500)]" aria-hidden="true" />
              <h5 className="text-sm font-semibold text-[var(--color-text)]">
                Basiskleuren
              </h5>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-3">
              Bouw je garderobe hierop. Deze kleuren vormen je foundation.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.basis}
              columns={6}
            />
          </div>
        )}

        {groupedColors.accent.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--ff-color-accent-500)]" aria-hidden="true" />
              <h5 className="text-sm font-semibold text-[var(--color-text)]">
                Accentkleuren
              </h5>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-3">
              Voeg energie toe aan je outfits. Mix met basiskleuren voor balans.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.accent}
              columns={6}
            />
          </div>
        )}

        {groupedColors.neutraal.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-muted)]" aria-hidden="true" />
              <h5 className="text-sm font-semibold text-[var(--color-text)]">
                Neutrale tinten
              </h5>
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-3">
              Perfecte complementen voor elke andere kleur uit je palet.
            </p>
            <ColorSwatchGrid
              swatches={groupedColors.neutraal}
              columns={6}
            />
          </div>
        )}
      </div>

      {/* Colors to Avoid */}
      {hasPhoto ? (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-[var(--ff-color-danger-600)]" aria-hidden="true" />
            <h4 className="text-base font-bold text-[var(--color-text)]">
              Vermijd deze kleuren
            </h4>
          </div>
          <div
            className="rounded-xl p-4 sm:p-6 border border-[var(--color-border)]"
            style={{ background: 'var(--ff-color-primary-50)' }}
          >
            <ColorSwatchGrid
              swatches={palette.dontColors}
              recommendation="dont"
              columns={6}
            />
            <div className="mt-4 p-3 bg-[var(--color-surface)] rounded-lg">
              <p className="text-sm text-[var(--color-muted)] flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--ff-color-danger-500)] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>
                  Op basis van jouw huidondertoon zijn deze kleuren minder flatterend.
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border-2 border-dashed border-[var(--color-border)] p-8 text-center mb-8">
          <div className="absolute inset-0 bg-[var(--color-bg)]/60 backdrop-blur-[2px] rounded-2xl" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[var(--color-muted)]" aria-hidden="true" />
            </div>
            <p className="font-semibold text-[var(--color-text)] text-sm">Kleuren om te vermijden</p>
            <p className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">
              Upload een selfie — dan analyseren we jouw ondertoon voor persoonlijk kleuradvies.
            </p>
            <button
              onClick={() => navigate('/onboarding?step=photo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              style={{ background: 'var(--ff-color-primary-700)' }}
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Foto toevoegen
            </button>
          </div>
        </div>
      )}

      {/* How to Use This Palette */}
      <div
        className="p-5 sm:p-6 rounded-2xl border border-[var(--color-border)]"
        style={{ background: 'var(--ff-color-primary-50)' }}
      >
        <h5 className="font-bold text-sm text-[var(--color-text)] mb-3">
          Zo gebruik je dit palet
        </h5>
        <ul className="space-y-2 text-sm text-[var(--color-muted)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5 font-bold" aria-hidden="true">–</span>
            <span><strong className="text-[var(--color-text)]">Basis 60%:</strong> Kies 2–3 basiskleuren voor je garderobe (broeken, jasjes, basics).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5 font-bold" aria-hidden="true">–</span>
            <span><strong className="text-[var(--color-text)]">Accent 30%:</strong> Gebruik accentkleuren voor tops, accessoires en statement pieces.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5 font-bold" aria-hidden="true">–</span>
            <span><strong className="text-[var(--color-text)]">Neutraal 10%:</strong> Neutrale tinten zijn perfecte complementen en binders.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--ff-color-primary-500)] mt-0.5 font-bold" aria-hidden="true">–</span>
            <span><strong className="text-[var(--color-text)]">Test in winkel:</strong> Houd een kledingstuk bij je gezicht in natuurlijk licht voor een goede indruk.</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
