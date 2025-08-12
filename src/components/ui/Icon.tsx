import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  className = '',
  strokeWidth = 2,
  ...props
}) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<any>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
};

// Preset icon components for common use cases
export const ChevronIcon: React.FC<{ 
  direction: 'up' | 'down' | 'left' | 'right';
  size?: number;
  className?: string;
}> = ({ direction, size = 16, className = '' }) => {
  const iconMap = {
    up: 'ChevronUp',
    down: 'ChevronDown',
    left: 'ChevronLeft',
    right: 'ChevronRight'
  } as const;

  return (
    <Icon 
      name={iconMap[direction]} 
      size={size} 
      className={className} 
    />
  );
};

export const StatusIcon: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info';
  size?: number;
  className?: string;
}> = ({ status, size = 16, className = '' }) => {
  const iconMap = {
    success: 'CheckCircle',
    warning: 'AlertTriangle',
    error: 'XCircle',
    info: 'Info'
  } as const;

  const colorMap = {
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    info: 'text-turquoise-500'
  };

  return (
    <Icon 
      name={iconMap[status]} 
      size={size} 
      className={`${colorMap[status]} ${className}`} 
    />
  );
};

export default Icon;