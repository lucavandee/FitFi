import React from 'react';
import { Check } from 'lucide-react';

type Props = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Chip({ icon, children, className }: Props) {
  return (
    <span className={`ff-chip ${className ?? ''}`}>
      {icon ?? <Check size={16} className="opacity-70" />}
      <span className="text-gray-700">{children}</span>
    </span>
  );
}