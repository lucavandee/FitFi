import { useEffect } from "react";

/**
 * iOS-veilige body scroll-lock.
 * - Bewaart scrollpositie
 * - Zet body fixed zodat er géén bleed is (ook niet in Safari)
 * - Herstelt exact naar de oude positie bij unlock
 */
export default function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollY = window.scrollY || window.pageYOffset;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    // Lock
    html.style.overflow = "hidden"; // voorkomt ook pinch-scroll
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    // Unlock
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}