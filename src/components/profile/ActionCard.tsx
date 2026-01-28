import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'accent' | 'neutral';
  'aria-label': string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'primary',
  'aria-label': ariaLabel,
}) => {
  const variantStyles = {
    primary: {
      card: 'from-primary-25 to-accent-25 border-primary-100 hover:border-primary-500',
      iconBg: 'bg-primary-700',
    },
    accent: {
      card: 'from-accent-25 to-primary-25 border-accent-100 hover:border-accent-500',
      iconBg: 'bg-accent-600',
    },
    neutral: {
      card: 'from-gray-50 to-gray-100 border-border hover:border-primary-500',
      iconBg: 'bg-primary-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`group p-6 rounded-xl bg-gradient-to-br ${styles.card} border-2 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all text-left`}
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-text mb-1">{title}</div>
          <div className="text-sm text-muted">{description}</div>
        </div>
      </div>
    </button>
  );
};
