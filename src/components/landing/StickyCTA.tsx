import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

/**
 * Sticky CTA - Mobile Thumb-Friendly FAB
 *
 * WCAG 2.1 AA Compliant:
 * - 56px touch target (>44px minimum)
 * - Focus-visible keyboard state
 * - Positioned in mobile thumb zone (bottom-24 = 96px from bottom)
 * - Escape key to dismiss
 * - Benefits-driven tooltip (not process-focused)
 */
export function StickyCTA() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 100vh
      const scrolled = window.scrollY > window.innerHeight;

      // Hide when near bottom (300px from footer)
      const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300;

      setIsVisible(scrolled && !isDismissed && !nearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // Show tooltip after 2 seconds, once
  useEffect(() => {
    if (isVisible && !showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Hide tooltip after 3 seconds
        setTimeout(() => setShowTooltip(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, showTooltip]);

  // Keyboard support: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsDismissed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/registreren');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[51] transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      role="complementary"
      aria-label="Snelle actie knop"
    >
      {/* Tooltip - Benefits-driven */}
      {showTooltip && (
        <div
          className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-[var(--color-text)] text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300"
          role="tooltip"
          id="fab-tooltip"
        >
          Ontvang je stijladvies
          <div
            className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--color-text)]"
            aria-hidden="true"
          ></div>
        </div>
      )}

      {/* FAB Button - 56px for mobile thumb zone */}
      <button
        onClick={handleClick}
        onMouseEnter={() => !showTooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
        aria-label="Ontvang gratis persoonlijk stijladvies"
        aria-describedby={showTooltip ? "fab-tooltip" : undefined}
      >
        {/* Inline SVG Sparkles Icon - guaranteed visible */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:rotate-12"
          aria-hidden="true"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>

        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full bg-[var(--ff-color-primary-500)] opacity-0 group-hover:opacity-20 animate-ping"
          aria-hidden="true"
        ></div>
      </button>

      {/* Dismiss hint for keyboard users (screen reader only) */}
      <div className="sr-only" role="status" aria-live="polite">
        Druk op Escape om deze knop te verbergen
      </div>
    </div>
  );
}
