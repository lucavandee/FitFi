import { useEffect, useState } from "react";

/**
 * Of een mediaquery nu klopt, en opnieuw bij elke wissel. Zonder window (render
 * op de server, tests) is het antwoord nee.
 */
export function useMediaquery(vraag: string): boolean {
  const [klopt, setKlopt] = useState(() => {
    try {
      return typeof window !== "undefined" && window.matchMedia(vraag).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(vraag);
    } catch {
      return;
    }
    const luister = (e: MediaQueryListEvent) => setKlopt(e.matches);
    setKlopt(mq.matches);
    mq.addEventListener("change", luister);
    return () => mq.removeEventListener("change", luister);
  }, [vraag]);

  return klopt;
}
