import { CircleCheck as CheckCircle, Circle as XCircle, Info, Lock, Camera } from 'lucide-react';
import { getColorPalette, groupColorsByCategory } from '@/data/colorPalettes';
import { ColorSwatchGrid } from './ColorSwatchWithLabel';
import { useNavigate } from 'react-router-dom';

interface ColorPaletteSectionProps {
  season: string;
  subSeason?: string;
  hasPhoto?: boolean;
  isPremium?: boolean;
}

export function ColorPaletteSection({ season, subSeason, hasPhoto = false }: ColorPaletteSectionProps) {
  const navigate = useNavigate();
  // Use sub-season palette when available, fall back to base season
  const palette = getColorPalette(subSeason || season);

  if (!palette) return null;

  const groupedColors = groupColorsByCategory(palette.colors);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-soft)' }}>
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-0.5">Kleurpalet</p>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {palette.season}
        </h3>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{palette.description}</p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Disclaimer */}
        <div
          className="flex items-start gap-2.5 p-3 rounded-lg border border-[var(--color-border)]"
          style={{ background: 'var(--ff-color-primary-50)' }}
          role="note"
          aria-live="polite"
        >
          {hasPhoto
            ? <CheckCircle className="w-3.5 h-3.5 text-[#C2654A] shrink-0 mt-0.5" aria-hidden="true" />
            : <Info className="w-3.5 h-3.5 text-[var(--ff-color-primary-600)] shrink-0 mt-0.5" aria-hidden="true" />
          }
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            {hasPhoto
              ? <><strong className="font-semibold text-[var(--color-text)]">Foto-gebaseerd advies</strong> — kleurtips zijn mede gebaseerd op je huidondertoon.</>
              : <>Kleurtips op basis van jouw quiz. Zonder foto geven we geen uitspraken over huidondertoon.{' '}
                  <button onClick={() => navigate('/onboarding?step=photo')} className="font-semibold underline underline-offset-2 text-[var(--ff-color-primary-700)] hover:no-underline focus-visible:ring-1 focus-visible:ring-[var(--ff-color-primary-500)] rounded">
                    Voeg selfie toe
                  </button>
                </>
            }
          </p>
        </div>

        {/* Recommended Colors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#C2654A]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Draag deze kleuren</p>
          </div>
          <div className="rounded-xl p-4 border border-[var(--color-border)]" style={{ background: 'var(--ff-color-primary-50)' }}>
            <ColorSwatchGrid swatches={palette.doColors} recommendation="do" columns={6} />
            <p className="text-xs text-[var(--color-muted)] flex items-center gap-1.5 mt-3">
              <Info className="w-3 h-3 text-[var(--ff-color-primary-500)] shrink-0" aria-hidden="true" />
              Sla deze sectie op voor tijdens het shoppen.
            </p>
          </div>
        </div>

        {/* Full palette by category */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-4">Compleet palet</p>
          <div className="space-y-5">
            {groupedColors.basis.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--ff-color-primary-500)]" aria-hidden="true" />
                  <p className="text-xs font-semibold text-[var(--color-text)]">Basiskleuren</p>
                  <p className="text-xs text-[var(--color-muted)]">— ~60% van je garderobe</p>
                </div>
                <ColorSwatchGrid swatches={groupedColors.basis} columns={6} />
              </div>
            )}
            {groupedColors.accent.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--ff-color-primary-400)]" aria-hidden="true" />
                  <p className="text-xs font-semibold text-[var(--color-text)]">Accentkleuren</p>
                  <p className="text-xs text-[var(--color-muted)]">— ~30% voor balans</p>
                </div>
                <ColorSwatchGrid swatches={groupedColors.accent} columns={6} />
              </div>
            )}
            {groupedColors.neutraal.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-muted)]" aria-hidden="true" />
                  <p className="text-xs font-semibold text-[var(--color-text)]">Neutrale tinten</p>
                  <p className="text-xs text-[var(--color-muted)]">— ~10% als complementen</p>
                </div>
                <ColorSwatchGrid swatches={groupedColors.neutraal} columns={6} />
              </div>
            )}
          </div>
        </div>

        {/* Colors to avoid */}
        {hasPhoto ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-[var(--ff-color-danger-600)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--color-text)]">Vermijd deze kleuren</p>
            </div>
            <div className="rounded-xl p-4 border border-[var(--color-border)]" style={{ background: 'var(--ff-color-primary-50)' }}>
              <ColorSwatchGrid swatches={palette.dontColors} recommendation="dont" columns={6} />
              <p className="text-xs text-[var(--color-muted)] flex items-center gap-1.5 mt-3">
                <Info className="w-3 h-3 text-[var(--ff-color-danger-500)] shrink-0" aria-hidden="true" />
                Op basis van jouw huidondertoon zijn deze kleuren minder flatterend.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
            <div className="absolute inset-0 bg-[var(--color-bg)]/50 backdrop-blur-[2px] rounded-xl" />
            <div className="relative z-10 flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-[var(--color-muted)]" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Kleuren om te vermijden</p>
              <p className="text-xs text-[var(--color-muted)] max-w-xs leading-relaxed">
                Upload een selfie voor ondertoonanalyse en persoonlijk kleuradvies.
              </p>
              <button
                onClick={() => navigate('/onboarding?step=photo')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                style={{ background: 'var(--ff-color-primary-700)' }}
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                Foto toevoegen
              </button>
            </div>
          </div>
        )}

        {/* Usage tip */}
        <p className="text-sm text-[var(--color-muted)] leading-relaxed pt-3 border-t border-[var(--color-border)]">
          Test kleuren altijd in natuurlijk daglicht bij je gezicht voordat je koopt.
        </p>
      </div>
    </div>
  );
}
