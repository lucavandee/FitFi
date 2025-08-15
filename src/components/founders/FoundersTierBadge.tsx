import React from 'react';
import { Award, Star, Crown, Gift } from 'lucide-react';
import Progress from '@/components/ui/Progress';
import { resolveTier } from '@/config/foundersTiers';

const ICONS = { Award, Star, Crown, Gift } as const;

type Props = {
  referrals: number;
  compact?: boolean;  // chip-variant inlined
  className?: string;
};

export default function FoundersTierBadge({ referrals, compact = false, className }: Props) {
  const { current, next, progress, base, nextAt } = resolveTier(referrals);
  const Icon = ICONS[current.icon];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink bg-gradient-to-r ${current.gradientClass} bg-clip-padding ${className ?? ''}`}
        aria-label={`Founders tier ${current.name}, ${referrals} referrals`}
        title={`${current.name} — ${referrals} referrals`}
      >
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ring-2 ${current.ringClass} bg-white/80`}>
          <Icon size={12} />
        </span>
        <span className="font-medium">{current.name}</span>
        <span className="text-gray-700">• {referrals}</span>
      </span>
    );
  }

  return (
    <div className={`card p-4 sm:p-5 bg-white ${className ?? ''}`} aria-label="Founders tier badge">
      <div className="flex items-center gap-3">
        <div className={`relative w-10 h-10 rounded-full ring-2 ${current.ringClass} bg-white flex items-center justify-center`}>
          <Icon size={18} />
          <span className="sr-only">{current.name} tier</span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">Founders Tier</div>
          <div className="text-ink font-semibold leading-tight">{current.name}</div>
        </div>
        <div className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-gradient-to-r ${current.gradientClass} text-ink`}>
          {referrals} referrals
        </div>
      </div>

      <div className="mt-4">
        <Progress
          value={progress}
          label={next ? `Volgende: ${next.name} bij ${nextAt} referrals` : `Max tier behaald — Legend`}
        />
        <div className="mt-2 text-xs text-gray-500">
          {next
            ? `${Math.max(0, (nextAt ?? 0) - referrals)} te gaan`
            : `Je hebt de hoogste tier bereikt 🎉`}
        </div>
      </div>
    </div>
  );
}