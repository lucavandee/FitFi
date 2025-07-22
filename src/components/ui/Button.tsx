import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  as?: React.ElementType;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  [key: string]: any;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      className = '',
      icon,
      iconPosition = 'left',
      as,
      to,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 focus:ring-orange-500',
      secondary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-600',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent focus:ring-orange-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-600',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-base',
    };

    const baseStyle = `
      inline-flex items-center justify-center 
      font-medium rounded-full 
      border 
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit
    `;

    const widthStyle = fullWidth ? 'w-full' : '';

    const buttonStyle = `
      ${baseStyle} 
      ${variantStyles[variant]} 
      ${sizeStyles[size]} 
      ${widthStyle} 
      ${className}
    `;

    const content = (
      <>
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </>
    );

    const Component = as || 'button';

    if (Component === Link) {
      return (
        <Link to={to || '#'} className={buttonStyle} {...props}>
          {content}
        </Link>
      );
    }

    return (
      <Component
        type={type}
        className={buttonStyle}
        disabled={disabled}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;