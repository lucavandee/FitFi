import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';

/**
 * Subtle FAB (Floating Action Button)
 * Minder opdringerig dan grote bar
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

  const handleClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[51] transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-[var(--color-text)] text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
          Start gratis quiz
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--color-text)]"></div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => !showTooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white/20"
        aria-label="Start gratis quiz"
      >
        <Sparkles className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />

        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-[var(--ff-color-primary-500)] opacity-0 group-hover:opacity-20 animate-ping"></div>
      </button>
    </div>
  );
}
