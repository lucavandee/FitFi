import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface InfoSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  delay?: number;
  variant?: 'default' | 'gradient';
  className?: string;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  id,
  icon: Icon,
  title,
  children,
  delay = 0,
  variant = 'default',
  className = '',
}) => {
  const cardClasses =
    variant === 'gradient'
      ? 'p-6 rounded-xl bg-gradient-to-br from-primary-25 to-accent-25 border border-primary-100'
      : 'p-6 rounded-xl bg-surface border border-border';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`mb-8 ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <h2
        id={`${id}-heading`}
        className="text-xl font-bold text-text mb-4 flex items-center gap-2"
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
        {title}
      </h2>
      <div className={cardClasses}>{children}</div>
    </motion.section>
  );
};
