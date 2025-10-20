interface TierDistributionChartProps {
  tiers: {
    free: number;
    premium: number;
    founder: number;
  };
  total: number;
}

export default function TierDistributionChart({ tiers, total }: TierDistributionChartProps) {
  const data = [
    {
      label: 'Free',
      value: tiers.free,
      color: 'var(--color-text-secondary)',
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      icon: '👤',
    },
    {
      label: 'Premium',
      value: tiers.premium,
      color: 'var(--ff-color-primary-600)',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      icon: '💎',
    },
    {
      label: 'Founder',
      value: tiers.founder,
      color: 'var(--ff-color-accent-600)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      icon: '⭐',
    },
  ];

  const totalRevenue = tiers.premium * 9.99 + tiers.founder * 299;
  const conversionRate = total > 0 ? (((tiers.premium + tiers.founder) / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">💰 Tier Verdeling</h3>
        <div className="text-right">
          <div className="text-sm font-bold text-[var(--color-text)]">{conversionRate}%</div>
          <div className="text-xs text-[var(--color-text-secondary)]">Conversion</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.map((tier) => {
          const percentage = total > 0 ? ((tier.value / total) * 100).toFixed(1) : 0;

          return (
            <div
              key={tier.label}
              className="relative p-4 rounded-xl overflow-hidden group cursor-pointer transition-transform hover:scale-105"
              style={{ background: tier.gradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-white">
                <div className="text-2xl mb-2">{tier.icon}</div>
                <div className="text-2xl font-bold mb-1">{tier.value}</div>
                <div className="text-xs opacity-90">{tier.label}</div>
                <div className="text-lg font-semibold mt-1">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-4 bg-[var(--color-bg)] rounded-full overflow-hidden flex">
        {data.map((tier, index) => {
          const percentage = total > 0 ? (tier.value / total) * 100 : 0;
          return (
            <div
              key={tier.label}
              className="relative transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                background: tier.gradient,
                borderRadius:
                  index === 0
                    ? '9999px 0 0 9999px'
                    : index === data.length - 1
                    ? '0 9999px 9999px 0'
                    : '0',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
        <div className="bg-[var(--color-bg)] rounded-lg p-3">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Geschatte MRR</div>
          <div className="text-xl font-bold text-[var(--color-text)]">
            €{(tiers.premium * 9.99).toFixed(2)}
          </div>
        </div>
        <div className="bg-[var(--color-bg)] rounded-lg p-3">
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">Lifetime Value</div>
          <div className="text-xl font-bold text-[var(--color-text)]">
            €{totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
