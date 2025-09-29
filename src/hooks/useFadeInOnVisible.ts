import { useEffect, useRef, useState } from "react";

/**
 * Geeft ref + boolean `visible` terug. Zet bv. opacity/translate op basis van visible.
 * Respecteert prefers-reduced-motion: animatie wordt dan overgeslagen.
 */
export function useFadeInOnVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  return { ref, visible } as const;
}