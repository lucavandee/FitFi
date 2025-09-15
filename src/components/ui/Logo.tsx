import React from 'react';
import { Shirt, Sparkles } from 'lucide-react';

interface LogoProps {
    default: "text-[color:var(--ff-color-primary-700)]",
    light: "text-[color:var(--ff-color-accent)]", 
    dark: "text-[color:var(--ff-color-primary-600)]",

const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto', textColor = 'text-white' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <Shirt className="text-[#FF8600]" size={24} />
        <Sparkles className="text-[#0ea5e9] absolute -top-1 -right-1" size={12} />
      </div>
      <span className={`ml-2 font-display font-semibold text-xl ${textColor}`}>
        <span className="text-[#FF8600]">Fit</span>
        <span className="text-[#0ea5e9]">Fi</span>
      </span>
    </div>
  );
};

export default Logo;