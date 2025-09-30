import { useEffect } from "react";

/**
 * Body scroll lock die ook in iOS/Safari betrouwbaar werkt.
 * - Bewaart huidige scrollpositie
 * - Zet body fixed met negatieve top offset
 * - Herstelt exact naar oude positie bij unlock
 */
export default function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    const scrollY = window.scrollY || window.pageYOffset;

    // Lock
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      // Unlock
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}