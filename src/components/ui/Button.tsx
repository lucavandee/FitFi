import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'a' | typeof Link;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'data-ab-variant'?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  as = 'button',
  to,
  href,
  target,
  rel,
  'aria-label': ariaLabel,
  'aria-busy': ariaBusy,
  'data-ab-variant': abVariant,
  title,
  ...rest
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const variantClasses = {
    primary: 'bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] focus:ring-[#89CFF0]',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-2xl'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size]
  ].join(' ');

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  const commonProps = {
    className: classes,
    disabled: disabled || loading,
    'aria-label': ariaLabel,
    'aria-busy': ariaBusy || loading,
    'data-ab-variant': abVariant,
    title,
    ...rest
  };

  if (as === 'a') {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        {...commonProps}
      >
        {content}
      </a>
    );
  }

  if (as === Link) {
    return (
      <Link
        to={to || '/'}
        {...commonProps}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      {...commonProps}
    >
      {content}
    </button>
  );
};

export default Button;