import { motion } from 'framer-motion';
import { Check, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArchetypeDisplayNL } from '@/utils/displayNames';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white border border-[#E5E5E5] rounded-2xl p-8 mt-8"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#8A8A8A]">
          Op basis van jouw keuzes
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
          aria-label="Pas antwoorden aan"
        >
          Pas aan <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-8">
        Waarom dit rapport past bij{' '}
        <span className="text-[#C2654A]">{getArchetypeDisplayNL(archetypeName)}</span>
      </h3>

      {/* ── Bullets ── */}
      <ul>
        {bullets.map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="flex items-center justify-between py-4 border-b border-[#E5E5E5] last:border-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-[#C2654A]" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium text-[#1A1A1A]">
                {bullet.label}
              </span>
            </div>
            <span className="text-sm text-[#8A8A8A] text-right leading-snug">
              {bullet.detail}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* ── Photo upsell ── */}
      {!hasPhoto && (
        <div className="bg-[#F5F0EB] rounded-xl p-4 mt-6 flex items-center gap-3">
          <Camera className="w-5 h-5 text-[#C2654A] flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#4A4A4A]">
              Upload een selfie voor kleuranalyse op basis van jouw huidondertoon.
            </p>
          </div>
          <button
            onClick={() => navigate('/onboarding?step=photo')}
            className="text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] whitespace-nowrap transition-colors duration-200"
          >
            Foto toevoegen →
          </button>
        </div>
      )}
    </motion.div>
  );
}
