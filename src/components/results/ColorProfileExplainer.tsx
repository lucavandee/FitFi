import type { ColorProfile } from "@/lib/quiz/types";

interface ColorProfileExplainerProps {
  colorProfile: ColorProfile;
  confidence: number;
  className?: string;
}

function getTemperatureLabel(t: string): string {
  if (t === 'warm') return 'Warm';
  if (t === 'cool' || t === 'koel') return 'Koel';
  return 'Neutraal';
}

function getContrastLevel(contrast: string): string {
  const c = contrast?.toLowerCase() || '';
  if (c.includes('high') || c.includes('hoog')) return 'Hoog';
  if (c.includes('low') || c.includes('laag')) return 'Laag';
  return 'Gemiddeld';
}

function getChromaLabel(paletteName: string, season: string): string {
  const p = paletteName?.toLowerCase() || '';
  const s = season?.toLowerCase() || '';
  if (p.includes('clear') || p.includes('bright') || s.includes('spring') || s.includes('winter')) return 'Helder';
  if (p.includes('soft') || p.includes('muted') || p.includes('dusty')) return 'Gedempt';
  return 'Gemiddeld';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return 'Zeer betrouwbaar';
  if (confidence >= 0.7) return 'Betrouwbaar';
  if (confidence >= 0.5) return 'Gemiddeld';
  return 'Basis schatting';
}

function getSeasonName(colorProfile: ColorProfile): string {
  const p = colorProfile.paletteName?.toLowerCase() || '';
  const s = colorProfile.season?.toLowerCase() || '';

  if (p.includes('light summer')) return 'Licht Zomer';
  if (p.includes('light spring')) return 'Licht Lente';
  if (p.includes('deep winter')) return 'Diep Winter';
  if (p.includes('deep autumn')) return 'Diep Herfst';
  if (p.includes('soft summer')) return 'Zacht Zomer';
  if (p.includes('soft autumn')) return 'Zacht Herfst';
  if (p.includes('clear winter')) return 'Helder Winter';
  if (p.includes('clear spring')) return 'Helder Lente';
  if (p.includes('warm spring')) return 'Warm Lente';
  if (p.includes('warm autumn')) return 'Warm Herfst';
  if (p.includes('cool summer')) return 'Koel Zomer';
  if (p.includes('cool winter')) return 'Koel Winter';

  if (s.includes('winter')) return 'Winter';
  if (s.includes('summer') || s.includes('zomer')) return 'Zomer';
  if (s.includes('autumn') || s.includes('herfst')) return 'Herfst';
  if (s.includes('spring') || s.includes('lente')) return 'Lente';

  return colorProfile.paletteName || 'Onbekend';
}

function getTips(temperature: string): string[] {
  if (temperature === 'warm') {
    return [
      'Warme metalen (goud, koper) staan je beter dan zilver',
      'Kies crèmewit boven zuiver wit',
      'Aardetinten als camel en terracotta zijn je basiscombi',
    ];
  }
  if (temperature === 'cool' || temperature === 'koel') {
    return [
      'Koele metalen (zilver, witgoud) sluiten beter aan',
      'Kies zuiver wit boven crème of ivoor',
      'Navy, grijs en rozige tinten werken goed als basis',
    ];
  }
  return [
    'Je kunt zowel warme als koele kleuren dragen',
    'Focus op intensiteit en contrast, niet op temperatuur',
    'Test kleuren altijd in natuurlijk daglicht bij je gezicht',
  ];
}

export function ColorProfileExplainer({
  colorProfile,
  confidence,
  className = "",
}: ColorProfileExplainerProps) {
  const seasonName = getSeasonName(colorProfile);
  const temperatureLabel = getTemperatureLabel(colorProfile.temperature);
  const contrastLabel = getContrastLevel(colorProfile.contrast);
  const chromaLabel = getChromaLabel(colorProfile.paletteName, colorProfile.season);
  const confidenceLabel = getConfidenceLabel(confidence);
  const tips = getTips(colorProfile.temperature);

  const attributes = [
    { label: 'Ondertoon', value: temperatureLabel },
    { label: 'Contrast', value: contrastLabel },
    { label: 'Intensiteit', value: chromaLabel },
  ];

  return (
    <div
      className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden ${className}`}
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-0.5">Kleurprofiel</p>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{seasonName}</h3>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Profile attributes */}
        <div className="grid grid-cols-3 gap-3">
          {attributes.map((attr) => (
            <div
              key={attr.label}
              className="text-center py-3 px-2 rounded-xl border border-[var(--color-border)]"
              style={{ background: 'var(--ff-color-primary-25)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-1">{attr.label}</p>
              <p className="text-sm font-semibold text-[var(--ff-color-primary-700)]">{attr.value}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="divide-y divide-[var(--color-border)]">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="w-1 h-1 rounded-full bg-[var(--ff-color-primary-400)] mt-[7px] shrink-0" aria-hidden="true" />
              <p className="text-sm text-[var(--color-muted)] leading-snug">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
