import React from 'react';
import { ShieldCheck, Truck, RefreshCcw, CreditCard } from 'lucide-react';

const trustSignals = [
  { icon: <Truck className="w-3.5 h-3.5" aria-hidden="true" />, label: 'Gratis verzending' },
  { icon: <RefreshCcw className="w-3.5 h-3.5" aria-hidden="true" />, label: '30 dagen retour' },
  { icon: <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />, label: 'Veilig betalen' },
  { icon: <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />, label: 'Achteraf betalen' },
];

export function TrustSignals() {
  return (
    <div className="flex items-center flex-wrap gap-x-5 gap-y-2 py-3 border-y border-[var(--color-border)]">
      {trustSignals.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[var(--ff-color-primary-600)] shrink-0">{s.icon}</span>
          <span className="text-[11px] text-[var(--color-muted)] whitespace-nowrap font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
