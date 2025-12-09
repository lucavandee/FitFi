import React from 'react';
import { Shirt, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto', textColor = 'text-white' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <Shirt className="text-[var(--ff-color-primary-600)]" size={24} />
        <Sparkles className="text-[var(--ff-color-accent-600)] absolute -top-1 -right-1" size={12} />
      </div>
      <span className={`ml-2 font-display font-semibold text-xl ${textColor}`}>
        <span className="text-[var(--ff-color-primary-600)]">Fit</span>
        <span className="text-[var(--ff-color-accent-600)]">Fi</span>
      </span>
    </div>
  );
};

export default Logo;