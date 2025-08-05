import React, { Suspense } from 'react';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

// Lazy load icon components for better performance
const LazyIcon: React.FC<{ iconName: string } & Omit<IconProps, 'name'>> = ({ 
  iconName, 
  size = 24, 
  className = '',
  'aria-label': ariaLabel
}) => {
  const IconComponent = React.lazy(async () => {
    try {
      const module = await import('lucide-react');
      const Component = module[iconName as keyof typeof module] as LucideIcon;
      
      if (!Component) {
        throw new Error(`Icon ${iconName} not found`);
      }
      
      return { default: Component };
    } catch (error) {
      console.warn(`Failed to load icon: ${iconName}`, error);
      // Fallback to a default icon
      const { HelpCircle } = await import('lucide-react');
      return { default: HelpCircle };
    }
  });

  return (
    <Suspense fallback={<div className={`${className} animate-pulse bg-gray-200 rounded`} style={{ width: size, height: size }} />}>
      <IconComponent 
        size={size} 
        className={className}
        aria-label={ariaLabel || iconName}
      />
    </Suspense>
  );
};

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  return <LazyIcon iconName={name} {...props} />;
};

export default Icon;