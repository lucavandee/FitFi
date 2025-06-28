import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`glass-card overflow-hidden ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`p-6 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardContentProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`p-6 border-b border-white/10 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardContentProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`p-6 border-t border-white/10 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};