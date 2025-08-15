import React from 'react';
import { Sparkles, Shield, Users, Star, Crown, Wand2, Ticket, Gift, Headphones, Video, Trophy, CheckCircle, Lock } from 'lucide-react';
import { allPerksSorted } from '@/config/foundersTiers';

const ICONS = { Sparkles, Shield, Users, Star, Crown, Wand2, Ticket, Gift, Headphones, Video, Trophy } as const;

type Props = {
  referrals: number;
  className?: string;
};

export default function FoundersTierPerks({ referrals, className }: Props) {
  const perks = allPerksSorted();
  const unlocked = perks.filter(p => referrals >= p.unlockedAt);
  const upcoming = perks.filter(p => referrals < p.unlockedAt).slice(0, 6); // limiet voor rust

  return (
    <div className={className}>
      <section aria-labelledby="perk-owned">
        <h3 id="perk-owned" className="text-sm font-semibold text-ink mb-3">Jouw voordelen</h3>
        {unlocked.length === 0 ? (
          <div className="text-sm text-gray-500 mb-4">Nodig vrienden uit om perks te ontgrendelen.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
            {unlocked.map(p => {
              const Icon = p.icon ? ICONS[p.icon] : Sparkles;
              return (
                <li key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-white shadow-sm">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700">
                    <CheckCircle size={14} />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-ink">{p.label}</div>
                    <div className="text-xs text-gray-500">Ontgrendeld bij {p.unlockedAt} referrals</div>
                  </div>
                  <span className="opacity-70"><Icon size={16} /></span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="perk-next" className="mt-6">
        <h3 id="perk-next" className="text-sm font-semibold text-ink mb-3">Volgende unlocks</h3>
        {upcoming.length === 0 ? (
          <div className="text-sm text-gray-500">Je hebt alles ontgrendeld — Legend status 🎉</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
            {upcoming.map(p => {
              const Icon = p.icon ? ICONS[p.icon] : Sparkles;
              const remaining = Math.max(0, p.unlockedAt - referrals);
              return (
                <li key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600">
                    <Lock size={14} />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-ink">{p.label}</div>
                    <div className="text-xs text-gray-500">{remaining} te gaan — unlock bij {p.unlockedAt}</div>
                  </div>
                  <span className="opacity-70"><Icon size={16} /></span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}