import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. Uses useLayoutEffect for immediate scroll
 * before the browser paints the new content.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Scroll to top smoothly on route change
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
};
