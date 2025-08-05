import React from 'react';
import { createPortal } from 'react-dom';

interface AppPortalProps {
  children: React.ReactNode;
  target?: string;
  className?: string;
}

/**
 * Portal component for rendering content outside the normal component tree
 * Useful for modals, tooltips, and floating elements that need to escape z-index stacking
 */
const AppPortal: React.FC<AppPortalProps> = ({ 
  children, 
  target = '#nova-root',
  className = ''
}) => {
  // Get or create the target element
  const getTargetElement = (): HTMLElement => {
    let element = document.querySelector(target) as HTMLElement;
    
    if (!element) {
      // Create the target element if it doesn't exist
      element = document.createElement('div');
      element.id = target.replace('#', '');
      element.className = className;
      document.body.appendChild(element);
    }
    
    return element;
  };

  // Only render on client side
  if (typeof window === 'undefined') {
    return null;
  }

  const targetElement = getTargetElement();
  
  return createPortal(children, targetElement);
};

export default AppPortal;