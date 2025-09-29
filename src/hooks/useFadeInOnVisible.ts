import { useEffect, useRef, useState } from "react";

/**
 * useFadeInOnVisible
 *
 * A simple hook that reveals an element when it enters the viewport.
 * It leverages the IntersectionObserver API and returns a ref to be
 * attached to the target element along with a boolean flag indicating
 * visibility. Consumers can use the flag to control inline styles or
 * class names for animations.
 */
export function useFadeInOnVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}