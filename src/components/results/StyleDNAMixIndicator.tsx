import { motion } from "framer-motion";
import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";
import { getArchetypeDisplayNL } from "@/utils/displayNames";

interface StyleMixItem {
  archetype: ArchetypeKey;
  percentage: number;
}

interface StyleDNAMixIndicatorProps {
  mixItems: StyleMixItem[];
  confidence: number;
  className?: string;
}

const BAR_COLORS = [
  'var(--ff-color-primary-700)',
  'var(--ff-color-primary-500)',
  'var(--ff-color-primary-400)',
  'var(--ff-color-primary-300)',
];

export function StyleDNAMixIndicator({ mixItems, confidence, className = "" }: StyleDNAMixIndicatorProps) {
  const sorted = mixItems.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  if (sorted.length === 0) return null;

  const confidenceLabel =
    confidence >= 0.85 ? 'Zeer hoog' :
    confidence >= 0.7  ? 'Hoog' :
    confidence >= 0.5  ? 'Gemiddeld' : 'Veelzijdig';

  return (
    <div className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden ${className}`} style={{ boxShadow: 'var(--shadow-soft)' }}>
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-0.5">Stijl DNA</p>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Samenstelling</h3>
      </div>

      <div className="p-5 sm:p-6">
        {/* Bar chart */}
        <div className="h-6 rounded-lg overflow-hidden flex mb-4" aria-hidden="true">
          {sorted.map((item, i) => (
            <motion.div
              key={item.archetype}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
              className="h-full flex items-center justify-center"
              style={{ background: BAR_COLORS[i] }}
              title={`${ARCHETYPES[item.archetype].label}: ${Math.round(item.percentage)}%`}
            >
              {item.percentage > 12 && (
                <span className="text-white text-[10px] font-bold">{Math.round(item.percentage)}%</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="divide-y divide-[var(--color-border)]">
          {sorted.map((item, i) => {
            const archetype = ARCHETYPES[item.archetype];
            return (
              <div key={item.archetype} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BAR_COLORS[i] }} aria-hidden="true" />
                <span className="text-sm text-[var(--color-text)] flex-1">{getArchetypeDisplayNL(archetype.label)}</span>
                <span className="text-sm font-semibold text-[var(--ff-color-primary-700)] tabular-nums">{Math.round(item.percentage)}%</span>
              </div>
            );
          })}
        </div>

        {/* Confidence footer */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-muted)]">Profiel betrouwbaarheid</p>
            <p className="text-xs font-semibold text-[var(--color-text)] mt-0.5">{confidenceLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--ff-color-primary-700)] tabular-nums">{Math.round(confidence * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
