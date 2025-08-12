import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-200 bg-white focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500',
    filled: 'border-0 bg-gray-100 focus:ring-2 focus:ring-turquoise-500 focus:bg-white',
    outline: 'border-2 border-gray-300 bg-transparent focus:ring-0 focus:border-turquoise-500'
  };

  const baseClasses = 'rounded-2xl transition-all duration-normal placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  const iconPadding = leftIcon ? 'pl-12' : rightIcon ? 'pr-12' : '';

  const inputClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${errorClasses} ${widthClasses} ${iconPadding} ${className}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-2 text-sm text-error-600"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-2 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;