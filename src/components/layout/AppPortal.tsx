import React from 'react';
import { createPortal } from 'react-dom';

interface AppPortalProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Robust portal component that creates target element if it doesn't exist
 * Prevents null target errors and ensures consistent portal behavior
 */
const AppPortal: React.FC<AppPortalProps> = ({ 
  children, 
  id = 'app-portal',
  className = ''
}) => {
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Get or create the target element
    let element = document.getElementById(id);
    
    if (!element) {
      // Create the target element if it doesn't exist
      element = document.createElement('div');
      element.id = id;
      element.className = className;
      document.body.appendChild(element);
    }
    
    setTargetElement(element);
    
    // Don't remove element on unmount to prevent flickering
    // The element will be reused for subsequent portal renders
  }, [id, className]);

  // Only render portal when target element is available
  if (!targetElement) {
    return null;
  }

  return createPortal(children, targetElement);
};

export default AppPortal;