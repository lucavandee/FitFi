import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { 
        setInView(true); 
        io.disconnect(); 
      }
    }, { rootMargin: "120px 0px", threshold: 0.1, ...options });

    io.observe(ref.current);
    return () => io.disconnect();
  }, [options]);

  return { ref, inView };
}