import React from "react";
import { createPortal } from "react-dom";

interface AppPortalProps {
  children: React.ReactNode;
  target?: string;
  id?: string;
  className?: string;
}

/**
 * Robust portal component that creates target element if it doesn't exist
 * Prevents null target errors and ensures consistent portal behavior
 */
const AppPortal: React.FC<AppPortalProps> = ({
  children,
  target,
  id = "app-portal",
  className = "",
}) => {
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(
    null,
  );

  React.useEffect(() => {
    // Use target selector or fallback to id
    const selector = target || `#${id}`;
    let element = target
      ? (document.querySelector(selector) as HTMLElement)
      : document.getElementById(id);

    if (!element) {
      // Create the target element if it doesn't exist
      element = document.createElement("div");
      element.id = id;
      if (className) element.className = className;

      // Set default positioning for Nova
      if (id === "nova-root") {
        element.style.position = "fixed";
        element.style.right = "16px";
        element.style.bottom = "16px";
        element.style.zIndex = "9999";
        element.style.pointerEvents = "none";
      }

      document.body.appendChild(element);
    }

    setTargetElement(element);

    // Don't remove element on unmount to prevent flickering
    // The element will be reused for subsequent portal renders
  }, [target, id, className]);

  // Only render portal when target element is available
  if (!targetElement) {
    return null;
  }

  return createPortal(children, targetElement);
};

export default AppPortal;
