import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizInputSummaryProps {
  answers: Record<string, any>;
  archetypeName: string;
}

const FIELD_LABELS: Record<string, string> = {
  gender: 'Geslacht',
  stylePreferences: 'Stijlvoorkeur',
  neutrals: 'Kleurtemperatuur',
  lightness: 'Licht/donker',
  contrast: 'Contrast',
  fit: 'Pasvorm',
  occasions: 'Gelegenheden',
  goals: 'Stijldoelen',
  prints: 'Prints',
  materials: 'Materialen',
  budgetRange: 'Budget',
  sizes: 'Maten',
  photoUrl: 'Selfie',
};

const FIELD_EXPLAINERS: Partial<Record<string, (val: any) => string>> = {
  neutrals: (v) => v === 'warm'
    ? 'je koos warme tinten → outfits in beige, camel, terracotta'
    : v === 'koel'
    ? 'je koos koele tinten → outfits in grijs, navy, steenkleur'
    : 'je koos een neutrale mix → zwart, wit, grijs als basis',

  lightness: (v) => v === 'licht'
    ? 'je kleedt je liever licht → cremewit en pasteltinten prioriteit'
    : v === 'donker'
    ? 'je kleedt je liever donker → donkerblauwe en zwarte basis'
    : 'je combineert licht en donker → gevarieerd palet',

  contrast: (v) => v === 'laag'
    ? 'je koos tonal stijl → outfits in dezelfde tintfamilie'
    : v === 'hoog'
    ? 'je koos sterk contrast → combinaties van licht + donker'
    : 'je koos licht contrast → rustige maar niet tonal outfits',

  fit: (v) => ({
    slim: 'nauwsluitend → getailleerde coupes en slim cuts',
    regular: 'normale pasvorm → klassieke en veelzijdige silhouetten',
    relaxed: 'losse pasvorm → ruimere, comfortabele silhouetten',
    oversized: 'oversized → moderne, ruime silhouetten',
  }[v as string] ?? v),

  goals: (v: string[]) => Array.isArray(v) && v.length
    ? `stijldoelen: ${v.map(g => ({
        timeless: 'tijdloze garderobe',
        trendy: 'on-trend',
        minimal: 'minimalistisch',
        express: 'zelfexpressie',
        professional: 'professioneel',
        comfort: 'comfort',
      }[g] ?? g)).join(', ')}`
    : '',

  occasions: (v: string[]) => Array.isArray(v) && v.length
    ? `voor: ${v.map(o => ({
        work: 'werk',
        casual: 'casual',
        formal: 'formeel',
        date: 'date night',
        travel: 'reizen',
        sport: 'sport',
      }[o] ?? o)).join(', ')}`
    : '',

  budgetRange: (v: number) => v
    ? v < 75
      ? `budget €${v} per stuk → budgetvriendelijke selectie`
      : v < 150
      ? `budget €${v} per stuk → middensegment selectie`
      : `budget €${v} per stuk → premium selectie`
    : '',

  stylePreferences: (v: string[]) => Array.isArray(v) && v.length
    ? `stijlvoorkeur: ${v.slice(0, 3).join(', ')}`
    : '',
};

function buildBullets(answers: Record<string, any>): string[] {
  const bullets: string[] = [];

  const priorityFields = ['neutrals', 'lightness', 'contrast', 'fit', 'goals', 'occasions', 'stylePreferences', 'budgetRange'];

  for (const field of priorityFields) {
    const val = answers[field];
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;

    const explainer = FIELD_EXPLAINERS[field];
    if (explainer) {
      const text = explainer(val);
      if (text) bullets.push(text);
    }

    if (bullets.length >= 6) break;
  }

  return bullets;
}

export function QuizInputSummary({ answers, archetypeName }: QuizInputSummaryProps) {
  const navigate = useNavigate();
  const bullets = buildBullets(answers);
  const hasPhoto = !!answers.photoUrl;

  if (!bullets.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] mb-1">
            Op basis van jouw keuzes
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
            Waarom dit rapport voor <em className="not-italic text-[var(--ff-color-primary-700)]">{archetypeName}</em> is
          </h3>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] px-3 py-2 rounded-lg"
          aria-label="Pas antwoorden aan"
        >
          <span>Pas aan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <ul className="space-y-2.5">
        {bullets.map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex items-start gap-3"
          >
            <span className="w-5 h-5 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
            </span>
            <span className="text-sm text-[var(--color-text)] leading-snug">
              <strong className="font-semibold capitalize">{bullet.split('→')[0].trim()}</strong>
              {bullet.includes('→') && (
                <span className="text-[var(--color-muted)]"> → {bullet.split('→')[1].trim()}</span>
              )}
            </span>
          </motion.li>
        ))}
      </ul>

      {!hasPhoto && (
        <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            <strong className="text-[var(--color-text)]">Kleurenanalyse (ondertoon)</strong> is niet beschikbaar zonder foto.
            Bovenstaande kleurtips zijn gebaseerd op jouw kleurvoorkeur, niet op huidondertoon.{' '}
            <button
              onClick={() => navigate('/onboarding?step=photo')}
              className="text-[var(--ff-color-primary-600)] underline underline-offset-2 hover:no-underline font-medium"
            >
              Upload een foto
            </button>{' '}
            voor een persoonlijk kleuradvies.
          </p>
        </div>
      )}
    </motion.div>
  );
}
