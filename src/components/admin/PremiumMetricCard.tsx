import { ReactNode } from 'react';

interface PremiumMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: ReactNode;
  gradient?: string;
}

export default function PremiumMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  gradient,
}: PremiumMetricCardProps) {
  return (
    <div
      className="group relative bg-[#FFFFFF] rounded-xl border border-[#E5E5E5] p-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
      style={{
        background: gradient
          ? `linear-gradient(135deg, ${gradient})`
          : '#FFFFFF',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{
                color: gradient ? 'rgba(255,255,255,0.9)' : '#8A8A8A',
              }}
            >
              {title}
            </p>
            <h3
              className="text-4xl font-bold tracking-tight"
              style={{
                color: gradient ? 'white' : '#1A1A1A',
              }}
            >
              {value}
            </h3>
          </div>
          {icon && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : '#FAFAF8',
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {subtitle && (
          <p
            className="text-sm mb-2"
            style={{
              color: gradient ? 'rgba(255,255,255,0.8)' : '#8A8A8A',
            }}
          >
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                trend.isPositive !== false
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {trend.isPositive !== false ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span
              className="text-xs"
              style={{
                color: gradient ? 'rgba(255,255,255,0.7)' : '#8A8A8A',
              }}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
