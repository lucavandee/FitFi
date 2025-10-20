interface GrowthChartProps {
  data: {
    last_7d: number;
    last_30d: number;
    last_90d: number;
  };
  totalUsers: number;
}

export default function GrowthChart({ data, totalUsers }: GrowthChartProps) {
  const maxValue = Math.max(data.last_7d, data.last_30d, data.last_90d);

  const bars = [
    { label: '7 dagen', value: data.last_7d, color: 'var(--ff-color-primary-600)' },
    { label: '30 dagen', value: data.last_30d, color: 'var(--ff-color-primary-700)' },
    { label: '90 dagen', value: data.last_90d, color: 'var(--ff-color-primary-800)' },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">
        📈 Groei Overzicht
      </h3>

      <div className="space-y-6">
        {bars.map((bar) => {
          const percentage = maxValue > 0 ? (bar.value / maxValue) * 100 : 0;
          const growthRate = totalUsers > 0 ? ((bar.value / totalUsers) * 100).toFixed(1) : 0;

          return (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {bar.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-text)]">
                    {bar.value}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    ({growthRate}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: bar.color,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{data.last_7d}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Deze week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{data.last_30d}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Deze maand</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{data.last_90d}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Dit kwartaal</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
