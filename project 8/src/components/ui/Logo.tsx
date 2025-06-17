import React from 'react';
import { Shirt, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <Shirt className="text-orange-500" size={24} />
        <Sparkles className="text-blue-600 absolute -top-1 -right-1" size={12} />
      </div>
      <span className="ml-2 font-bold text-xl">
        <span className="text-orange-500">Fit</span>
        <span className="text-blue-600">Fi</span>
      </span>
    </div>
  );
};

export default Logo;