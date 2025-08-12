import React from 'react';
import { theme } from '@/styles/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  as?: React.ElementType;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  as: Component = 'div',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white shadow-card rounded-2xl',
    elevated: 'bg-white shadow-xl rounded-3xl',
    glass: 'bg-white/80 backdrop-blur-sm shadow-glass rounded-2xl border border-white/20'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const baseClasses = 'transition-all duration-normal';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-xl hover:transform hover:scale-[1.02]' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`;

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;