import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'subtle' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-turquoise-500 text-midnight-900',
    secondary: 'bg-midnight-500 text-white',
    subtle: 'bg-gray-100 text-gray-700',
    success: 'bg-success-50 text-success-600 border border-success-200',
    warning: 'bg-warning-50 text-warning-600 border border-warning-200',
    error: 'bg-error-50 text-error-600 border border-error-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;