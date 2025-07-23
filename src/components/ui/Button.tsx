import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-full focus:outline-none transition-all';
  
  const variantClasses = {
    primary: 'bg-secondary text-primary shadow-lg hover:bg-secondary/90 focus:ring-4 focus:ring-secondary/50',
    secondary: 'bg-primary text-secondary border border-secondary hover:bg-primary-light hover:text-primary focus:ring-2 focus:ring-secondary',
    ghost: 'bg-transparent text-body border border-primary-light hover:bg-primary-light hover:text-secondary focus:ring-2 focus:ring-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600'
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;