import React, { useState, useRef } from 'react';
import { ButtonProps } from './Button';

interface AdvancedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  loadingText?: string;
  successText?: string;
  successDuration?: number;
}

const AdvancedButton: React.FC<AdvancedButtonProps> = ({
  children,
  hapticFeedback = false,
  rippleEffect = true,
  loadingText = 'Loading...',
  successText = 'Success!',
  successDuration = 2000,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const createRipple = (event: React.MouseEvent) => {
    if (!rippleEffect || !buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || isSuccess) return;

    triggerHaptic();
    createRipple(event);

    if (onClick) {
      setIsLoading(true);
      try {
        await onClick(event);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), successDuration);
      } catch (error) {
        console.error('Button action failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonContent = () => {
    if (isSuccess) return successText;
    if (isLoading) return loadingText;
    return children;
  };

  const getButtonClass = () => {
    let baseClass = `relative overflow-hidden transition-all duration-200 ${className}`;
    
    if (isSuccess) {
      baseClass += ' bg-green-500 hover:bg-green-600 text-white border-green-500';
    }
    
    if (isLoading) {
      baseClass += ' cursor-wait';
    }

    return baseClass;
  };

  return (
    <button
      ref={buttonRef}
      className={getButtonClass()}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '100px',
            height: '100px',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {isSuccess && (
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {getButtonContent()}
      </span>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

export default AdvancedButton;