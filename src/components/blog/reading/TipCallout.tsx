import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TipCalloutProps {
  children: React.ReactNode;
  variant?: 'tip' | 'warning' | 'info';
}

export const TipCallout: React.FC<TipCalloutProps> = ({
  children,
  variant = 'tip'
}) => {
  const styles = {
    tip: {
      bg: 'bg-[var(--ff-color-primary-50)]',
      border: 'border-[var(--ff-color-primary-200)]',
      icon: 'text-[var(--ff-color-primary-600)]',
      text: 'text-[var(--color-text)]'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-900'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    }
  };

  const style = styles[variant];

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-[var(--radius-lg)] p-6 my-8`}>
      <div className="flex gap-4">
        <Lightbulb className={`flex-shrink-0 w-6 h-6 ${style.icon}`} />
        <div className={`flex-1 ${style.text} leading-relaxed`}>
          {children}
        </div>
      </div>
    </div>
  );
};
