import React from 'react';
import { theme } from '@/styles/tokens';

// Since Framer Motion is not installed, we'll use CSS animations with React
interface MotionProps {
  children: React.ReactNode;
  animation?: keyof typeof theme.animations;
  delay?: number;
  duration?: number;
  className?: string;
  as?: React.ElementType;
}

const Motion: React.FC<MotionProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const animationPreset = theme.animations[animation];
  
  const style: React.CSSProperties = {
    animationDelay: `${delay}ms`,
    animationDuration: duration ? `${duration}ms` : undefined,
    animationFillMode: 'both'
  };

  // Convert Framer Motion config to CSS classes
  const getAnimationClass = () => {
    switch (animation) {
      case 'fadeIn':
        return 'animate-fade-in';
      case 'slideUp':
        return 'animate-slide-up';
      case 'scaleIn':
        return 'animate-scale-in';
      case 'slideInRight':
        return 'animate-slide-in-right';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <Component
      className={`${getAnimationClass()} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

// Preset motion components
export const FadeIn: React.FC<Omit<MotionProps, 'animation'>> = (props) => (
  <Motion animation="fadeIn" {...props} />
);

export const SlideUp: React.FC<Omit<MotionProps, 'animation'>> = (props) => (
  <Motion animation="slideUp" {...props} />
);

export const ScaleIn: React.FC<Omit<MotionProps, 'animation'>> = (props) => (
  <Motion animation="scaleIn" {...props} />
);

export const SlideInRight: React.FC<Omit<MotionProps, 'animation'>> = (props) => (
  <Motion animation="slideInRight" {...props} />
);

// Stagger children animation
export const StaggerChildren: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 100, className = '' }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <Motion
          key={index}
          animation="fadeIn"
          delay={index * staggerDelay}
        >
          {child}
        </Motion>
      ))}
    </div>
  );
};

// Confetti animation for celebrations
export const ConfettiTrigger: React.FC<{
  trigger: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
}> = ({ trigger, onComplete, children }) => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      
      // Create confetti elements
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-toast';
      document.body.appendChild(confettiContainer);

      // Generate confetti particles
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'absolute w-2 h-2 rounded-full animate-bounce';
        confetti.style.backgroundColor = ['#89CFF0', '#0D1B2A', '#F6F6F6'][Math.floor(Math.random() * 3)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
      }

      // Cleanup after animation
      setTimeout(() => {
        document.body.removeChild(confettiContainer);
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, onComplete]);

  return <>{children}</>;
};

export default Motion;