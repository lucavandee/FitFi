import React, { PictureHTMLAttributes } from 'react';

export interface PictureProps extends PictureHTMLAttributes<HTMLPictureElement> {
  alt: string;
  loading?: 'lazy' | '
  priority?: boolean;
  className?: string;
}

/**
 * Picture component for responsive images with vite-imagetools support
 * Automatically handles modern image formats and responsive breakpoints
 */
export function Picture({ 
  alt, 
  loading = 'lazy', 
  priority = false, 
  className = '',
  ...props 
}: PictureProps) {
  return (
    <picture 
      className={className}
      {...props}
    >
      {/* Children should be <source> and <img> elements from vite-imagetools */}
      {props.children}
    </picture>
  );
}

export default Picture;