import { motion } from "framer-motion";
import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";
import { getArchetypeDisplayNL } from "@/utils/displayNames";

interface ArchetypeScore {
  archetype: ArchetypeKey;
  percentage: number;
}

interface ArchetypeBreakdownProps {
  archetypeScores: ArchetypeScore[];
  confidence?: number;
  className?: string;
}

export function ArchetypeBreakdown({ archetypeScores, confidence = 0.7, className = "" }: ArchetypeBreakdownProps) {
  const top3 = archetypeScores.sort((a, b) => b.percentage - a.percentage).slice(0, 3);
  if (top3.length === 0) return null;

  const isHybrid = confidence < 0.7 || (top3.length >= 2 && top3[1].percentage > 25);
  const primary = top3[0];
  const secondary = top3.length >= 2 ? top3[1] : null;

  return (
    <div className={`bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] overflow-hidden ${className}`} style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
      <div className="px-5 sm:px-6 py-4 border-b border-[#E5E5E5]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] mb-0.5">Stijl archetypen</p>
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          {isHybrid && secondary
            ? `${ARCHETYPES[primary.archetype].label} × ${ARCHETYPES[secondary.archetype].label}`
            : ARCHETYPES[primary.archetype].label}
        </h3>
        {isHybrid && secondary && (
          <p className="text-xs text-[#8A8A8A] mt-0.5">Hybride stijl — combineert meerdere elementen</p>
        )}
      </div>

      <div className="divide-y divide-[#E5E5E5]">
        {top3.map((item, index) => {
          const archetype = ARCHETYPES[item.archetype];
          const isPrimary = index === 0;

          return (
            <div key={item.archetype} className={`px-5 sm:px-6 py-4 ${isPrimary ? 'bg-[#FAF5F2]' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${isPrimary ? 'bg-[#A8513A] text-white' : 'bg-[#E5E5E5] text-[#8A8A8A]'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className={`text-sm font-semibold ${isPrimary ? 'text-[#8A3D28]' : 'text-[#1A1A1A]'}`}>
                      {getArchetypeDisplayNL(archetype.label)}
                    </span>
                    <span className={`text-sm font-bold tabular-nums ${isPrimary ? 'text-[#A8513A]' : 'text-[#8A8A8A]'}`}>
                      {Math.round(item.percentage)}%
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.15, duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: isPrimary ? '#C2654A' : '#D4856E' }}
                    />
                  </div>

                  <p className="text-xs text-[#8A8A8A]">
                    {archetype.vibe.slice(0, 3).map((v, i) => (
                      <span key={i}>{i > 0 && ' · '}<span className="capitalize">{v}</span></span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 sm:px-6 py-3 border-t border-[#E5E5E5]">
        <p className="text-xs text-[#8A8A8A] leading-relaxed">
          Deze mix bepaalt welke outfits en kleuren het beste bij je passen.
        </p>
      </div>
    </div>
  );
}
