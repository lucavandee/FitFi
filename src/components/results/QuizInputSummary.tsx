import { motion } from 'framer-motion';
import { Check, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizInputSummaryProps {
  answers: Record<string, any>;
  archetypeName: string;
}

const FIELD_EXPLAINERS: Partial<Record<string, (val: any) => { label: string; detail: string } | null>> = {
  neutrals: (v) => ({
    warm:    { label: "Warme tinten",      detail: "outfits in beige, camel en terracotta" },
    koel:    { label: "Koele tinten",      detail: "outfits in grijs, navy en steenkleur"  },
    neutraal:{ label: "Neutrale basis",    detail: "zwart, wit en grijs als fundament"      },
  }[v as string] ?? null),

  lightness: (v) => ({
    licht:   { label: "Licht kleurpalet",  detail: "cremewit en pasteltinten op de voorgrond" },
    donker:  { label: "Donker kleurpalet", detail: "donkerblauw en zwart als basis"           },
    medium:  { label: "Gebalanceerd palet", detail: "combinatie van licht en donker"           },
  }[v as string] ?? null),

  contrast: (v) => ({
    laag:    { label: "Tonal stijl",       detail: "outfits binnen dezelfde tintfamilie"       },
    hoog:    { label: "Sterk contrast",    detail: "combinaties van licht en donker"            },
    medium:  { label: "Subtiel contrast",  detail: "rustig maar niet volledig tonal"            },
  }[v as string] ?? null),

  fit: (v) => ({
    slim:     { label: "Getailleerde coupe",  detail: "slim cuts en nauwsluitende vormen"       },
    regular:  { label: "Klassieke pasvorm",   detail: "veelzijdige silhouetten voor elke dag"  },
    relaxed:  { label: "Losse pasvorm",       detail: "ruimere, comfortabele silhouetten"       },
    oversized:{ label: "Oversized fit",       detail: "moderne, ruime silhouetten"              },
    oversizedTop_slimBottom: { label: "Volume boven, slim onder", detail: "moderne proportie-speling" },
  }[v as string] ?? null),

  goals: (v: string[]) => {
    if (!Array.isArray(v) || !v.length) return null;
    const MAP: Record<string, string> = {
      timeless: 'tijdloze garderobe', trendy: 'on-trend', minimal: 'minimalistisch',
      express: 'zelfexpressie', professional: 'professioneel', comfort: 'comfort',
      werk: 'werk', casual: 'casual', avond: 'avond', sport: 'sport',
    };
    return { label: "Stijldoelen", detail: v.map(g => MAP[g] ?? g).join(', ') };
  },

  occasions: (v: string[]) => {
    if (!Array.isArray(v) || !v.length) return null;
    const MAP: Record<string, string> = {
      work: 'werk', casual: 'casual', formal: 'formeel',
      date: 'date night', travel: 'reizen', sport: 'sport',
      office: 'kantoor', smartcasual: 'smart casual', leisure: 'vrije tijd',
    };
    return { label: "Gelegenheden", detail: v.map(o => MAP[o] ?? o).join(', ') };
  },

  budgetRange: (v: { max?: number } | number) => {
    const max = typeof v === 'object' ? v?.max : v;
    if (!max) return null;
    const tier = max < 75 ? 'budgetvriendelijk' : max < 150 ? 'middensegment' : 'premium';
    return { label: `Budget tot €${max}`, detail: `${tier} selectie` };
  },
};

function buildBullets(answers: Record<string, any>): Array<{ label: string; detail: string }> {
  const result: Array<{ label: string; detail: string }> = [];
  const order = ['neutrals', 'lightness', 'contrast', 'fit', 'goals', 'occasions', 'budgetRange'];

  for (const field of order) {
    const val = answers[field];
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;
    const explainer = FIELD_EXPLAINERS[field];
    if (!explainer) continue;
    const out = explainer(val);
    if (out) result.push(out);
    if (result.length >= 5) break;
  }

  return result;
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
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Op basis van jouw keuzes
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors"
            aria-label="Pas antwoorden aan"
          >
            Pas aan <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">
          Waarom dit rapport past bij{' '}
          <span className="text-[var(--ff-color-primary-700)]">{archetypeName}</span>
        </h3>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-[var(--color-border)] mx-5" />

      {/* ── Bullets ── */}
      <ul className="px-5 py-4 space-y-0 divide-y divide-[var(--color-border)]">
        {bullets.map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="w-5 h-5 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
            </span>
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--color-text)] flex-shrink-0">
                {bullet.label}
              </span>
              <span className="text-xs text-[var(--color-muted)] text-right leading-snug truncate">
                {bullet.detail}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* ── Photo upsell ── */}
      {!hasPhoto && (
        <div className="mx-5 mb-5 mt-1 flex items-start gap-3 rounded-xl bg-[var(--ff-color-primary-25)] border border-[var(--ff-color-primary-100)] px-4 py-3">
          <Camera className="w-4 h-4 text-[var(--ff-color-primary-500)] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text)] mb-0.5">
              Verfijn jouw kleuradvies
            </p>
            <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
              Upload een selfie voor kleuranalyse op basis van jouw huidondertoon.{' '}
              <button
                onClick={() => navigate('/onboarding?step=photo')}
                className="text-[var(--ff-color-primary-600)] font-semibold hover:underline"
              >
                Foto toevoegen →
              </button>
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
