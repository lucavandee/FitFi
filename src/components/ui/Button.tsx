import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  as?: React.ElementType;
  to?: string;
  href?: string;
  [key: string]: any;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      onClick,
      type = 'button',
      className = '',
      as,
      to,
      href,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-[var(--ff-color-primary-600)] text-white hover:bg-[var(--ff-color-primary-700)] focus-visible:ring-[var(--ff-color-primary-600)]',
      secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]',
      outline: 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]',
      ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600'
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)]',
      md: 'px-4 py-2 text-base rounded-[var(--radius-lg)]',
      lg: 'px-6 py-3 text-lg rounded-[var(--radius-xl)]'
    };

    const classes = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const content = loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {children}
      </>
    ) : children;

    if (as === Link || to) {
      return (
        <Link to={to!} className={classes} {...props}>
          {content}
        </Link>
      );
    }

    if (href) {
      return (
        <a href={href} className={classes} {...props}>
          {content}
        </a>
      );
    }

    const Component = as || 'button';

    return (
      <Component
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={classes}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
